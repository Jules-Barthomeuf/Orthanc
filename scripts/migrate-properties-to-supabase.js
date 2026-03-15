const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(process.cwd(), "data", "properties.json");

function normalizeDate(value) {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function serializeProperty(property) {
  return {
    id: property.id,
    title: property.title,
    address: property.address,
    price: property.price,
    description: property.description || "",
    images: ensureArray(property.images),
    agent_id: property.agentId || null,
    created_at: normalizeDate(property.createdAt),
    bedroom: property.bedroom || 0,
    bathroom: property.bathroom || 0,
    square_feet: property.squareFeet || 0,
    year_built: property.yearBuilt || 0,
    lot: property.lot || 0,
    documents: ensureArray(property.documents),
    maintenance_history: ensureArray(property.maintenanceHistory),
    ownership_history: ensureArray(property.ownershipHistory),
    market_data: property.marketData || {},
    investment_analysis: property.investmentAnalysis || {},
    annual_opex: property.annualOpex || null,
    liquidity_score: property.liquidityScore || null,
    risk_score: property.riskScore || null,
    cap_rate: property.capRate || null,
    irr: property.irr || null,
    locked: property.locked ?? true,
  };
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY;
  if (!url || !key) {
    console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE must be set");
    process.exit(1);
  }

  if (!fs.existsSync(DATA_FILE)) {
    console.error("No properties.json found at", DATA_FILE);
    process.exit(1);
  }

  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  let properties = [];
  try {
    properties = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse properties.json", e);
    process.exit(1);
  }

  if (!Array.isArray(properties) || properties.length === 0) {
    console.log("No properties to migrate");
    return;
  }

  const rows = properties.map(serializeProperty);
  const endpoint = new URL("/rest/v1/properties", url);
  endpoint.searchParams.set("on_conflict", "id");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Supabase upsert failed", res.status, text);
    process.exit(1);
  }

  console.log(`Migrated ${rows.length} properties to Supabase (${endpoint.origin})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
