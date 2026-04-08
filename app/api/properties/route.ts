import {
  readProperties,
  readPropertySummaries,
  readPropertiesByAgent,
  readPropertySummariesByAgent,
  readPropertiesByIds,
  readPropertySummariesByIds,
  writePropertiesBulk,
  saveProperty,
  deleteProperty,
  updateProperty,
} from "@/lib/propertyStorage";
import { generateMarketData } from "@/lib/marketDataGenerator";

const SUMMARY_CACHE_TTL_MS = 30_000;
const summaryCache = new Map<string, { expiresAt: number; payload: string }>();

function getSummaryCacheKey(agentId: string | null, ids: string[]) {
  return JSON.stringify({ agentId: agentId ?? "", ids });
}

function getCachedSummary(cacheKey: string) {
  const cached = summaryCache.get(cacheKey);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    summaryCache.delete(cacheKey);
    return null;
  }
  return cached.payload;
}

function setCachedSummary(cacheKey: string, data: unknown) {
  summaryCache.set(cacheKey, {
    expiresAt: Date.now() + SUMMARY_CACHE_TTL_MS,
    payload: JSON.stringify(data),
  });
}

function clearSummaryCache() {
  summaryCache.clear();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId");
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  const summary = searchParams.get("summary");
  const isSummary = summary === "1" || summary === "true";
  const responseHeaders = {
    "Cache-Control": isSummary ? "private, max-age=30, stale-while-revalidate=60" : "private, max-age=5",
  };

  if (isSummary) {
    const cacheKey = getSummaryCacheKey(agentId, ids);
    const cachedPayload = getCachedSummary(cacheKey);
    if (cachedPayload) {
      return new Response(cachedPayload, {
        status: 200,
        headers: responseHeaders,
      });
    }
  }

  const properties = ids.length > 0
    ? isSummary
      ? await readPropertySummariesByIds(ids)
      : await readPropertiesByIds(ids)
    : agentId
      ? isSummary
        ? await readPropertySummariesByAgent(agentId)
        : await readPropertiesByAgent(agentId)
      : isSummary
        ? await readPropertySummaries()
        : await readProperties();

  if (!isSummary) {
    const enrichedProperties: typeof properties = [];
    for (let i = 0; i < properties.length; i++) {
      const p = properties[i];
      const md = p.marketData || {} as any;
      const inv = p.investmentAnalysis || {} as any;
      const hasMarket = md.neighborhood && md.city && md.demographics && md.marketTrends;
      const hasInvestment = inv.currentValue && inv.projectedValue5Year && inv.capRate;
      if ((!hasMarket || !hasInvestment) && p.address && p.price) {
        const generated = generateMarketData(p.address, p.price);
        let enriched = properties[i];
        if (!hasMarket) enriched = { ...enriched, marketData: generated.marketData };
        if (!hasInvestment) enriched = { ...enriched, investmentAnalysis: generated.investmentAnalysis };
        properties[i] = enriched;
        enrichedProperties.push(enriched);
      }
    }

    if (enrichedProperties.length > 0) {
      await writePropertiesBulk(enrichedProperties);
    }
  }

  if (isSummary) {
    setCachedSummary(getSummaryCacheKey(agentId, ids), properties);
  }

  return new Response(JSON.stringify(properties), {
    status: 200,
    headers: responseHeaders,
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body || !body.title) {
    return new Response(
      JSON.stringify({ error: "Invalid property data" }),
      { status: 400 },
    );
  }

  // Auto-generate market data if missing or incomplete
  let marketData = body.marketData || {};
  let investmentAnalysis = body.investmentAnalysis || {};
  const hasMarketData = marketData.neighborhood && marketData.city && marketData.demographics && marketData.marketTrends;
  const hasInvestmentData = investmentAnalysis.currentValue && investmentAnalysis.projectedValue5Year;

  if ((!hasMarketData || !hasInvestmentData) && body.address && body.price) {
    const generated = generateMarketData(body.address, body.price);
    if (!hasMarketData) marketData = generated.marketData;
    if (!hasInvestmentData) investmentAnalysis = generated.investmentAnalysis;
  }

  const newProp = await saveProperty({
    ...body,
    id: body.id || `prop-${Date.now()}`,
    createdAt: body.createdAt || new Date(),
    images: body.images || [],
    documents: body.documents || [],
    maintenanceHistory: body.maintenanceHistory || [],
    ownershipHistory: body.ownershipHistory || [],
    marketData,
    investmentAnalysis,
    bedroom: body.bedroom || 0,
    bathroom: body.bathroom || 0,
    squareFeet: body.squareFeet || 0,
    yearBuilt: body.yearBuilt || 0,
    lot: body.lot || 0,
    locked: body.locked !== undefined ? body.locked : true, // Auto-lock new properties
  });

  clearSummaryCache();
  return new Response(JSON.stringify(newProp), { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await req.json();

  // Bulk lock/unlock: { lockAll: true/false }
  if (body.lockAll !== undefined) {
    const { lockAllProperties } = await import("@/lib/propertyStorage");
    const count = await lockAllProperties(!!body.lockAll);
    clearSummaryCache();
    return new Response(JSON.stringify({ success: true, count }), { status: 200 });
  }

  const { id, ...updates } = body;

  if (!id) {
    return new Response(
      JSON.stringify({ error: "Property id required" }),
      { status: 400 },
    );
  }

  const updated = await updateProperty(id, updates);
  if (!updated) {
    return new Response(
      JSON.stringify({ error: "Property not found" }),
      { status: 404 },
    );
  }

  clearSummaryCache();
  return new Response(JSON.stringify(updated), { status: 200 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response(
      JSON.stringify({ error: "Property id required" }),
      { status: 400 },
    );
  }

  const deleted = await deleteProperty(id);
  if (deleted === "locked") {
    return new Response(
      JSON.stringify({ error: "This property is locked and cannot be deleted. Unlock it first." }),
      { status: 403 },
    );
  }
  if (!deleted) {
    return new Response(
      JSON.stringify({ error: "Property not found" }),
      { status: 404 },
    );
  }

  clearSummaryCache();
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
