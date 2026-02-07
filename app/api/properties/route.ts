import { db, createProperty } from '@/lib/db';

export async function GET() {
  return new Response(JSON.stringify(db.properties), { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body || !body.title) {
    return new Response(JSON.stringify({ error: 'Invalid property data' }), { status: 400 });
  }

  const newProp = createProperty({
    ...body,
    id: `prop-${Date.now()}`,
    createdAt: new Date(),
    images: body.images || [],
    documents: body.documents || [],
    maintenanceHistory: body.maintenanceHistory || [],
    ownershipHistory: body.ownershipHistory || [],
    marketData: body.marketData || {},
    investmentAnalysis: body.investmentAnalysis || {},
    bedroom: body.bedroom || 0,
    bathroom: body.bathroom || 0,
    squareFeet: body.squareFeet || 0,
    yearBuilt: body.yearBuilt || 0,
    lot: body.lot || 0,
  } as any);

  return new Response(JSON.stringify(newProp), { status: 201 });
}
