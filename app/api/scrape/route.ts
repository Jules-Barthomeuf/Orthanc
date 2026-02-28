/**
 * POST /api/scrape
 * Scrape property info from a listing URL.
 * Body: { url: string }
 *
 * ZERO external dependencies — uses regex only (no cheerio) to stay under 512MB RAM.
 * Includes timeout, size limit, gzip support, and graceful handling of bot-blocked pages.
 */

import { gunzipSync } from "zlib";

export const runtime = "nodejs";
export const maxDuration = 15; // seconds (Vercel/Render)

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return Response.json({ error: "Invalid URL format" }, { status: 400 });
    }

    console.log(`[scrape] Fetching: ${parsedUrl.hostname}${parsedUrl.pathname.slice(0, 80)}`);

    // ── Fetch with timeout + size limit ──
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000); // 12s max

    let html: string;
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Referer: `${parsedUrl.protocol}//${parsedUrl.hostname}/`,
          "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "Upgrade-Insecure-Requests": "1",
          DNT: "1",
        },
        redirect: "follow",
      });

      clearTimeout(timeout);

      console.log(`[scrape] Response: ${res.status} ${res.statusText}, content-type: ${res.headers.get("content-type")}, encoding: ${res.headers.get("content-encoding")}`);

      if (!res.ok) {
        const isBlocked = res.status === 403 || res.status === 429;
        return Response.json(
          {
            error: isBlocked
              ? "This site blocked our request (bot protection). Try pasting the property details manually."
              : `Failed to fetch page (HTTP ${res.status})`,
          },
          { status: isBlocked ? 403 : 502 },
        );
      }

      // Read raw bytes, max 2MB
      const MAX_SIZE = 2_000_000;
      const reader = res.body?.getReader();
      if (!reader) {
        return Response.json({ error: "Could not read page" }, { status: 502 });
      }

      const chunks: Uint8Array[] = [];
      let totalSize = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        totalSize += value.length;
        if (totalSize > MAX_SIZE) {
          reader.cancel();
          break;
        }
      }

      const rawBytes = chunks.reduce((acc, chunk) => {
        const merged = new Uint8Array(acc.length + chunk.length);
        merged.set(acc);
        merged.set(chunk, acc.length);
        return merged;
      }, new Uint8Array());

      // Decompress if needed
      const encoding = res.headers.get("content-encoding")?.toLowerCase() || "";
      if (encoding.includes("gzip") || encoding.includes("deflate")) {
        try {
          html = new TextDecoder().decode(gunzipSync(Buffer.from(rawBytes)));
        } catch {
          // If decompression fails, try as-is (maybe not actually compressed)
          html = new TextDecoder().decode(rawBytes);
        }
      } else {
        html = new TextDecoder().decode(rawBytes);
      }

      console.log(`[scrape] HTML length: ${html.length} chars (raw bytes: ${totalSize})`);
    } catch (err: any) {
      clearTimeout(timeout);
      if (err?.name === "AbortError") {
        return Response.json(
          { error: "Request timed out — the site took too long to respond." },
          { status: 504 },
        );
      }
      console.error(`[scrape] Fetch error: ${err?.message}`);
      return Response.json(
        { error: "Could not reach the site: " + (err?.message || "Network error") },
        { status: 502 },
      );
    }

    // ── Check if page is a real CAPTCHA page (strict check) ──
    // Only flag as CAPTCHA if:
    //  - Page is very short (<8KB) AND has captcha/block signals
    //  - OR it's a known challenge page
    const isShortPage = html.length < 8000;
    const lowerHtml = html.slice(0, 10000).toLowerCase();
    const hasCaptchaSignal =
      (lowerHtml.includes("captcha") && !lowerHtml.includes("<html")) ||
      lowerHtml.includes("please verify you are a human") ||
      lowerHtml.includes("access denied") ||
      (lowerHtml.includes("cf-challenge") && isShortPage) ||
      (lowerHtml.includes("just a moment") && lowerHtml.includes("cloudflare") && isShortPage);

    if (isShortPage && hasCaptchaSignal) {
      console.log(`[scrape] CAPTCHA detected (html length: ${html.length})`);
      return Response.json(
        { error: "This site returned a CAPTCHA or challenge page. Try pasting the property info manually." },
        { status: 403 },
      );
    }

    // ── Extract data using REGEX only (no cheerio = no memory spike) ──
    let property: ScrapedData = {};

    // Strategy 1: JSON-LD (best structured data)
    property = extractJsonLd(html);
    if (property.title) console.log("[scrape] Strategy 1 (JSON-LD) matched");

    // Strategy 2: __NEXT_DATA__ (Zillow/modern sites)
    if (!property.title) {
      const nextData = extractNextData(html);
      property = mergeData(property, nextData);
      if (nextData.title) console.log("[scrape] Strategy 2 (__NEXT_DATA__) matched");
    }

    // Strategy 3: Open Graph meta tags
    if (!property.title) {
      const metaData = extractMetaTags(html);
      property = mergeData(property, metaData);
      if (metaData.title) console.log("[scrape] Strategy 3 (meta tags) matched");
    }

    // Strategy 4: Common HTML patterns
    if (!property.title) {
      const htmlData = extractHtmlPatterns(html);
      property = mergeData(property, htmlData);
      if (htmlData.title) console.log("[scrape] Strategy 4 (HTML patterns) matched");
    }

    // Always merge all strategies for maximum data
    property = mergeData(property, extractMetaTags(html));
    property = mergeData(property, extractHtmlPatterns(html));

    // Strategy 5: Page title as last resort
    if (!property.title) {
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleMatch) {
        property.title = cleanText(
          titleMatch[1].replace(/\s*[\|–—-]\s*(Zillow|Redfin|Realtor|Trulia|Homes|MLS|Century|Coldwell|Sotheby|Compass|Keller).*$/i, ""),
        );
        console.log("[scrape] Strategy 5 (page title) used");
      }
    }

    if (!property.title && !property.address && !property.price) {
      console.log(`[scrape] No data extracted. HTML preview: ${html.slice(0, 300).replace(/\s+/g, ' ')}`);
      return Response.json(
        {
          error:
            "Could not extract property data from this page. The site may use JavaScript-only rendering or block scraping. Try pasting the info manually.",
        },
        { status: 422 },
      );
    }

    // ── Build result ──
    const result = {
      title: property.title || property.address || "Imported Property",
      address: property.address || property.title || "",
      price: property.price || 0,
      description: (property.description || "").slice(0, 2000),
      bedroom: property.bedroom || 0,
      bathroom: property.bathroom || 0,
      squareFeet: property.squareFeet || 0,
      yearBuilt: property.yearBuilt || 0,
      lot: property.lot || 0,
      images: [],
      sourceUrl: url,
    };

    console.log(`[scrape] Success: "${result.title}" — $${result.price}, ${result.bedroom}bd/${result.bathroom}ba`);

    return Response.json(result, { status: 200 });
  } catch (err: any) {
    console.error("[scrape] Error:", err?.message);
    return Response.json(
      { error: "Scraping failed: " + (err?.message || "Unknown error") },
      { status: 500 },
    );
  }
}

// ─── Types ───

interface ScrapedData {
  title?: string;
  address?: string;
  price?: number;
  description?: string;
  bedroom?: number;
  bathroom?: number;
  squareFeet?: number;
  yearBuilt?: number;
  lot?: number;
}

function mergeData(base: ScrapedData, extra: ScrapedData): ScrapedData {
  return {
    title: base.title || extra.title,
    address: base.address || extra.address,
    price: base.price || extra.price,
    description: base.description || extra.description,
    bedroom: base.bedroom || extra.bedroom,
    bathroom: base.bathroom || extra.bathroom,
    squareFeet: base.squareFeet || extra.squareFeet,
    yearBuilt: base.yearBuilt || extra.yearBuilt,
    lot: base.lot || extra.lot,
  };
}

function cleanText(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

// ─── Strategy 1: JSON-LD ───

function extractJsonLd(html: string): ScrapedData {
  const result: ScrapedData = {};
  try {
    const jsonLdRegex = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    const PROPERTY_TYPES = new Set([
      "SingleFamilyResidence", "Product", "RealEstateListing", "Residence",
      "House", "Apartment", "Accommodation", "LodgingBusiness",
      "Condominium", "TownHouse", "MultiFamilyResidence",
    ]);
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const raw = match[1].slice(0, 500_000); // cap parsing
        const data = JSON.parse(raw);
        // Flatten @graph if present
        const items: any[] = [];
        const flatten = (d: any) => {
          if (Array.isArray(d)) d.forEach(flatten);
          else if (d && typeof d === "object") {
            items.push(d);
            if (Array.isArray(d["@graph"])) d["@graph"].forEach(flatten);
          }
        };
        flatten(data);
        for (const item of items) {
          const t = item["@type"];
          const types = Array.isArray(t) ? t : [t];
          if (!types.some(tt => PROPERTY_TYPES.has(tt))) continue;
          result.title = result.title || item.name || item.headline;
          result.description = result.description || (typeof item.description === "string" ? item.description.slice(0, 2000) : undefined);
          if (item.address) {
            const a = item.address;
            result.address = result.address || [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode]
              .filter(Boolean).join(", ");
          }
          // Price: multiple possible locations
          if (!result.price) {
            const p = item.offers?.price || item.offers?.lowPrice || item.price;
            if (p) result.price = parseInt(String(p).replace(/[^\d]/g, ""));
          }
          if (!result.bedroom) result.bedroom = parseInt(item.numberOfRooms || item.numberOfBedrooms || item.bedrooms) || undefined;
          if (!result.bathroom) result.bathroom = parseInt(item.numberOfBathroomsTotal || item.numberOfBathrooms || item.bathrooms) || undefined;
          if (!result.squareFeet) {
            const fs = item.floorSize;
            if (fs?.value) result.squareFeet = parseInt(fs.value);
            else if (typeof fs === "number") result.squareFeet = fs;
          }
          if (!result.yearBuilt && item.yearBuilt) result.yearBuilt = parseInt(item.yearBuilt);
          if (!result.lot && item.lotSize?.value) result.lot = parseFloat(item.lotSize.value);
        }
      } catch {}
    }
  } catch {}
  return result;
}

// ─── Strategy 2: __NEXT_DATA__ ───

function extractNextData(html: string): ScrapedData {
  const result: ScrapedData = {};
  try {
    const match = html.match(/<script\s+id\s*=\s*["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
    if (!match) return result;

    // Only parse first 500KB of __NEXT_DATA__ to avoid memory spike
    const raw = match[1].slice(0, 500_000);
    const nextData = JSON.parse(raw);
    const props = nextData?.props?.pageProps;
    if (!props) return result;

    const p = props.property || props.initialReduxState?.gdp?.building;
    if (p) {
      result.title = p.streetAddress || p.address?.streetAddress;
      result.address = [
        p.streetAddress || p.address?.streetAddress,
        p.city || p.address?.city,
        p.state || p.address?.state,
        p.zipcode || p.address?.zipcode,
      ].filter(Boolean).join(", ");
      result.price = p.price || p.zestimate || p.listPrice;
      result.description = typeof p.description === "string" ? p.description.slice(0, 2000) : (p.homeDescription || "").slice(0, 2000);
      result.bedroom = p.bedrooms || p.beds;
      result.bathroom = p.bathrooms || p.baths;
      result.squareFeet = p.livingArea || p.livingAreaValue;
      result.yearBuilt = p.yearBuilt;
      if (p.lotSize) result.lot = Math.round((p.lotSize / 43560) * 100) / 100;
    }
  } catch {}
  return result;
}

// ─── Strategy 3: Meta tags (OG) ───

function extractMetaTags(html: string): ScrapedData {
  const result: ScrapedData = {};
  try {
    const getMeta = (name: string) => {
      const r = new RegExp(`<meta[^>]*(?:property|name)\\s*=\\s*["']${name}["'][^>]*content\\s*=\\s*["']([^"']+)["']`, "i");
      const r2 = new RegExp(`<meta[^>]*content\\s*=\\s*["']([^"']+)["'][^>]*(?:property|name)\\s*=\\s*["']${name}["']`, "i");
      return (html.match(r)?.[1] || html.match(r2)?.[1] || "").trim();
    };

    const ogTitle = getMeta("og:title");
    const ogDesc = getMeta("og:description") || getMeta("description");
    const ogSiteName = getMeta("og:site_name");

    const SITE_STRIP = /\s*[\|–—·-]\s*(Zillow|Redfin|Realtor\.com|Realtor|Trulia|Homes\.com|Homes|MLS|Century\s*21|Coldwell|Sotheby|Compass|Keller|RE\/MAX|Berkshire|Douglas\s*Elliman|opendoor).*$/i;

    if (ogTitle) {
      result.title = ogTitle.replace(SITE_STRIP, "").trim();
    }
    if (ogDesc) result.description = ogDesc.slice(0, 2000);

    // Extract numbers from title + description
    const text = (ogTitle || "") + " " + (ogDesc || "");
    const priceMatch = text.match(/\$\s*([\d,]+(?:\.\d+)?)/);
    if (priceMatch) {
      const val = parseInt(priceMatch[1].replace(/,/g, ""));
      if (val > 10000) result.price = val;
    }

    const bedMatch = text.match(/(\d+)\s*(?:bed(?:room)?s?|bd|br)\b/i);
    const bathMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:bath(?:room)?s?|ba)\b/i);
    const sqftMatch = text.match(/([\d,]+)\s*(?:sq\s*\.?\s*ft|sqft|sf|square\s*feet)/i);

    if (bedMatch) result.bedroom = parseInt(bedMatch[1]);
    if (bathMatch) result.bathroom = Math.ceil(parseFloat(bathMatch[1]));
    if (sqftMatch) result.squareFeet = parseInt(sqftMatch[1].replace(/,/g, ""));

    // Address from og:title if it looks like an address
    if (ogTitle && /\d+\s+\w+/.test(ogTitle)) {
      result.address = ogTitle.replace(SITE_STRIP, "").trim();
    }
    // Also try twitter:title
    const twTitle = getMeta("twitter:title");
    if (!result.title && twTitle) {
      result.title = twTitle.replace(SITE_STRIP, "").trim();
    }
  } catch {}
  return result;
}

// ─── Strategy 4: Common HTML patterns ───

function extractHtmlPatterns(html: string): ScrapedData {
  const result: ScrapedData = {};
  try {
    // Title / address from h1
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      const text = cleanText(h1Match[1]);
      if (text.length > 3 && text.length < 200) {
        result.title = text;
        if (/\d+\s+\w+/.test(text)) result.address = text;
      }
    }

    // Price from common patterns
    const pricePatterns = [
      /data-testid="price"[^>]*>\s*\$?\s*([\d,]+)/i,
      /class="[^"]*price[^"]*"[^>]*>\s*\$?\s*([\d,]+)/i,
      /"price"\s*:\s*"?\$?([\d,]+)"?/i,
      /listing[_-]?price[^>]*>\s*\$?\s*([\d,]+)/i,
    ];
    for (const pattern of pricePatterns) {
      const m = html.match(pattern);
      if (m) {
        const val = parseInt(m[1].replace(/,/g, ""));
        if (val > 10000 && val < 1_000_000_000) {
          result.price = val;
          break;
        }
      }
    }

    // Beds/baths/sqft from page text (strip scripts/styles first)
    const textChunk = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").slice(0, 200_000);

    const bedMatch = textChunk.match(/(\d+)\s*(?:bed|bd|br|bedroom)/i);
    const bathMatch = textChunk.match(/(\d+(?:\.\d+)?)\s*(?:bath|ba|bathroom)/i);
    const sqftMatch = textChunk.match(/([\d,]+)\s*(?:sq\s*\.?\s*ft|sqft|sf|square\s*feet)/i);
    const yearMatch = textChunk.match(/(?:built|year\s*built|constructed)\s*(?:in\s*)?:?\s*(\d{4})/i);
    const lotMatch = textChunk.match(/([\d.]+)\s*(?:acre|ac)\b/i);

    if (bedMatch) result.bedroom = parseInt(bedMatch[1]);
    if (bathMatch) result.bathroom = parseFloat(bathMatch[1]);
    if (sqftMatch) result.squareFeet = parseInt(sqftMatch[1].replace(/,/g, ""));
    if (yearMatch) result.yearBuilt = parseInt(yearMatch[1]);
    if (lotMatch) result.lot = parseFloat(lotMatch[1]);

    // Description
    const descMatch = html.match(/(?:data-testid="description"|class="[^"]*description[^"]*")[^>]*>([\s\S]*?)<\/(?:div|p|section)/i);
    if (descMatch) {
      const desc = cleanText(descMatch[1]);
      if (desc.length > 30) result.description = desc.slice(0, 2000);
    }
  } catch {}
  return result;
}
