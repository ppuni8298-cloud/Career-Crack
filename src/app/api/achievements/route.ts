import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateAndAwardAchievements } from "@/lib/achievements";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Evaluate and award any newly qualified achievements
    await evaluateAndAwardAchievements(session.userId);

    const [
      allAchievements,
      userAchievements,
      completedSessions,
      answeredQuestions,
      mistakesReviewed,
      userProfile,
      challengesCount,
      completedMocks,
      userLevelRecord,
    ] = await Promise.all([
      prisma.achievement.findMany({
        orderBy: [{ tier: "asc" }, { criteriaValue: "asc" }],
      }),
      prisma.userAchievement.findMany({
        where: { userId: session.userId },
      }),
      prisma.practiceSession.count({
        where: { userId: session.userId, status: "COMPLETED" },
      }),
      prisma.practiceSessionQuestion.count({
        where: { session: { userId: session.userId, status: "COMPLETED" }, isAnswered: true },
      }),
      prisma.userMistake.count({
        where: { userId: session.userId, reviewStatus: { in: ["REVIEWED", "RESOLVED"] } },
      }),
      prisma.userProfile.findUnique({
        where: { userId: session.userId },
        select: { streakDays: true, longestStreak: true },
      }),
      prisma.dailyChallengeAttempt.count({
        where: { userId: session.userId },
      }),
      prisma.mockTestAttempt.count({
        where: { userId: session.userId, status: "COMPLETED" },
      }),
      (prisma as any).userLevel.findUnique({
        where: { userId: session.userId },
      }),
    ]);

    const earnedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua.earnedAt]));
    const currentStreak = Math.max(userProfile?.streakDays || 1, userProfile?.longestStreak || 1);
    const userTotalXP = userLevelRecord?.totalXP || 0;

    const achievementsWithProgress = allAchievements.map((ach) => {
      const isUnlocked = earnedMap.has(ach.id);
      const earnedAt = earnedMap.get(ach.id) || null;

      let currentValue = 0;
      switch (ach.criteriaType) {
        case "SESSIONS_COUNT":
          currentValue = completedSessions;
          break;
        case "QUESTIONS_COUNT":
          currentValue = answeredQuestions;
          break;
        case "ACCURACY_PCT":
          currentValue = isUnlocked ? ach.criteriaValue : 0;
          break;
        case "MISTAKES_REVIEWED":
          currentValue = mistakesReviewed;
          break;
        case "STREAK_DAYS":
          currentValue = currentStreak;
          break;
        case "CHALLENGES_COUNT":
          currentValue = challengesCount;
          break;
        case "TOPICS_COUNT":
          currentValue = isUnlocked ? ach.criteriaValue : 0;
          break;
        case "MOCK_COUNT":
          currentValue = completedMocks;
          break;
        case "MOCK_ACCURACY":
          currentValue = isUnlocked ? ach.criteriaValue : 0;
          break;
        case "XP_TOTAL":
          currentValue = userTotalXP;
          break;
      }

      const progressPct = isUnlocked
        ? 100
        : Math.min(100, Math.round((currentValue / (ach.criteriaValue || 1)) * 100));

      return {
        id: ach.id,
        code: ach.code,
        title: ach.title,
        description: ach.description,
        category: ach.category,
        icon: ach.icon,
        tier: ach.tier,
        criteriaType: ach.criteriaType,
        criteriaValue: ach.criteriaValue,
        isUnlocked,
        earnedAt,
        currentValue,
        targetValue: ach.criteriaValue,
        progressPct,
      };
    });

    const unlockedCount = achievementsWithProgress.filter((a) => a.isUnlocked).length;

    return NextResponse.json({
      achievements: achievementsWithProgress,
      unlockedCount,
      totalCount: achievementsWithProgress.length,
    });
  } catch (err: any) {
    console.error("Error fetching achievements:", err);
    return NextResponse.json({ error: "Failed to load achievements" }, { status: 500 });
  }
}
