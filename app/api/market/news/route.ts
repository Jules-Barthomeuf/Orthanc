import { findStoredPropertyById, updateProperty } from "@/lib/propertyStorage";
import {
  RealTimeAnalysis,
  RealTimeAnalysisCard,
} from "@/types";

const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;
const MAX_NEWS_CARDS = 12;
const MIN_NEWS_CARDS = 5;

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

  return "No direct incidence on this purchase has been identified at this stage.";
}

function classifyScope(
  text: string,
  context: { city: string; country: string; region: string }
): RealTimeAnalysisCard["scope"] {
  const t = text.toLowerCase();
  const city = context.city.toLowerCase();
  const country = context.country.toLowerCase();
  const region = context.region.toLowerCase();

  if ((city && t.includes(city)) || (country && t.includes(country))) {
    return "local";
  }

  if (
    (region && t.includes(region)) ||
    /(middle east|mena|gulf|gcc|europe|north america|asia|regional)/.test(t)
  ) {
    return "regional";
  }

  return "global";
}

function normalizeFromArticle(
  article: any,
  context: { city: string; country: string; region: string }
): RealTimeAnalysisCard {
  const title = String(article?.title || "Untitled signal").trim();
  const summary = String(article?.description || article?.content || "No summary available.").trim();
  const combinedText = `${title}. ${summary}`;
  const category = classifyCategory(combinedText);
  const scope = classifyScope(combinedText, context);
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
    scope,
    impactDirection: impact.direction,
    impactScore: impact.score,
    source: sourceName,
    sourceUrl,
    publishedAt,
    visible: true,
  };
}

function buildLocationContext(address: string, cityHint?: string) {
  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const city = cityHint?.trim() || parts[parts.length - 2] || parts[0] || "local market";
  const country = parts[parts.length - 1] || "";

  const locationText = `${city} ${country}`.toLowerCase();

  let region = "global";
  if (/(dubai|abu dhabi|uae|united arab emirates|saudi|qatar|bahrain|oman|kuwait|middle east)/.test(locationText)) {
    region = "Middle East";
  } else if (/(france|germany|italy|spain|uk|united kingdom|europe)/.test(locationText)) {
    region = "Europe";
  } else if (/(us|usa|united states|canada|north america)/.test(locationText)) {
    region = "North America";
  } else if (/(singapore|japan|china|hong kong|asia)/.test(locationText)) {
    region = "Asia";
  }

  return { city, country, region };
}

function buildNewsQuery(address: string, cityHint?: string) {
  const { city, country, region } = buildLocationContext(address, cityHint);

  const locationExpr = [city, country, region]
    .filter(Boolean)
    .map((v) => `"${v}"`)
    .join(" OR ");

  const marketExpr = [
    "real estate",
    "property market",
    "housing market",
    "mortgage rates",
    "geopolitical risk",
    "inflation",
  ]
    .map((v) => `"${v}"`)
    .join(" OR ");

  return {
    query: `(${locationExpr}) AND (${marketExpr})`,
    city,
    country,
    region,
  };
}

function buildMockCards(address: string, cityHint?: string): RealTimeAnalysisCard[] {
  const { city, region } = buildLocationContext(address, cityHint);
  const now = new Date();
  return [
    {
      id: "mock-1",
      title: "Regional inflation expectations remain elevated",
      summary: "Recent macro releases show persistent inflation pressure and slower expected rate cuts.",
      purchaseImpact: "Could reduce affordability and push financing costs higher.",
      category: "economy",
      scope: "global",
      impactDirection: "negative",
      impactScore: -36,
      source: "Orthanc Mock Feed",
      publishedAt: now,
      visible: true,
    },
    {
      id: "mock-2",
      title: "New transit expansion announced near target corridor",
      summary: `Local authority confirmed transit improvements around ${city}.`,
      purchaseImpact: "Could support demand and strengthen medium-term value.",
      category: "local",
      scope: "local",
      impactDirection: "positive",
      impactScore: 28,
      source: "Orthanc Mock Feed",
      publishedAt: now,
      visible: true,
    },
    {
      id: "mock-3",
      title: `${region} geopolitical watch: potential market volatility`,
      summary: `Macro and geopolitical developments in ${region} could affect capital flows and buyer confidence in ${city}.`,
      purchaseImpact: "Could increase uncertainty and financing risk for this purchase.",
      category: "geopolitics",
      scope: "regional",
      impactDirection: "negative",
      impactScore: -22,
      source: "Orthanc Mock Feed",
      publishedAt: now,
      visible: true,
    },
    {
      id: "mock-4",
      title: `${city} routine municipal updates with no major market impact`,
      summary: `Latest municipal updates in ${city} show no material change for purchase timing.`,
      purchaseImpact: "No direct incidence on this purchase has been identified at this stage.",
      category: "policy",
      scope: "local",
      impactDirection: "neutral",
      impactScore: 0,
      source: "Orthanc Mock Feed",
      publishedAt: now,
      visible: true,
    },
    {
      id: "mock-5",
      title: `Global housing headlines remain mixed`,
      summary: "Recent global housing coverage remains mixed and does not currently signal a direct effect on this specific acquisition.",
      purchaseImpact: "No direct incidence on this purchase has been identified at this stage.",
      category: "market",
      scope: "global",
      impactDirection: "neutral",
      impactScore: 0,
      source: "Orthanc Mock Feed",
      publishedAt: now,
      visible: true,
    },
  ];
}

function createNeutralSupplementCard(
  scope: RealTimeAnalysisCard["scope"],
  context: { city: string; country: string; region: string },
  index: number
): RealTimeAnalysisCard {
  const now = new Date();
  const scopeLabel = scope === "local" ? context.city : scope === "regional" ? context.region : "global markets";
  return {
    id: `supp-${scope}-${now.getTime()}-${index}`,
    title: `${scopeLabel} watchlist update`,
    summary: `Additional ${scope} signal tracked for completeness; no immediate market-moving event detected for this purchase.`,
    purchaseImpact: "No direct incidence on this purchase has been identified at this stage.",
    category: "other",
    scope,
    impactDirection: "neutral",
    impactScore: 0,
    source: "Orthanc Synthesized Signal",
    publishedAt: now,
    visible: true,
  };
}

function ensureCoverageAndMinimum(
  cards: RealTimeAnalysisCard[],
  context: { city: string; country: string; region: string }
): RealTimeAnalysisCard[] {
  const next = [...cards];
  const requiredScopes: RealTimeAnalysisCard["scope"][] = ["local", "regional", "global"];
  const present = new Set(next.map((c) => c.scope));

  let supplementIndex = 0;
  for (const scope of requiredScopes) {
    if (!present.has(scope)) {
      next.push(createNeutralSupplementCard(scope, context, supplementIndex++));
      present.add(scope);
    }
  }

  const cycle: RealTimeAnalysisCard["scope"][] = ["local", "regional", "global"];
  let cycleIndex = 0;
  while (next.length < MIN_NEWS_CARDS) {
    next.push(createNeutralSupplementCard(cycle[cycleIndex % cycle.length], context, supplementIndex++));
    cycleIndex += 1;
  }

  return next;
}

async function fetchNewsCards(address: string, cityHint?: string): Promise<RealTimeAnalysisCard[]> {
  const context = buildLocationContext(address, cityHint);
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return ensureCoverageAndMinimum(buildMockCards(address, cityHint), context);
  }

  const { query } = buildNewsQuery(address, cityHint);
  const encodedQuery = encodeURIComponent(query);
  const url = `https://newsapi.org/v2/everything?q=${encodedQuery}&language=en&sortBy=publishedAt&pageSize=${MAX_NEWS_CARDS}&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return buildMockCards(address, cityHint);
    }
    const json = await res.json();
    const articles = Array.isArray(json?.articles) ? json.articles : [];

    const seen = new Set<string>();
    const cards: RealTimeAnalysisCard[] = [];

    for (const article of articles) {
      const card = normalizeFromArticle(article, context);
      const fingerprint = card.sourceUrl || `${card.title}-${card.publishedAt.toISOString()}`;
      if (seen.has(fingerprint)) continue;
      seen.add(fingerprint);
      cards.push(card);
    }

    const base = cards.length > 0 ? cards : buildMockCards(address, cityHint);
    return ensureCoverageAndMinimum(base, context);
  } catch {
    return ensureCoverageAndMinimum(buildMockCards(address, cityHint), context);
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

  const nextCards = await fetchNewsCards(
    property.address || property.title || "property market",
    property.marketData?.city || undefined
  );
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
