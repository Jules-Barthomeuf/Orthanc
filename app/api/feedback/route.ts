import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const FEEDBACK_FILE = path.join(process.cwd(), "data", "feedback.json");

interface FeedbackEntry {
  id: string;
  itemId: string;
  itemType: "portal" | "property";
  rating: number;
  comment: string;
  createdAt: string;
}

async function readFeedback(): Promise<FeedbackEntry[]> {
  try {
    const data = await fs.readFile(FEEDBACK_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeFeedback(entries: FeedbackEntry[]) {
  await fs.writeFile(FEEDBACK_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, itemType, rating, comment } = body;

    if (!itemId || !itemType || !rating || !comment?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (typeof rating !== "number" || rating < 0.5 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 0.5 and 5" }, { status: 400 });
    }

    if (!["portal", "property"].includes(itemType)) {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }

    const entry: FeedbackEntry = {
      id: crypto.randomUUID(),
      itemId: String(itemId),
      itemType,
      rating: Number(rating),
      comment: String(comment).trim().slice(0, 2000),
      createdAt: new Date().toISOString(),
    };

    const entries = await readFeedback();
    entries.push(entry);
    await writeFeedback(entries);

    return NextResponse.json({ success: true, id: entry.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const itemType = searchParams.get("itemType");

    const entries = await readFeedback();
    const filtered = entries.filter((e) => {
      if (itemId && e.itemId !== itemId) return false;
      if (itemType && e.itemType !== itemType) return false;
      return true;
    });

    return NextResponse.json(filtered, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
