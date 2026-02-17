import fs from "fs";
import path from "path";
import { Property } from "@/types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DATA_DIR = path.join(process.cwd(), "data");
const PROPERTIES_FILE = path.join(DATA_DIR, "properties.json");

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) return null;
  supabaseClient = createClient(url, key);
  return supabaseClient;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function isSupabaseEnabled() {
  return process.env.STORAGE_PROVIDER === "supabase" && !!getSupabaseClient();
}

/** Read all properties */
export async function readProperties(): Promise<Property[]> {
  if (isSupabaseEnabled()) {
    const sb = getSupabaseClient()!;
    const { data, error } = await sb.from("properties").select("data");
    if (error) return [];
    return (data || []).map((r: any) => r.data as Property);
  }

  ensureDataDir();
  if (!fs.existsSync(PROPERTIES_FILE)) return [];
  try {
    const raw = fs.readFileSync(PROPERTIES_FILE, "utf-8");
    return JSON.parse(raw) as Property[];
  } catch {
    return [];
  }
}

/** Write all properties to disk (local fallback) */
function writeProperties(properties: Property[]) {
  ensureDataDir();
  fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2), "utf-8");
}

/** Bulk write properties (supports supabase upsert) */
export async function writePropertiesBulk(properties: Property[]) {
  if (isSupabaseEnabled()) {
    const sb = getSupabaseClient()!;
    const rows = properties.map((p) => ({ id: p.id, data: p, created_at: p.createdAt || new Date() }));
    await sb.from("properties").upsert(rows);
    return;
  }
  writeProperties(properties);
}

/** Add or update a property and persist */
export async function saveProperty(property: Property): Promise<Property> {
  if (isSupabaseEnabled()) {
    const sb = getSupabaseClient()!;
    const row = { id: property.id, data: property, created_at: property.createdAt || new Date() };
    await sb.from("properties").upsert(row, { returning: "representation" });
    return property;
  }

  const properties = readPropertiesSyncFallback();
  const idx = properties.findIndex((p) => p.id === property.id);
  if (idx !== -1) properties[idx] = property; else properties.push(property);
  writeProperties(properties);
  return property;
}

function readPropertiesSyncFallback(): Property[] {
  ensureDataDir();
  if (!fs.existsSync(PROPERTIES_FILE)) return [];
  try {
    const raw = fs.readFileSync(PROPERTIES_FILE, "utf-8");
    return JSON.parse(raw) as Property[];
  } catch {
    return [];
  }
}

/** Delete a property by id */
export async function deleteProperty(id: string): Promise<boolean> {
  if (isSupabaseEnabled()) {
    const sb = getSupabaseClient()!;
    const { error } = await sb.from("properties").delete().eq("id", id);
    return !error;
  }
  const properties = readPropertiesSyncFallback();
  const idx = properties.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  properties.splice(idx, 1);
  writeProperties(properties);
  return true;
}

/** Find a property by id */
export async function findStoredPropertyById(id: string): Promise<Property | undefined> {
  if (isSupabaseEnabled()) {
    const sb = getSupabaseClient()!;
    const { data, error } = await sb.from("properties").select("data").eq("id", id).limit(1).single();
    if (error) return undefined;
    return (data as any).data as Property;
  }
  return readPropertiesSyncFallback().find((p) => p.id === id);
}

/** Update a property (partial merge) */
export async function updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
  if (isSupabaseEnabled()) {
    const existing = await findStoredPropertyById(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates } as Property;
    const sb = getSupabaseClient()!;
    await sb.from("properties").upsert({ id, data: merged, created_at: merged.createdAt || new Date() }, { returning: "representation" });
    return merged;
  }
  const properties = readPropertiesSyncFallback();
  const idx = properties.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  properties[idx] = { ...properties[idx], ...updates };
  writeProperties(properties);
  return properties[idx];
}
