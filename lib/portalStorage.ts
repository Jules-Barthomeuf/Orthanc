import { Portal } from "@/types";

function getSupabaseUrl() { return process.env.SUPABASE_URL || ""; }
function getSupabaseKey() { return process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY || ""; }
function getTableEndpoint() { const url = getSupabaseUrl(); return url ? `${url}/rest/v1/portals` : ""; }

type PortalRow = {
  id: string;
  name: string;
  slug: string;
  agent_id: string;
  description: string | null;
  property_ids: string[];
  created_at: string | null;
};

interface SupabaseRequestOptions {
  query?: Record<string, string>;
  body?: unknown;
  prefer?: string;
}

function ensureConfig() {
  if (!getSupabaseUrl() || !getSupabaseKey()) {
    throw new Error("[portalStorage] SUPABASE_URL and SUPABASE_SERVICE_ROLE must be configured");
  }
}

async function supabaseRequest(method: string, options: SupabaseRequestOptions = {}) {
  ensureConfig();
  const key = getSupabaseKey();
  const url = new URL(getTableEndpoint());
  if (options.query) {
    for (const [k, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(k, value);
      }
    }
  }

  const headers: Record<string, string> = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (options.prefer) {
    headers.Prefer = options.prefer;
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `[portalStorage] Supabase ${method} ${url.pathname}${url.search} failed: ${res.status} ${errorBody}`
    );
  }

  return res;
}

function mapRowToPortal(row: PortalRow): Portal {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    agentId: row.agent_id,
    description: row.description ?? "",
    propertyIds: Array.isArray(row.property_ids) ? row.property_ids : [],
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  };
}

function serializePortal(portal: Portal): PortalRow {
  return {
    id: portal.id,
    name: portal.name,
    slug: portal.slug,
    agent_id: portal.agentId,
    description: portal.description ?? "",
    property_ids: portal.propertyIds ?? [],
    created_at: portal.createdAt
      ? portal.createdAt instanceof Date
        ? portal.createdAt.toISOString()
        : new Date(portal.createdAt).toISOString()
      : new Date().toISOString(),
  };
}

export async function readPortals(): Promise<Portal[]> {
  const res = await supabaseRequest("GET", {
    query: { select: "*", order: "created_at.desc" },
  });
  const rows = (await res.json()) as PortalRow[];
  return rows.map(mapRowToPortal);
}

export async function readPortalsByAgent(agentId: string): Promise<Portal[]> {
  const res = await supabaseRequest("GET", {
    query: { select: "*", agent_id: `eq.${agentId}`, order: "created_at.desc" },
  });
  const rows = (await res.json()) as PortalRow[];
  return rows.map(mapRowToPortal);
}

export async function findPortalById(id: string): Promise<Portal | undefined> {
  const res = await supabaseRequest("GET", {
    query: { select: "*", id: `eq.${id}`, limit: "1" },
  });
  const rows = (await res.json()) as PortalRow[];
  if (!rows.length) return undefined;
  return mapRowToPortal(rows[0]);
}

export async function findPortalBySlug(slug: string): Promise<Portal | undefined> {
  const res = await supabaseRequest("GET", {
    query: { select: "*", slug: `eq.${slug}`, limit: "1" },
  });
  const rows = (await res.json()) as PortalRow[];
  if (!rows.length) return undefined;
  return mapRowToPortal(rows[0]);
}

export async function savePortal(portal: Portal): Promise<Portal> {
  const res = await supabaseRequest("POST", {
    query: { on_conflict: "id" },
    body: [serializePortal(portal)],
    prefer: "return=representation,resolution=merge-duplicates",
  });
  const rows = (await res.json()) as PortalRow[];
  return mapRowToPortal(rows[0]);
}

export async function updatePortal(id: string, updates: Partial<Portal>): Promise<Portal | null> {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.slug !== undefined) payload.slug = updates.slug;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.propertyIds !== undefined) payload.property_ids = updates.propertyIds;

  if (Object.keys(payload).length === 0) {
    const existing = await findPortalById(id);
    return existing ?? null;
  }

  const res = await supabaseRequest("PATCH", {
    query: { id: `eq.${id}` },
    body: payload,
    prefer: "return=representation",
  });
  const rows = (await res.json()) as PortalRow[];
  if (!rows.length) return null;
  return mapRowToPortal(rows[0]);
}

export async function deletePortal(id: string): Promise<boolean> {
  await supabaseRequest("DELETE", {
    query: { id: `eq.${id}` },
  });
  return true;
}
