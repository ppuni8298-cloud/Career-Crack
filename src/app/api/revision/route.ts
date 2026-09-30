import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getRevisionQueue,
  snoozeRevisionItem,
  markRevisionItemMastered,
  syncRevisionQueue,
} from "@/lib/revision-engine";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const queue = await getRevisionQueue(session.userId);
    return NextResponse.json(queue);
  } catch (err: any) {
    console.error("GET /api/revision error:", err);
    return NextResponse.json({ error: "Failed to load revision queue" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { action, id, days } = body;

    if (action === "SYNC") {
      const count = await syncRevisionQueue(session.userId);
      return NextResponse.json({ success: true, message: `Synced ${count} revision topics.` });
    }

    if (!id) {
      return NextResponse.json({ error: "Revision item ID is required" }, { status: 400 });
    }

    if (action === "SNOOZE") {
      const ok = await snoozeRevisionItem(session.userId, id, days || 3);
      return NextResponse.json({ success: ok, message: `Topic snoozed for ${days || 3} days.` });
    }

    if (action === "MASTER") {
      const ok = await markRevisionItemMastered(session.userId, id);
      return NextResponse.json({
        success: ok,
        message: "Marked as mastered. Will automatically resurface if future drill performance drops.",
      });
    }

    return NextResponse.json({ error: "Invalid revision action" }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/revision error:", err);
    return NextResponse.json({ error: "Failed to update revision status" }, { status: 500 });
  }
}
