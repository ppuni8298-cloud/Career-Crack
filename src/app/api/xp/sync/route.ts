import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { syncXPFromHistory, updatePersonalRecords } from "@/lib/xp-engine";

// GET /api/xp/sync — backfills XP from all existing Phase 1-6 activity
// Safe to call multiple times — idempotent
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const result = await syncXPFromHistory(session.userId);
    await updatePersonalRecords(session.userId);

    return NextResponse.json({
      success: true,
      message: `XP sync complete. ${result.transactionsCreated} new transactions created, ${result.totalAwarded} XP awarded.`,
      ...result,
    });
  } catch (err: any) {
    console.error("Error syncing XP:", err);
    return NextResponse.json({ error: "Failed to sync XP" }, { status: 500 });
  }
}
