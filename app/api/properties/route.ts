import {
  readProperties,
  saveProperty,
  deleteProperty,
  updateProperty,
} from "@/lib/propertyStorage";
import { generateMarketData } from "@/lib/marketDataGenerator";

export async function GET() {
  const properties = readProperties();
  // Auto-enrich properties missing complete market data
  let needsWrite = false;
  for (let i = 0; i < properties.length; i++) {
    const p = properties[i];
    const md = p.marketData || {} as any;
    const inv = p.investmentAnalysis || {} as any;
    const hasMarket = md.neighborhood && md.city && md.demographics && md.marketTrends;
    const hasInvestment = inv.currentValue && inv.projectedValue5Year && inv.capRate;
    if ((!hasMarket || !hasInvestment) && p.address && p.price) {
      const generated = generateMarketData(p.address, p.price);
      if (!hasMarket) properties[i] = { ...properties[i], marketData: generated.marketData };
      if (!hasInvestment) properties[i] = { ...properties[i], investmentAnalysis: generated.investmentAnalysis };
      needsWrite = true;
    }
  }
  // Persist enriched data so it only happens once
  if (needsWrite) {
    const { writePropertiesBulk } = await import("@/lib/propertyStorage");
    writePropertiesBulk(properties);
  }
  return new Response(JSON.stringify(properties), { status: 200 });
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

  const newProp = saveProperty({
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
  });

  return new Response(JSON.stringify(newProp), { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return new Response(
      JSON.stringify({ error: "Property id required" }),
      { status: 400 },
    );
  }

  const updated = updateProperty(id, updates);
  if (!updated) {
    return new Response(
      JSON.stringify({ error: "Property not found" }),
      { status: 404 },
    );
  }

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

  const deleted = deleteProperty(id);
  if (!deleted) {
    return new Response(
      JSON.stringify({ error: "Property not found" }),
      { status: 404 },
    );
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
