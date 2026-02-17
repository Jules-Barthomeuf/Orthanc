import { findStoredPropertyById, updateProperty } from '@/lib/propertyStorage';

export async function POST(req: Request) {
  const body = await req.json();
  const { propertyId } = body || {};

  if (!propertyId) {
    return new Response(JSON.stringify({ error: 'propertyId required' }), { status: 400 });
  }

  const property = await findStoredPropertyById(propertyId);
  if (!property) {
    return new Response(JSON.stringify({ error: 'Property not found' }), { status: 404 });
  }

  // Create a mock blockchain hash
  const hash = `0x${Math.random().toString(16).slice(2, 18)}${Date.now().toString(16).slice(-6)}`;

  const record = {
    id: `seal-${Date.now()}`,
    owner: 'Sealed by Agent',
    purchaseDate: new Date(),
    saleDate: new Date(),
    purchasePrice: property.price || 0,
    salePrice: property.price || 0,
    reason: `Sealed on-chain - hash ${hash}`,
  };

  // Append to ownership history and persist
  const history = Array.isArray((property as any).ownershipHistory)
    ? [...(property as any).ownershipHistory, record]
    : [record];
  await updateProperty(propertyId, { ownershipHistory: history } as any);

  return new Response(JSON.stringify({ ok: true, hash, record }), { status: 200 });
}
