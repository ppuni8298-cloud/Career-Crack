import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { computeAdaptiveIntelligence } from "@/lib/adaptive-engine";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { readiness, topicMasteryList, nextBestAction, holdingBack } =
      await computeAdaptiveIntelligence(session.userId);

    return NextResponse.json({
      readiness,
      topicMasterySummary: {
        total: topicMasteryList.length,
        mastered: topicMasteryList.filter((t) => t.masteryState === "MASTERED").length,
        strong: topicMasteryList.filter((t) => t.masteryState === "STRONG").length,
        developing: topicMasteryList.filter((t) => t.masteryState === "DEVELOPING").length,
        learning: topicMasteryList.filter((t) => t.masteryState === "LEARNING").length,
        needsRevision: topicMasteryList.filter((t) => t.masteryState === "NEEDS_REVISION").length,
        new: topicMasteryList.filter((t) => t.masteryState === "NEW").length,
      },
      nextBestAction,
      holdingBack,
    });
  } catch (err: any) {
    console.error("GET /api/readiness error:", err);
    return NextResponse.json({ error: "Failed to compute readiness analysis" }, { status: 500 });
  }
}
