import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserXPAndLevel, updatePersonalRecords } from "@/lib/xp-engine";
import { evaluateAndAwardAchievements } from "@/lib/achievements";

// GET /api/profile/advanced — comprehensive profile data for the Advanced Profile page
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = session.userId;

    // Evaluate achievements & update records in background (non-blocking)
    evaluateAndAwardAchievements(userId).catch(console.error);
    updatePersonalRecords(userId).catch(console.error);

    // Fetch all data in parallel
    const [
      user,
      userProfile,
      xpLevel,
      personalRecords,
      allAchievements,
      userAchievements,
      recentSessions,
      recentMocks,
      xpHistory,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, createdAt: true },
      }),
      prisma.userProfile.findUnique({
        where: { userId },
        select: {
          targetExam: true,
          dailyStudyHours: true,
          readinessScore: true,
          streakDays: true,
          longestStreak: true,
          targetExamDate: true,
          lastActiveDate: true,
        },
      }),
      getUserXPAndLevel(userId),
      (prisma as any).personalRecord.findMany({ where: { userId } }),
      prisma.achievement.findMany({
        orderBy: [{ tier: "asc" }, { criteriaValue: "asc" }],
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true, earnedAt: true },
      }),
      // Last 14 completed practice sessions for accuracy trend
      prisma.practiceSession.findMany({
        where: { userId, status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
        take: 14,
        select: { id: true, accuracy: true, completedAt: true, totalQuestions: true },
      }),
      // Last 10 mock test attempts
      prisma.mockTestAttempt.findMany({
        where: { userId, status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
        take: 10,
        select: { id: true, accuracy: true, score: true, completedAt: true, mockTestId: true },
      }),
      // XP per day for last 30 days
      (prisma as any).xPTransaction.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: { amount: true, createdAt: true, reason: true },
      }),
    ]);

    // Process achievements
    const earnedMap = new Map(userAchievements.map((ua: any) => [ua.achievementId, ua.earnedAt]));
    const achievementsWithStatus = allAchievements.map((ach) => ({
      id: ach.id,
      code: ach.code,
      title: ach.title,
      description: ach.description,
      category: ach.category,
      icon: ach.icon,
      tier: ach.tier,
      criteriaType: ach.criteriaType,
      criteriaValue: ach.criteriaValue,
      xpReward: (ach as any).xpReward ?? 50,
      isUnlocked: earnedMap.has(ach.id),
      earnedAt: earnedMap.get(ach.id) ?? null,
    }));

    // Process XP history by day
    const xpByDay: Record<string, number> = {};
    for (const tx of xpHistory) {
      const dateStr = new Date(tx.createdAt).toISOString().split("T")[0];
      xpByDay[dateStr] = (xpByDay[dateStr] || 0) + tx.amount;
    }

    // Build 30-day chart array
    const today = new Date();
    const xpChartData = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      const dateStr = d.toISOString().split("T")[0];
      return {
        date: dateStr,
        xp: xpByDay[dateStr] ?? 0,
        dayLabel: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
    });

    // Accuracy trend (sessions sorted chronologically)
    const accuracyTrend = [...recentSessions]
      .reverse()
      .map((s) => ({
        sessionId: s.id,
        accuracy: Math.round(s.accuracy ?? 0),
        date: s.completedAt?.toISOString().split("T")[0] ?? "",
        questions: s.totalQuestions,
      }));

    // Personal records map
    const recordsMap: Record<string, { value: number; achievedAt: string }> = {};
    for (const pr of personalRecords) {
      recordsMap[pr.metric] = {
        value: pr.value,
        achievedAt: pr.achievedAt?.toISOString() ?? "",
      };
    }

    // Overall stats
    const [totalSessions, totalQuestions, totalMocks] = await Promise.all([
      prisma.practiceSession.count({ where: { userId, status: "COMPLETED" } }),
      prisma.practiceSessionQuestion.count({
        where: { session: { userId, status: "COMPLETED" }, isAnswered: true },
      }),
      prisma.mockTestAttempt.count({ where: { userId, status: "COMPLETED" } }),
    ]);

    return NextResponse.json({
      user: {
        name: user?.name ?? "Aspirant",
        email: user?.email ?? "",
        joinedAt: user?.createdAt?.toISOString() ?? "",
      },
      profile: userProfile,
      xpLevel,
      personalRecords: recordsMap,
      achievements: achievementsWithStatus,
      unlockedCount: achievementsWithStatus.filter((a) => a.isUnlocked).length,
      stats: {
        totalSessions,
        totalQuestions,
        totalMocks,
      },
      charts: {
        xpHistory: xpChartData,
        accuracyTrend,
        mockHistory: recentMocks.map((m) => ({
          attemptId: m.id,
          accuracy: Math.round(m.accuracy ?? 0),
          score: m.score,
          date: m.completedAt?.toISOString().split("T")[0] ?? "",
        })),
      },
    });
  } catch (err: any) {
    console.error("Error fetching advanced profile:", err);
    return NextResponse.json({ error: "Failed to load profile data" }, { status: 500 });
  }
}
