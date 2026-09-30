import { prisma } from "@/lib/prisma";

// -------------------------------------------------------------
// XP Rules — idempotent per (userId, reason, refId)
// -------------------------------------------------------------

export const XP_RULES = {
  PRACTICE_SESSION_COMPLETE: { base: 20, maxBonus: 15 },
  MOCK_TEST_COMPLETE: { base: 75, maxBonus: 50 },
  DAILY_CHALLENGE_COMPLETE: { base: 30, maxBonus: 20 },
  MISTAKE_RESOLVED: { base: 10, maxBonus: 0 },
  STREAK_3DAY_BONUS: { base: 25, maxBonus: 0 },
  STREAK_7DAY_BONUS: { base: 75, maxBonus: 0 },
  STREAK_30DAY_BONUS: { base: 200, maxBonus: 0 },
  ACHIEVEMENT_UNLOCK: { base: 50, maxBonus: 0 }, // overridden by achievement.xpReward
} as const;

export type XPReason = keyof typeof XP_RULES;

// -------------------------------------------------------------
// Level System — 25 levels with exponential XP thresholds
// -------------------------------------------------------------

export interface LevelDefinition {
  level: number;
  title: string;
  xpRequired: number; // Total XP needed to reach this level
}

export const LEVEL_DEFINITIONS: LevelDefinition[] = [
  { level: 1, title: "Newcomer", xpRequired: 0 },
  { level: 2, title: "Curious Learner", xpRequired: 100 },
  { level: 3, title: "Aspirant", xpRequired: 250 },
  { level: 4, title: "Dedicated Student", xpRequired: 450 },
  { level: 5, title: "Focused Aspirant", xpRequired: 700 },
  { level: 6, title: "Practice Pro", xpRequired: 1000 },
  { level: 7, title: "Consistent Cracker", xpRequired: 1400 },
  { level: 8, title: "Subject Specialist", xpRequired: 1900 },
  { level: 9, title: "Question Veteran", xpRequired: 2500 },
  { level: 10, title: "Accuracy Expert", xpRequired: 3200 },
  { level: 11, title: "Mock Champion", xpRequired: 4000 },
  { level: 12, title: "Speed Solver", xpRequired: 5000 },
  { level: 13, title: "Strategy Master", xpRequired: 6200 },
  { level: 14, title: "Vault Scholar", xpRequired: 7600 },
  { level: 15, title: "Elite Aspirant", xpRequired: 9200 },
  { level: 16, title: "Breakthrough Achiever", xpRequired: 11000 },
  { level: 17, title: "Streak Warrior", xpRequired: 13000 },
  { level: 18, title: "Knowledge Builder", xpRequired: 15500 },
  { level: 19, title: "Exam Ready", xpRequired: 18500 },
  { level: 20, title: "Top Performer", xpRequired: 22000 },
  { level: 21, title: "Rank Crusher", xpRequired: 26000 },
  { level: 22, title: "Merit Lister", xpRequired: 31000 },
  { level: 23, title: "Interview Ace", xpRequired: 37000 },
  { level: 24, title: "Career Cracker", xpRequired: 44000 },
  { level: 25, title: "Legend", xpRequired: 52000 },
];

// Compute current level data from total XP
export function computeLevel(totalXP: number): {
  level: number;
  title: string;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpToNextLevel: number;
  progressPct: number;
} {
  let currentDef = LEVEL_DEFINITIONS[0];
  let nextDef = LEVEL_DEFINITIONS[1];

  for (let i = LEVEL_DEFINITIONS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_DEFINITIONS[i].xpRequired) {
      currentDef = LEVEL_DEFINITIONS[i];
      nextDef = LEVEL_DEFINITIONS[Math.min(i + 1, LEVEL_DEFINITIONS.length - 1)];
      break;
    }
  }

  const isMaxLevel = currentDef.level === 25;
  const xpForCurrentLevel = currentDef.xpRequired;
  const xpForNextLevel = isMaxLevel ? currentDef.xpRequired : nextDef.xpRequired;
  const rangeSize = isMaxLevel ? 1 : xpForNextLevel - xpForCurrentLevel;
  const xpProgress = totalXP - xpForCurrentLevel;
  const progressPct = isMaxLevel ? 100 : Math.min(100, Math.round((xpProgress / rangeSize) * 100));
  const xpToNextLevel = isMaxLevel ? 0 : xpForNextLevel - totalXP;

  return {
    level: currentDef.level,
    title: currentDef.title,
    xpForCurrentLevel,
    xpForNextLevel,
    xpToNextLevel: Math.max(0, xpToNextLevel),
    progressPct,
  };
}

// -------------------------------------------------------------
// Award XP — idempotent
// -------------------------------------------------------------

export interface AwardXPResult {
  awarded: boolean;
  xpAwarded: number;
  totalXP: number;
  level: number;
  levelTitle: string;
  levelUpOccurred: boolean;
  previousLevel: number;
}

export async function awardXP(
  userId: string,
  reason: string,
  refId: string | null,
  amount?: number
): Promise<AwardXPResult> {
  try {
    // Get current level before awarding
    const currentUserLevel = await prisma.userLevel.findUnique({
      where: { userId },
    });
    const previousTotalXP = currentUserLevel?.totalXP ?? 0;
    const previousLevelData = computeLevel(previousTotalXP);

    // Idempotency check: don't award XP for same (userId, reason, refId) twice
    // For reasons without refId (like streak bonuses), use reason alone
    const existingTransaction = await (prisma as any).xPTransaction.findFirst({
      where: {
        userId,
        reason,
        refId: refId ?? null,
      },
    });

    if (existingTransaction) {
      return {
        awarded: false,
        xpAwarded: 0,
        totalXP: previousTotalXP,
        level: previousLevelData.level,
        levelTitle: previousLevelData.title,
        levelUpOccurred: false,
        previousLevel: previousLevelData.level,
      };
    }

    // Compute XP to award
    const rule = XP_RULES[reason as XPReason];
    const xpToAward = amount ?? rule?.base ?? 10;

    // Create XP transaction
    await (prisma as any).xPTransaction.create({
      data: {
        userId,
        amount: xpToAward,
        reason,
        refId: refId ?? null,
      },
    });

    // Update/create UserLevel
    const newTotalXP = previousTotalXP + xpToAward;
    const newLevelData = computeLevel(newTotalXP);

    await (prisma as any).userLevel.upsert({
      where: { userId },
      update: {
        totalXP: newTotalXP,
        level: newLevelData.level,
        title: newLevelData.title,
      },
      create: {
        userId,
        totalXP: newTotalXP,
        level: newLevelData.level,
        title: newLevelData.title,
      },
    });

    return {
      awarded: true,
      xpAwarded: xpToAward,
      totalXP: newTotalXP,
      level: newLevelData.level,
      levelTitle: newLevelData.title,
      levelUpOccurred: newLevelData.level > previousLevelData.level,
      previousLevel: previousLevelData.level,
    };
  } catch (err) {
    console.error("[XP Engine] Error awarding XP:", err);
    return {
      awarded: false,
      xpAwarded: 0,
      totalXP: 0,
      level: 1,
      levelTitle: "Newcomer",
      levelUpOccurred: false,
      previousLevel: 1,
    };
  }
}

// -------------------------------------------------------------
// Get User XP & Level
// -------------------------------------------------------------

export async function getUserXPAndLevel(userId: string) {
  const userLevel = await (prisma as any).userLevel.findUnique({
    where: { userId },
  });

  const totalXP = userLevel?.totalXP ?? 0;
  const levelData = computeLevel(totalXP);

  return {
    totalXP,
    ...levelData,
  };
}

// -------------------------------------------------------------
// Sync XP from History — backfills XP from existing Phase 1–6 activity
// Safe to call multiple times (idempotent via XPTransaction unique constraint)
// -------------------------------------------------------------

export async function syncXPFromHistory(userId: string): Promise<{
  totalAwarded: number;
  transactionsCreated: number;
}> {
  let totalAwarded = 0;
  let transactionsCreated = 0;

  try {
    // 1. Practice Sessions
    const completedSessions = await prisma.practiceSession.findMany({
      where: { userId, status: "COMPLETED" },
      select: { id: true, accuracy: true },
    });

    for (const session of completedSessions) {
      const base = XP_RULES.PRACTICE_SESSION_COMPLETE.base;
      const accuracyBonus = session.accuracy
        ? Math.round((session.accuracy / 100) * XP_RULES.PRACTICE_SESSION_COMPLETE.maxBonus)
        : 0;
      const xp = base + accuracyBonus;

      const result = await awardXP(userId, "PRACTICE_SESSION_COMPLETE", session.id, xp);
      if (result.awarded) {
        totalAwarded += result.xpAwarded;
        transactionsCreated++;
      }
    }

    // 2. Mock Test Attempts
    const completedMocks = await prisma.mockTestAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      select: { id: true, accuracy: true },
    });

    for (const mock of completedMocks) {
      const base = XP_RULES.MOCK_TEST_COMPLETE.base;
      const accuracyBonus = mock.accuracy
        ? Math.round((mock.accuracy / 100) * XP_RULES.MOCK_TEST_COMPLETE.maxBonus)
        : 0;
      const xp = base + accuracyBonus;

      const result = await awardXP(userId, "MOCK_TEST_COMPLETE", mock.id, xp);
      if (result.awarded) {
        totalAwarded += result.xpAwarded;
        transactionsCreated++;
      }
    }

    // 3. Daily Challenge Attempts
    const challengeAttempts = await prisma.dailyChallengeAttempt.findMany({
      where: { userId },
      select: { id: true, accuracy: true },
    });

    for (const attempt of challengeAttempts) {
      const base = XP_RULES.DAILY_CHALLENGE_COMPLETE.base;
      const accuracyBonus = attempt.accuracy
        ? Math.round((attempt.accuracy / 100) * XP_RULES.DAILY_CHALLENGE_COMPLETE.maxBonus)
        : 0;
      const xp = base + accuracyBonus;

      const result = await awardXP(userId, "DAILY_CHALLENGE_COMPLETE", attempt.id, xp);
      if (result.awarded) {
        totalAwarded += result.xpAwarded;
        transactionsCreated++;
      }
    }

    // 4. Resolved Mistakes
    const resolvedMistakes = await prisma.userMistake.findMany({
      where: { userId, reviewStatus: { in: ["REVIEWED", "RESOLVED"] } },
      select: { id: true },
    });

    for (const mistake of resolvedMistakes) {
      const result = await awardXP(
        userId,
        "MISTAKE_RESOLVED",
        mistake.id,
        XP_RULES.MISTAKE_RESOLVED.base
      );
      if (result.awarded) {
        totalAwarded += result.xpAwarded;
        transactionsCreated++;
      }
    }

    // 5. Streak bonuses
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { longestStreak: true },
    });
    const longestStreak = profile?.longestStreak ?? 0;
    if (longestStreak >= 3) {
      const r = await awardXP(userId, "STREAK_3DAY_BONUS", "history-backfill", XP_RULES.STREAK_3DAY_BONUS.base);
      if (r.awarded) { totalAwarded += r.xpAwarded; transactionsCreated++; }
    }
    if (longestStreak >= 7) {
      const r = await awardXP(userId, "STREAK_7DAY_BONUS", "history-backfill", XP_RULES.STREAK_7DAY_BONUS.base);
      if (r.awarded) { totalAwarded += r.xpAwarded; transactionsCreated++; }
    }
    if (longestStreak >= 30) {
      const r = await awardXP(userId, "STREAK_30DAY_BONUS", "history-backfill", XP_RULES.STREAK_30DAY_BONUS.base);
      if (r.awarded) { totalAwarded += r.xpAwarded; transactionsCreated++; }
    }

    return { totalAwarded, transactionsCreated };
  } catch (err) {
    console.error("[XP Engine] Error syncing XP from history:", err);
    return { totalAwarded, transactionsCreated };
  }
}

// -------------------------------------------------------------
// Update Personal Records
// -------------------------------------------------------------

export async function updatePersonalRecords(userId: string): Promise<void> {
  try {
    // Best accuracy from practice sessions (min 5 questions)
    const bestAccuracySession = await prisma.practiceSession.findFirst({
      where: { userId, status: "COMPLETED", totalQuestions: { gte: 5 } },
      orderBy: { accuracy: "desc" },
      select: { id: true, accuracy: true },
    });

    if (bestAccuracySession?.accuracy) {
      await (prisma as any).personalRecord.upsert({
        where: { userId_metric: { userId, metric: "BEST_ACCURACY" } },
        update: (bestAccuracySession.accuracy > 0)
          ? { value: bestAccuracySession.accuracy, refId: bestAccuracySession.id, achievedAt: new Date(), updatedAt: new Date() }
          : {},
        create: {
          userId,
          metric: "BEST_ACCURACY",
          value: bestAccuracySession.accuracy,
          refId: bestAccuracySession.id,
        },
      });
    }

    // Best mock test score
    const bestMockAttempt = await prisma.mockTestAttempt.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { accuracy: "desc" },
      select: { id: true, accuracy: true, score: true },
    });

    if (bestMockAttempt?.accuracy) {
      await (prisma as any).personalRecord.upsert({
        where: { userId_metric: { userId, metric: "BEST_MOCK_SCORE" } },
        update: { value: bestMockAttempt.accuracy, refId: bestMockAttempt.id, achievedAt: new Date(), updatedAt: new Date() },
        create: {
          userId,
          metric: "BEST_MOCK_SCORE",
          value: bestMockAttempt.accuracy,
          refId: bestMockAttempt.id,
        },
      });
    }

    // Longest streak
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { longestStreak: true },
    });

    if (profile?.longestStreak) {
      await (prisma as any).personalRecord.upsert({
        where: { userId_metric: { userId, metric: "LONGEST_STREAK" } },
        update: { value: profile.longestStreak, updatedAt: new Date() },
        create: {
          userId,
          metric: "LONGEST_STREAK",
          value: profile.longestStreak,
        },
      });
    }

    // Max XP earned in a single day
    const xpByDay = await (prisma as any).xPTransaction.groupBy({
      by: ["createdAt"],
      where: { userId },
      _sum: { amount: true },
    });

    // Aggregate by date string
    const xpPerDay: Record<string, number> = {};
    for (const row of xpByDay) {
      const dateStr = new Date(row.createdAt).toISOString().split("T")[0];
      xpPerDay[dateStr] = (xpPerDay[dateStr] || 0) + (row._sum.amount || 0);
    }
    const maxXPDay = Math.max(0, ...Object.values(xpPerDay));

    if (maxXPDay > 0) {
      await (prisma as any).personalRecord.upsert({
        where: { userId_metric: { userId, metric: "MAX_XP_DAY" } },
        update: { value: maxXPDay, updatedAt: new Date() },
        create: {
          userId,
          metric: "MAX_XP_DAY",
          value: maxXPDay,
        },
      });
    }
  } catch (err) {
    console.error("[XP Engine] Error updating personal records:", err);
  }
}
