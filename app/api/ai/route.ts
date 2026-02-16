import { generateMarketData } from "@/lib/marketDataGenerator";

export async function POST(req: Request) {
  const body = await req.json();
  const { prompt, agentId } = body || {};

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'No prompt provided' }), { status: 400 });
  }

  // Parse prompt for address, price, bedrooms
  const now = Date.now();

  // Extract price: prioritize explicit dollar amounts like "$5,087,000", then numbers with commas,
  // and finally long continuous numbers (>=6 digits). This avoids matching the house number (e.g., 1595).
  let price: number | undefined;
  const dollarMatch = prompt.match(/\$\s*([0-9][0-9,\.\s]*)/);
  if (dollarMatch) {
    price = Number(dollarMatch[1].replace(/[^0-9\.]/g, ""));
  } else {
    const commaMatch = prompt.match(/\b([0-9]{1,3}(?:,[0-9]{3})+)\b/);
    if (commaMatch) {
      price = Number(commaMatch[1].replace(/,/g, ""));
    } else {
      const longNum = prompt.match(/\b([0-9]{6,})\b/);
      if (longNum) price = Number(longNum[1]);
    }
  }

  // Extract bedroom count as a trailing integer
  const bedMatch = prompt.match(/\b(\d{1,2})\s*$/);
  const bedroom = bedMatch ? Number(bedMatch[1]) : 4;

  // Heuristic: remove price and bedroom tokens from prompt to produce address string
  let cleaned = prompt;
  // remove dollar amounts like "$5,087,000"
  cleaned = cleaned.replace(/\$\s*[0-9][0-9,\.\s]*/g, '');
  // remove numbers with commas (thousands separators)
  cleaned = cleaned.replace(/\b[0-9]{1,3}(?:,[0-9]{3})+\b/g, '');
  // remove long continuous numbers (likely large price formats)
  cleaned = cleaned.replace(/\b[0-9]{6,}\b/g, '');
  if (bedMatch) cleaned = cleaned.replace(bedMatch[0], '');
  // Remove extra multiple spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

  // If there's a name at the end (two words) remove as owner for address heuristic
  const maybeOwner = cleaned.match(/\b([A-Z][a-z]+\s+[A-Z][a-z]+)$/);
  let ownerName: string | null = null;
  if (maybeOwner) {
    ownerName = maybeOwner[1];
    cleaned = cleaned.replace(maybeOwner[0], '').trim();
  }

  const address = cleaned || `Auto Generated Address ${now}`;
  const title = address; // Title should be the location

  // If price not parsed, fall back to deterministic generation
  if (!price) {
    price = Math.floor(5000000 + (Math.abs(hashCode(prompt)) % 15000000));
  }

  // Generate complete market data and investment analysis from address
  const { marketData, investmentAnalysis } = generateMarketData(address, price);

  const generated = {
    id: `prop-ai-${now}`,
    title,
    address,
    price,
    description: `Auto-generated property listing based on: "${prompt}". Please review and edit before publishing.`,
    images: [
      'https://images.unsplash.com/photo-1600585152552-5d5ef8e2b0f8?w=1200',
    ],
    agentId: agentId || 'agent-1',
    bedroom,
    bathroom: 3.5,
    squareFeet: 4200,
    yearBuilt: 2018,
    lot: 0.45,
    owner: ownerName || 'Unknown Owner',
    bedrooms: bedroom,
    documents: [
      { id: `doc-${now}-1`, name: 'Deed - Auto', type: 'deed', url: '#', uploadedAt: new Date(), analysis: 'Mock deed record indicating legal owner chain and parcel description.' },
      { id: `doc-${now}-2`, name: 'Inspection - Auto', type: 'inspection', url: '#', uploadedAt: new Date(), analysis: 'Mock inspection report: structure sound, minor roof recommendations.' },
      { id: `doc-${now}-3`, name: 'Blueprints - Auto', type: 'blueprint', url: '#', uploadedAt: new Date(), analysis: 'Mock blueprint files with floorplans and permit stamps.' },
    ],
    maintenanceHistory: [
      { id: `maint-${now}-1`, date: new Date('2023-09-10'), description: 'Full HVAC service and filter replacement', cost: 4500, category: 'HVAC' },
      { id: `maint-${now}-2`, date: new Date('2022-06-20'), description: 'Kitchen renovation (cabinetry & appliances)', cost: 65000, category: 'Renovation' },
    ],
    ownershipHistory: [
      {
        id: `own-${now}-1`,
        owner: ownerName || 'Helen McIntyre',
        purchaseDate: new Date('2016-05-01'),
        saleDate: new Date(),
        purchasePrice: Math.floor(price * 0.78),
        salePrice: price,
        reason: 'Owner relocating; listed to optimize estate diversification',
      },
    ],
    marketData,
    investmentAnalysis,
  };

  return new Response(JSON.stringify(generated), { status: 200 });
}

function hashCode(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}
