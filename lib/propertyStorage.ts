import { Property } from "@/types";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY || "";
const TABLE_ENDPOINT = SUPABASE_URL ? `${SUPABASE_URL}/rest/v1/properties` : "";

type PropertyRow = {
  id: string;
  title: string;
  address: string;
  price: number;
  description: string | null;
  images: any[] | null;
  agent_id: string | null;
  created_at: string | null;
  bedroom: number | null;
  bathroom: number | null;
  square_feet: number | null;
  year_built: number | null;
  lot: number | null;
  documents: unknown;
  maintenance_history: unknown;
  ownership_history: unknown;
  market_data: unknown;
  investment_analysis: unknown;
  annual_opex: number | null;
  liquidity_score: number | null;
  risk_score: number | null;
  cap_rate: number | null;
  irr: number | null;
  locked: boolean | null;
};

type PartialRow = Record<string, unknown>;

interface SupabaseRequestOptions {
  query?: Record<string, string>;
  body?: unknown;
  prefer?: string;
  extraHeaders?: Record<string, string>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

const COLUMN_ALIASES: Record<string, string> = {
  agentId: "agent_id",
  createdAt: "created_at",
  squareFeet: "square_feet",
  yearBuilt: "year_built",
  maintenanceHistory: "maintenance_history",
  ownershipHistory: "ownership_history",
  marketData: "market_data",
  investmentAnalysis: "investment_analysis",
  annualOpex: "annual_opex",
};

const ARRAY_FIELDS = new Set(["images", "documents", "maintenanceHistory", "ownershipHistory"]);
const JSON_FIELDS = new Set(["marketData", "investmentAnalysis"]);
const SUMMARY_SELECT = [
  "id",
  "title",
  "images",
  "agent_id",
  "created_at",
  "locked",
].join(",");

function buildIdsFilter(ids: string[]) {
  const quoted = ids
    .filter(Boolean)
    .map((id) => `"${String(id).replace(/"/g, '\\"')}"`)
    .join(",");
  return `in.(${quoted})`;
}

function sortByRequestedIds(properties: Property[], ids: string[]) {
  const order = new Map(ids.map((id, index) => [id, index]));
  return [...properties].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

function ensureSupabaseConfig() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    throw new Error("[propertyStorage] SUPABASE_URL and SUPABASE_SERVICE_ROLE must be configured");
  }
}

function normalizeDate(value?: Date | string | null) {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function coerceObject<T>(value: unknown, fallback: T): T {
  if (value && typeof value === "object") {
    return value as T;
  }
  return fallback;
}

async function supabaseRequest(method: string, options: SupabaseRequestOptions = {}) {
  ensureSupabaseConfig();
  const url = new URL(TABLE_ENDPOINT);
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    }
  }

  const headers: Record<string, string> = {
    apikey: SUPABASE_SERVICE_ROLE,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (options.prefer) {
    headers.Prefer = options.prefer;
  }

  if (options.extraHeaders) {
    Object.assign(headers, options.extraHeaders);
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `[propertyStorage] Supabase ${method} ${url.pathname}${url.search} failed: ${res.status} ${errorBody}`
    );
  }

  return res;
}

function mapRowToProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    title: row.title,
    address: row.address,
    price: Number(row.price ?? 0),
    description: row.description ?? "",
    images: Array.isArray(row.images) ? row.images : [],
    agentId: row.agent_id ?? "",
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    bedroom: row.bedroom ?? 0,
    bathroom: row.bathroom ?? 0,
    squareFeet: row.square_feet ?? 0,
    yearBuilt: row.year_built ?? 0,
    lot: row.lot ?? 0,
    documents: Array.isArray(row.documents) ? row.documents : [],
    maintenanceHistory: Array.isArray(row.maintenance_history) ? row.maintenance_history : [],
    ownershipHistory: Array.isArray(row.ownership_history) ? row.ownership_history : [],
    marketData: coerceObject(row.market_data, {} as Property["marketData"]),
    investmentAnalysis: coerceObject(row.investment_analysis, {} as Property["investmentAnalysis"]),
    annualOpex: row.annual_opex ?? undefined,
    liquidityScore: row.liquidity_score ?? undefined,
    riskScore: row.risk_score ?? undefined,
    capRate: row.cap_rate ?? undefined,
    irr: row.irr ?? undefined,
    locked: row.locked ?? true,
  };
}

function serializeProperty(property: Property): PropertyRow {
  return {
    id: property.id,
    title: property.title,
    address: property.address,
    price: property.price,
    description: property.description ?? "",
    images: property.images ?? [],
    agent_id: property.agentId ?? null,
    created_at: normalizeDate(property.createdAt),
    bedroom: property.bedroom ?? 0,
    bathroom: property.bathroom ?? 0,
    square_feet: property.squareFeet ?? 0,
    year_built: property.yearBuilt ?? 0,
    lot: property.lot ?? 0,
    documents: property.documents ?? [],
    maintenance_history: property.maintenanceHistory ?? [],
    ownership_history: property.ownershipHistory ?? [],
    market_data: (property.marketData ?? {}) as unknown,
    investment_analysis: (property.investmentAnalysis ?? {}) as unknown,
    annual_opex: property.annualOpex ?? null,
    liquidity_score: property.liquidityScore ?? null,
    risk_score: property.riskScore ?? null,
    cap_rate: property.capRate ?? null,
    irr: property.irr ?? null,
    locked: property.locked ?? true,
  };
}

function serializePartial(updates: Partial<Property>): PartialRow {
  const row: PartialRow = {};
  for (const [rawKey, rawValue] of Object.entries(updates)) {
    if (rawValue === undefined) continue;
    const key = rawKey as keyof Property;
    const column = COLUMN_ALIASES[rawKey] ?? rawKey;

    if (key === "createdAt") {
      row[column] = normalizeDate(rawValue as Date | string);
    } else if (ARRAY_FIELDS.has(rawKey)) {
      row[column] = (rawValue as unknown[]) ?? [];
    } else if (JSON_FIELDS.has(rawKey)) {
      row[column] = (rawValue ?? {}) as unknown;
    } else {
      row[column] = rawValue;
    }
  }
  return row;
}

export async function readProperties(): Promise<Property[]> {
  const res = await supabaseRequest("GET", {
    query: { select: "*", order: "created_at.desc" },
  });
  const rows = (await res.json()) as PropertyRow[];
  return rows.map(mapRowToProperty);
}

export async function readPropertySummaries(): Promise<Property[]> {
  const res = await supabaseRequest("GET", {
    query: { select: SUMMARY_SELECT, order: "created_at.desc" },
  });
  const rows = (await res.json()) as PropertyRow[];
  return rows.map(mapRowToProperty);
}

export async function readPropertiesByAgent(agentId: string): Promise<Property[]> {
  const res = await supabaseRequest("GET", {
    query: { select: "*", agent_id: `eq.${agentId}`, order: "created_at.desc" },
  });
  const rows = (await res.json()) as PropertyRow[];
  return rows.map(mapRowToProperty);
}

export async function readPropertySummariesByAgent(agentId: string): Promise<Property[]> {
  const res = await supabaseRequest("GET", {
    query: { select: SUMMARY_SELECT, agent_id: `eq.${agentId}`, order: "created_at.desc" },
  });
  const rows = (await res.json()) as PropertyRow[];
  return rows.map(mapRowToProperty);
}

export async function readPropertySummariesByAgentPaginated(
  agentId: string,
  page: number,
  limit: number,
): Promise<PaginatedResult<Property>> {
  const offset = (page - 1) * limit;
  const rangeStart = offset;
  const rangeEnd = offset + limit - 1;
  const res = await supabaseRequest("GET", {
    query: { select: SUMMARY_SELECT, agent_id: `eq.${agentId}`, order: "created_at.desc" },
    prefer: "count=exact",
    extraHeaders: { Range: `${rangeStart}-${rangeEnd}` },
  });
  const contentRange = res.headers.get("content-range") || "";
  const total = parseInt(contentRange.split("/").pop() || "0", 10) || 0;
  const rows = (await res.json()) as PropertyRow[];
  return { data: rows.map(mapRowToProperty), total };
}

export async function readPropertySummariesPaginated(
  page: number,
  limit: number,
): Promise<PaginatedResult<Property>> {
  const offset = (page - 1) * limit;
  const rangeStart = offset;
  const rangeEnd = offset + limit - 1;
  const res = await supabaseRequest("GET", {
    query: { select: SUMMARY_SELECT, order: "created_at.desc" },
    prefer: "count=exact",
    extraHeaders: { Range: `${rangeStart}-${rangeEnd}` },
  });
  const contentRange = res.headers.get("content-range") || "";
  const total = parseInt(contentRange.split("/").pop() || "0", 10) || 0;
  const rows = (await res.json()) as PropertyRow[];
  return { data: rows.map(mapRowToProperty), total };
}

export async function readPropertiesByIds(ids: string[]): Promise<Property[]> {
  if (!ids.length) return [];
  const res = await supabaseRequest("GET", {
    query: { select: "*", id: buildIdsFilter(ids) },
  });
  const rows = (await res.json()) as PropertyRow[];
  return sortByRequestedIds(rows.map(mapRowToProperty), ids);
}

export async function readPropertySummariesByIds(ids: string[]): Promise<Property[]> {
  if (!ids.length) return [];
  const res = await supabaseRequest("GET", {
    query: { select: SUMMARY_SELECT, id: buildIdsFilter(ids) },
  });
  const rows = (await res.json()) as PropertyRow[];
  return sortByRequestedIds(rows.map(mapRowToProperty), ids);
}

export async function writePropertiesBulk(properties: Property[]) {
  if (!properties || properties.length === 0) return;
  await supabaseRequest("POST", {
    query: { on_conflict: "id" },
    body: properties.map(serializeProperty),
    prefer: "resolution=merge-duplicates,return=minimal",
  });
}

export async function saveProperty(property: Property): Promise<Property> {
  const res = await supabaseRequest("POST", {
    query: { on_conflict: "id" },
    body: [serializeProperty(property)],
    prefer: "return=representation,resolution=merge-duplicates",
  });
  const rows = (await res.json()) as PropertyRow[];
  return mapRowToProperty(rows[0]);
}

export async function deleteProperty(id: string): Promise<boolean | "locked"> {
  const existing = await findStoredPropertyById(id);
  if (!existing) return false;
  if (existing.locked) return "locked";
  await supabaseRequest("DELETE", {
    query: { id: `eq.${id}` },
  });
  return true;
}

export async function findStoredPropertyById(id: string): Promise<Property | undefined> {
  const res = await supabaseRequest("GET", {
    query: { select: "*", id: `eq.${id}`, limit: "1" },
  });
  const rows = (await res.json()) as PropertyRow[];
  if (!rows.length) return undefined;
  return mapRowToProperty(rows[0]);
}

export async function updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
  const payload = serializePartial(updates);
  if (Object.keys(payload).length === 0) {
    const existing = await findStoredPropertyById(id);
    return existing ?? null;
  }
  const res = await supabaseRequest("PATCH", {
    query: { id: `eq.${id}` },
    body: payload,
    prefer: "return=representation",
  });
  const rows = (await res.json()) as PropertyRow[];
  if (!rows.length) return null;
  return mapRowToProperty(rows[0]);
}

export async function lockAllProperties(locked: boolean): Promise<number> {
  const res = await supabaseRequest("PATCH", {
    query: { id: "not.is.null" },
    body: { locked },
    prefer: "return=representation",
  });
  const rows = (await res.json()) as PropertyRow[];
  return rows.length;
}

export async function exportProperties(): Promise<{ count: number; data: Property[]; exportedAt: string }> {
  const data = await readProperties();
  return {
    count: data.length,
    data,
    exportedAt: new Date().toISOString(),
  };
}

export function getStorageInfo() {
  return {
    provider: "supabase",
    supabaseUrl: SUPABASE_URL,
    table: "properties",
    configured: Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE),
  };
}