import { exportProperties, readProperties, writePropertiesBulk } from "@/lib/propertyStorage";

/**
 * GET /api/properties/backup
 * Download a full JSON backup of all properties.
 * Use this to save a copy of your data before deployments or as a regular safety measure.
 */
export async function GET() {
  try {
    const backup = await exportProperties();
    return new Response(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="orthanc-properties-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Backup failed", details: err?.message }), { status: 500 });
  }
}

/**
 * POST /api/properties/backup
 * Restore properties from a backup JSON file.
 * This MERGES with existing properties (never deletes anything).
 * Body: { data: Property[] }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const incoming = body?.data;

    if (!Array.isArray(incoming) || incoming.length === 0) {
      return new Response(
        JSON.stringify({ error: "Body must contain a `data` array of properties" }),
        { status: 400 },
      );
    }

    // Read existing to report stats
    const existing = await readProperties();
    const existingIds = new Set(existing.map((p) => p.id));

    // Merge: existing + incoming (incoming wins on conflict)
    await writePropertiesBulk(incoming);

    const afterRestore = await readProperties();
    const newCount = incoming.filter((p: any) => !existingIds.has(p.id)).length;
    const updatedCount = incoming.filter((p: any) => existingIds.has(p.id)).length;

    return new Response(
      JSON.stringify({
        success: true,
        before: existing.length,
        after: afterRestore.length,
        newProperties: newCount,
        updatedProperties: updatedCount,
      }),
      { status: 200 },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Restore failed", details: err?.message }), { status: 500 });
  }
}
