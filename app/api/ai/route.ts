export async function POST(req: Request) {
  const body = await req.json();
  const { prompt, agentId } = body || {};

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'No prompt provided' }), { status: 400 });
  }

  // Mock AI generation: produce a suggested property listing from the prompt
  const now = Date.now();
  const title = `AI Draft: ${prompt.substring(0, 40)}${prompt.length > 40 ? '...' : ''}`;
  const address = prompt.includes(',') ? prompt : `${prompt}, Generated City`;
  const price = Math.floor(5000000 + (Math.abs(hashCode(prompt)) % 15000000));

  const generated = {
    id: `prop-ai-${now}`,
    title,
    address,
    price,
    description: `Auto-generated property listing based on: "${prompt}". Please review and edit before publishing.",`,
    images: [
      'https://images.unsplash.com/photo-1600585152552-5d5ef8e2b0f8?w=1200',
    ],
    agentId: agentId || 'agent-1',
    bedroom: 4,
    bathroom: 3.5,
    squareFeet: 4200,
    yearBuilt: 2018,
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
