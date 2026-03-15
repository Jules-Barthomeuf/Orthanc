import {
  readPortalsByAgent,
  savePortal,
  updatePortal,
  deletePortal,
  findPortalBySlug,
} from "@/lib/portalStorage";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId");
  const slug = searchParams.get("slug");

  if (slug) {
    const portal = await findPortalBySlug(slug);
    if (!portal) {
      return new Response(JSON.stringify({ error: "Portal not found" }), { status: 404 });
    }
    return new Response(JSON.stringify(portal), { status: 200 });
  }

  if (!agentId) {
    return new Response(JSON.stringify({ error: "agentId query param required" }), { status: 400 });
  }

  const portals = await readPortalsByAgent(agentId);
  return new Response(JSON.stringify(portals), { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body || !body.name || !body.agentId) {
    return new Response(
      JSON.stringify({ error: "name and agentId are required" }),
      { status: 400 },
    );
  }

  // Generate slug from name
  const baseSlug = body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = body.slug || `${baseSlug}-${Date.now().toString(36)}`;

  // Check slug uniqueness
  const existing = await findPortalBySlug(slug);
  if (existing) {
    return new Response(
      JSON.stringify({ error: "A portal with this slug already exists" }),
      { status: 409 },
    );
  }

  const portal = await savePortal({
    id: body.id || `portal-${Date.now()}`,
    name: body.name,
    slug,
    agentId: body.agentId,
    description: body.description || "",
    propertyIds: body.propertyIds || [],
    createdAt: new Date(),
  });

  return new Response(JSON.stringify(portal), { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return new Response(JSON.stringify({ error: "Portal id required" }), { status: 400 });
  }

  const updated = await updatePortal(id, updates);
  if (!updated) {
    return new Response(JSON.stringify({ error: "Portal not found" }), { status: 404 });
  }

  return new Response(JSON.stringify(updated), { status: 200 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "Portal id required" }), { status: 400 });
  }

  await deletePortal(id);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
