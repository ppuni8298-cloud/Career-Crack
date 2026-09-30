import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  compileStudentProfile,
  generateAIDailyPlan,
  analyzeStudentWeaknesses,
  determineNextBestAction,
} from "@/lib/ai-coach";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const profile = await compileStudentProfile(session.userId);
    if (!profile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    const dailyPlan = generateAIDailyPlan(profile);
    const weaknesses = analyzeStudentWeaknesses(profile);
    const nextBestAction = determineNextBestAction(profile);

    // Calculate projected readiness trajectory
    // Base readiness + expected gain from planned tasks
    const currentScore = profile.readinessScore;
    const projectedExamScore = Math.min(
      95,
      Math.max(currentScore, Math.round(currentScore + (profile.streakDays * 1.5) + (profile.totalQuestionsAttempted > 20 ? 15 : 5)))
    );

    return NextResponse.json({
      profile,
      dailyPlan,
      weaknesses,
      nextBestAction,
      retentionDecay: profile.retentionDecayTopics,
      readinessTrajectory: {
        current: currentScore,
        projected: projectedExamScore,
        status: currentScore >= 75 ? "EXAM_READY" : currentScore >= 50 ? "ON_TRACK" : "NEEDS_BOOST",
      },
    });
  } catch (error: any) {
    console.error("GET /api/ai/coach/briefing error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI study briefing", details: error.message },
      { status: 500 }
    );
  }
}
