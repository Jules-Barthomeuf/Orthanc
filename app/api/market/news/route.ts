import { findStoredPropertyById, updateProperty } from "@/lib/propertyStorage";
import {
  RealTimeAnalysis,
  RealTimeAnalysisCard,
} from "@/types";

const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;
const MAX_NEWS_CARDS = 12;

const NEGATIVE_KEYWORDS = [
  "conflict",
  "war",
  "sanction",
  "violence",
  "attack",
  "strike",
  "inflation",
  "rate hike",
  "recession",
  "layoff",
  "instability",
  "crisis",
  "earthquake",
  "flood",
  "wildfire",
];

const POSITIVE_KEYWORDS = [
  "rate cut",
  "investment",
  "growth",
  "infrastructure",
  "expansion",
  "stability",
  "recovery",
  "development",
  "new transit",
  "new jobs",
  "tourism growth",
  "tax incentive",
];

function toDate(value: unknown, fallback = new Date()): Date {
  if (!value) return fallback;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function classifyCategory(text: string): RealTimeAnalysisCard["category"] {
  const t = text.toLowerCase();
  if (/(iran|israel|gaza|ukraine|china|conflict|war|sanction|embassy|military)/.test(t)) {
    return "geopolitics";
  }
  if (/(inflation|interest rate|recession|gdp|currency|central bank|jobs|unemployment)/.test(t)) {
    return "economy";
  }
  if (/(policy|regulation|law|permit|zoning|tax|government|municipal)/.test(t)) {
    return "policy";
  }
  if (/(housing|real estate|property|mortgage|inventory|rent|home prices)/.test(t)) {
    return "market";
  }
  if (/(city|district|neighborhood|road|school|hospital|transit)/.test(t)) {
    return "local";
  }
  return "other";
}

function computeImpact(text: string): { direction: RealTimeAnalysisCard["impactDirection"]; score: number } {
  const lowered = text.toLowerCase();
  let score = 0;

  for (const k of NEGATIVE_KEYWORDS) {
    if (lowered.includes(k)) score -= 18;
  }
  for (const k of POSITIVE_KEYWORDS) {
    if (lowered.includes(k)) score += 14;
  }

  score = Math.max(-100, Math.min(100, score));

  if (score <= -12) return { direction: "negative", score };
  if (score >= 12) return { direction: "positive", score };
  return { direction: "neutral", score };
}

function buildPurchaseImpact(direction: RealTimeAnalysisCard["impactDirection"], category: RealTimeAnalysisCard["category"]): string {
  if (direction === "negative") {
    if (category === "geopolitics") return "Could increase uncertainty and financing risk for this purchase.";
    if (category === "economy") return "Could reduce affordability and push financing costs higher.";
    if (category === "policy") return "Could create compliance/permitting friction and delay execution.";
    if (category === "market") return "Could weaken near-term demand and resale momentum.";
    return "Could increase execution risk around this acquisition.";
  }

  if (direction === "positive") {
    if (category === "economy") return "Could improve financing conditions and buyer confidence.";
    if (category === "market") return "Could support demand and strengthen medium-term value.";
    if (category === "policy") return "Could reduce friction and improve project viability.";
    return "Could improve timing conditions for this purchase.";
  }

  return "Signal is mixed; monitor before making a final purchase decision.";
}

function normalizeFromArticle(article: any): RealTimeAnalysisCard {
  const title = String(article?.title || "Untitled signal").trim();
  const summary = String(article?.description || article?.content || "No summary available.").trim();
  const combinedText = `${title}. ${summary}`;
  const category = classifyCategory(combinedText);
  const impact = computeImpact(combinedText);
  const publishedAt = toDate(article?.publishedAt);
  const sourceName = String(article?.source?.name || "News source").trim();
  const sourceUrl = article?.url ? String(article.url) : undefined;

  const sourceKey = sourceUrl || `${title}-${publishedAt.toISOString()}`;
  const id = `news-${Buffer.from(sourceKey).toString("base64").slice(0, 24)}`;

  return {
    id,
    title,
    summary,
    purchaseImpact: buildPurchaseImpact(impact.direction, category),
    category,
    impactDirection: impact.direction,
    impactScore: impact.score,
    source: sourceName,
    sourceUrl,
    publishedAt,
    visible: true,
  };
}

function buildMockCards(address: string): RealTimeAnalysisCard[] {
  const now = new Date();
  return [
    {
      id: "mock-1",
      title: "Regional inflation expectations remain elevated",
      summary: "Recent macro releases show persistent inflation pressure and slower expected rate cuts.",
      purchaseImpact: "Could reduce affordability and push financing costs higher.",
      category: "economy",
      impactDirection: "negative",
      impactScore: -36,
      source: "Orthanc Mock Feed",
      publishedAt: now,
      visible: true,
    },
    {
      id: "mock-2",
      title: "New transit expansion announced near target corridor",
      summary: `Local authority confirmed transit improvements around ${address.split(",")[0] || "the area"}.`,
      purchaseImpact: "Could support demand and strengthen medium-term value.",
      category: "local",
      impactDirection: "positive",
      impactScore: 28,
      source: "Orthanc Mock Feed",
      publishedAt: now,
      visible: true,
    },
  ];
}

async function fetchNewsCards(address: string): Promise<RealTimeAnalysisCard[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return buildMockCards(address);
  }

  const query = encodeURIComponent(`(${address}) OR (real estate ${address}) OR (housing market ${address})`);
  const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=${MAX_NEWS_CARDS}&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return buildMockCards(address);
    }
    const json = await res.json();
    const articles = Array.isArray(json?.articles) ? json.articles : [];

    const seen = new Set<string>();
    const cards: RealTimeAnalysisCard[] = [];

    for (const article of articles) {
      const card = normalizeFromArticle(article);
      const fingerprint = card.sourceUrl || `${card.title}-${card.publishedAt.toISOString()}`;
      if (seen.has(fingerprint)) continue;
      seen.add(fingerprint);
      cards.push(card);
    }

    return cards.length > 0 ? cards : buildMockCards(address);
  } catch {
    return buildMockCards(address);
  }
}

function mergeVisibility(
  nextCards: RealTimeAnalysisCard[],
  existingCards: RealTimeAnalysisCard[]
): RealTimeAnalysisCard[] {
  const visibilityByKey = new Map<string, Pick<RealTimeAnalysisCard, "visible" | "hiddenAt" | "hiddenReason">>();

  for (const c of existingCards) {
    const key = c.sourceUrl || c.id || c.title;
    visibilityByKey.set(key, {
      visible: c.visible,
      hiddenAt: c.hiddenAt,
      hiddenReason: c.hiddenReason,
    });
  }

  return nextCards.map((c) => {
    const key = c.sourceUrl || c.id || c.title;
    const previous = visibilityByKey.get(key);
    if (!previous) return c;
    return {
      ...c,
      visible: previous.visible,
      hiddenAt: previous.hiddenAt,
      hiddenReason: previous.hiddenReason,
    };
  });
}

function isStale(analysis?: RealTimeAnalysis): boolean {
  if (!analysis?.lastUpdated) return true;
  const updated = toDate(analysis.lastUpdated);
  return Date.now() - updated.getTime() >= REFRESH_INTERVAL_MS;
}

async function generateAndPersist(propertyId: string, force = false) {
  const property = await findStoredPropertyById(propertyId);
  if (!property) return { status: 404, payload: { error: "Property not found" } };

  const existing = property.marketData?.realTimeAnalysis;
  if (!force && existing && !isStale(existing)) {
    return {
      status: 200,
      payload: {
        ...existing,
        source: process.env.NEWS_API_KEY ? "newsapi" : "mock",
      },
    };
  }

  const nextCards = await fetchNewsCards(property.address || property.title || "property market");
  const mergedCards = mergeVisibility(nextCards, existing?.cards || []);
  const now = new Date();

  const analysis: RealTimeAnalysis = {
    cards: mergedCards,
    lastUpdated: now,
    nextRefreshAt: new Date(now.getTime() + REFRESH_INTERVAL_MS),
  };

  const marketData = {
    ...(property.marketData || {}),
    realTimeAnalysis: analysis,
  };

  await updateProperty(property.id, { marketData });

  return {
    status: 200,
    payload: {
      ...analysis,
      source: process.env.NEWS_API_KEY ? "newsapi" : "mock",
    },
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");
  const force = searchParams.get("force") === "1";

  if (!propertyId) {
    return new Response(JSON.stringify({ error: "propertyId is required" }), { status: 400 });
  }

  const result = await generateAndPersist(propertyId, force);
  return new Response(JSON.stringify(result.payload), { status: result.status });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const propertyId = typeof body?.propertyId === "string" ? body.propertyId : "";

  if (!propertyId) {
    return new Response(JSON.stringify({ error: "propertyId is required" }), { status: 400 });
  }

  const result = await generateAndPersist(propertyId, true);
  return new Response(JSON.stringify(result.payload), { status: result.status });
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const propertyId = typeof body?.propertyId === "string" ? body.propertyId : "";
  const cardId = typeof body?.cardId === "string" ? body.cardId : "";
  const action = body?.action === "restore" ? "restore" : "hide";
  const reason = typeof body?.reason === "string" ? body.reason : "manual";

  if (!propertyId || !cardId) {
    return new Response(JSON.stringify({ error: "propertyId and cardId are required" }), { status: 400 });
  }

  const property = await findStoredPropertyById(propertyId);
  if (!property) {
    return new Response(JSON.stringify({ error: "Property not found" }), { status: 404 });
  }

  const current = property.marketData?.realTimeAnalysis;
  if (!current || !Array.isArray(current.cards)) {
    return new Response(JSON.stringify({ error: "No analysis available for this property" }), { status: 404 });
  }

  const now = new Date();
  const nextCards = current.cards.map((card) => {
    if (card.id !== cardId) return card;

    if (action === "restore") {
      return {
        ...card,
        visible: true,
        hiddenAt: undefined,
        hiddenReason: undefined,
      };
    }

    return {
      ...card,
      visible: false,
      hiddenAt: now,
      hiddenReason: reason,
    };
  });

  const analysis: RealTimeAnalysis = {
    ...current,
    cards: nextCards,
    lastUpdated: current.lastUpdated ? toDate(current.lastUpdated) : now,
    nextRefreshAt: current.nextRefreshAt ? toDate(current.nextRefreshAt) : new Date(now.getTime() + REFRESH_INTERVAL_MS),
  };

  const marketData = {
    ...(property.marketData || {}),
    realTimeAnalysis: analysis,
  };

  const updated = await updateProperty(propertyId, { marketData });
  if (!updated) {
    return new Response(JSON.stringify({ error: "Failed to update analysis" }), { status: 500 });
  }

  return new Response(JSON.stringify(analysis), { status: 200 });
}
