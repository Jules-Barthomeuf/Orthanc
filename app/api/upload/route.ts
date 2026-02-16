export async function POST(req: Request) {
  const body = await req.json();
  const { files } = body || {};

  if (!files || !Array.isArray(files)) {
    return new Response(JSON.stringify({ error: 'files array required' }), { status: 400 });
  }

  // Very simple categorization mock: file name keywords -> category
  const categorized = files.map((f: string, idx: number) => {
    const lower = f.toLowerCase();
    let type = 'other';
    if (lower.includes('deed') || lower.includes('title')) type = 'blueprint';
    if (lower.includes('inspection') || lower.includes('report')) type = 'inspection';
    if (lower.includes('permit')) type = 'permit';

    return {
      id: `up-${Date.now()}-${idx}`,
      name: f,
      type,
      url: '#',
      uploadedAt: new Date(),
      analysis: `Auto-categorized as ${type}`,
    };
  });

  return new Response(JSON.stringify({ documents: categorized }), { status: 200 });
}
