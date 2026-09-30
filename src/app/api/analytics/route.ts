import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = session.userId;

    // Parallel extraction of real learner telemetry
    const [
      userProfile,
      practiceSessions,
      answeredQuestions,
      mistakes,
      topicProgressList,
      mockAttempts,
      revisionItems,
      studyLogs,
      levelRec,
    ] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.practiceSession.findMany({
        where: { userId, status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.practiceSessionQuestion.findMany({
        where: { session: { userId, status: "COMPLETED" }, isAnswered: true },
        select: {
          answerStatus: true,
          timeSpentSeconds: true,
          createdAt: true,
          question: {
            select: {
              id: true,
              difficulty: true,
              subject: { select: { id: true, name: true, slug: true } },
              topic: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      }),
      prisma.userMistake.findMany({
        where: { userId },
        include: {
          question: {
            select: {
              subject: { select: { name: true } },
              topic: { select: { name: true } },
              commonMistake: true,
            },
          },
        },
      }),
      prisma.topicProgress.findMany({
        where: { userId },
        include: { topic: { include: { subject: true } } },
      }),
      prisma.mockTestAttempt.findMany({
        where: { userId, status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { mockTest: { select: { title: true, totalMarks: true } } },
      }),
      prisma.revisionItem.findMany({
        where: { userId },
      }),
      prisma.studyLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      (prisma as any).userLevel.findUnique({ where: { userId } }),
    ]);

    // 1. Overall Metrics
    const totalAnswered = answeredQuestions.length;
    const correctCount = answeredQuestions.filter((q) => q.answerStatus === "CORRECT").length;
    const incorrectCount = answeredQuestions.filter((q) => q.answerStatus === "INCORRECT").length;
    const overallAccuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

    const totalTimeSpentSec = answeredQuestions.reduce((acc, q) => acc + (q.timeSpentSeconds || 45), 0);
    const avgSpeedSeconds = totalAnswered > 0 ? Math.round(totalTimeSpentSec / totalAnswered) : 48;

    // 2. Performance by Subject
    const subjectMap = new Map<string, { name: string; total: number; correct: number }>();
    for (const q of answeredQuestions) {
      const subName = q.question.subject?.name || "General";
      const curr = subjectMap.get(subName) || { name: subName, total: 0, correct: 0 };
      curr.total++;
      if (q.answerStatus === "CORRECT") curr.correct++;
      subjectMap.set(subName, curr);
    }

    const subjectPerformance = Array.from(subjectMap.values()).map((s) => ({
      name: s.name,
      totalQuestions: s.total,
      accuracyPct: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      status:
        s.total === 0
          ? "NOT_STARTED"
          : s.correct / s.total >= 0.75
          ? "STRONG"
          : s.correct / s.total >= 0.5
          ? "DEVELOPING"
          : "NEEDS_IMPROVEMENT",
    }));

    // 3. Topic Mastery Breakdown
    const topicBreakdown = topicProgressList.map((tp) => ({
      topicId: tp.topicId,
      topicName: tp.topic.name,
      subjectName: tp.topic.subject.name,
      questionsAttempted: tp.questionsAttempted,
      accuracyPct: tp.accuracy || 0,
      masteryStatus: tp.masteryStatus,
    }));

    // 4. Improvement Trend (Grouped into chunks of last 5 sessions or days)
    const recentSessionTrends = [...practiceSessions]
      .reverse()
      .map((s, idx) => ({
        sessionIndex: idx + 1,
        title: s.title,
        accuracy: Math.round(s.accuracy || 0),
        date: s.createdAt.toISOString().split("T")[0],
      }));

    // 5. Common Error Patterns
    const unresolvedMistakes = mistakes.filter((m) => m.reviewStatus === "UNRESOLVED").length;
    const resolvedMistakes = mistakes.filter((m) => m.reviewStatus === "RESOLVED").length;
    const repeatedMistakes = mistakes.filter((m) => m.timesIncorrect > 1).length;

    // 6. Study Consistency Heatmap (past 14 days)
    const consistencyMap = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      consistencyMap.set(dateStr, 0);
    }

    for (const log of studyLogs) {
      const dateStr = log.createdAt.toISOString().split("T")[0];
      if (consistencyMap.has(dateStr)) {
        consistencyMap.set(dateStr, (consistencyMap.get(dateStr) || 0) + log.durationMinutes);
      }
    }

    const consistencyData = Array.from(consistencyMap.entries()).map(([date, minutes]) => ({
      date,
      minutes,
      level: minutes >= 60 ? 3 : minutes >= 30 ? 2 : minutes > 0 ? 1 : 0,
    }));

    // 7. Transparent Composite Readiness Calculation
    // Formula: (Accuracy * 0.4) + (Syllabus Coverage * 0.3) + (Mock Performance * 0.2) + (Revision * 0.1)
    const syllabusCoveragePct = Math.min(100, Math.round((topicProgressList.length / 30) * 100));
    const avgMockAccuracy =
      mockAttempts.length > 0
        ? Math.round(mockAttempts.reduce((acc, m) => acc + m.accuracy, 0) / mockAttempts.length)
        : 0;
    const revisionCompletedPct =
      revisionItems.length > 0
        ? Math.round(
            (revisionItems.filter((r) => r.status === "COMPLETED" || r.status === "MASTERED").length /
              revisionItems.length) *
              100
          )
        : 80;

    const compositeReadiness = Math.min(
      98,
      Math.max(
        15,
        Math.round(
          overallAccuracy * 0.4 +
            syllabusCoveragePct * 0.3 +
            (avgMockAccuracy || overallAccuracy) * 0.2 +
            revisionCompletedPct * 0.1
        )
      )
    );

    return NextResponse.json({
      summary: {
        totalAnswered,
        correctCount,
        incorrectCount,
        overallAccuracy,
        avgSpeedSeconds,
        streakDays: userProfile?.streakDays || 1,
        longestStreak: userProfile?.longestStreak || 1,
        totalXP: levelRec?.totalXP || 0,
        level: levelRec?.level || 1,
        compositeReadiness,
      },
      readinessMethodology: {
        formula: "Readiness = (Accuracy × 40%) + (Syllabus Coverage × 30%) + (Mock Average × 20%) + (Revision Rate × 10%)",
        factors: {
          accuracyScore: overallAccuracy,
          coverageScore: syllabusCoveragePct,
          mockScore: avgMockAccuracy || overallAccuracy,
          revisionScore: revisionCompletedPct,
        },
      },
      subjectPerformance,
      topicBreakdown,
      recentSessionTrends,
      errorPatterns: {
        totalMistakes: mistakes.length,
        unresolvedMistakes,
        resolvedMistakes,
        repeatedMistakes,
      },
      mockHistory: mockAttempts.map((m) => ({
        id: m.id,
        title: m.mockTest.title,
        score: m.score,
        totalMarks: m.mockTest.totalMarks,
        accuracy: m.accuracy,
        date: m.startedAt.toISOString().split("T")[0],
      })),
      consistencyData,
    });
  } catch (error: any) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: "Failed to load analytics data" }, { status: 500 });
  }
}
