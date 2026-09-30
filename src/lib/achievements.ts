import { prisma } from "@/lib/prisma";

export interface AchievementDefinition {
  code: string;
  title: string;
  description: string;
  category: "PRACTICE" | "ACCURACY" | "STREAK" | "MISTAKES" | "XP" | "MOCK";
  icon: string;
  tier: "BRONZE" | "SILVER" | "GOLD";
  criteriaType:
    | "SESSIONS_COUNT"
    | "QUESTIONS_COUNT"
    | "ACCURACY_PCT"
    | "MISTAKES_REVIEWED"
    | "STREAK_DAYS"
    | "CHALLENGES_COUNT"
    | "TOPICS_COUNT"
    | "MOCK_COUNT"
    | "MOCK_ACCURACY"
    | "XP_TOTAL";
  criteriaValue: number;
  xpReward?: number; // XP awarded on unlock
}

export const DEFAULT_ACHIEVEMENTS: AchievementDefinition[] = [
  // ─── Phase 1–6 Achievements (preserved exactly) ───────────────────────────
  {
    code: "FIRST_PRACTICE",
    title: "First Step",
    description: "Completed your first practice session on Career Crack.",
    category: "PRACTICE",
    icon: "🌱",
    tier: "BRONZE",
    criteriaType: "SESSIONS_COUNT",
    criteriaValue: 1,
    xpReward: 30,
  },
  {
    code: "QUESTION_STARTER",
    title: "Question Explorer",
    description: "Attempted at least 15 practice questions.",
    category: "PRACTICE",
    icon: "🎯",
    tier: "BRONZE",
    criteriaType: "QUESTIONS_COUNT",
    criteriaValue: 15,
    xpReward: 40,
  },
  {
    code: "ACCURACY_BUILDER",
    title: "Accuracy Maestro",
    description: "Achieved an accuracy score of 75% or higher on a completed drill.",
    category: "ACCURACY",
    icon: "⚡",
    tier: "SILVER",
    criteriaType: "ACCURACY_PCT",
    criteriaValue: 75,
    xpReward: 80,
  },
  {
    code: "MISTAKE_REVIEWER",
    title: "Vault Scholar",
    description: "Reviewed and analyzed at least 2 mistakes in your Mistake Vault.",
    category: "MISTAKES",
    icon: "📖",
    tier: "BRONZE",
    criteriaType: "MISTAKES_REVIEWED",
    criteriaValue: 2,
    xpReward: 35,
  },
  {
    code: "SEVEN_DAY_LEARNER",
    title: "Disciplined Aspirant",
    description: "Maintained a learning streak of at least 3 active days.",
    category: "STREAK",
    icon: "🔥",
    tier: "SILVER",
    criteriaType: "STREAK_DAYS",
    criteriaValue: 3,
    xpReward: 60,
  },
  {
    code: "DAILY_CHALLENGER",
    title: "Daily Challenger",
    description: "Successfully completed your first Daily Crack 10 challenge.",
    category: "PRACTICE",
    icon: "🏆",
    tier: "GOLD",
    criteriaType: "CHALLENGES_COUNT",
    criteriaValue: 1,
    xpReward: 100,
  },
  {
    code: "TOPICS_EXPLORER",
    title: "Syllabus Navigator",
    description: "Practiced questions across at least 3 different syllabus topics.",
    category: "PRACTICE",
    icon: "🧭",
    tier: "BRONZE",
    criteriaType: "TOPICS_COUNT",
    criteriaValue: 3,
    xpReward: 40,
  },

  // ─── Phase 7 New Achievements ──────────────────────────────────────────────
  {
    code: "MOCK_MARATHON",
    title: "Mock Warrior",
    description: "Completed 3 full-length mock tests.",
    category: "MOCK",
    icon: "📝",
    tier: "SILVER",
    criteriaType: "MOCK_COUNT",
    criteriaValue: 3,
    xpReward: 120,
  },
  {
    code: "MOCK_PERFECTIONIST",
    title: "Mock Ace",
    description: "Scored 80% or above on a full-length mock test.",
    category: "MOCK",
    icon: "🥇",
    tier: "GOLD",
    criteriaType: "MOCK_ACCURACY",
    criteriaValue: 80,
    xpReward: 200,
  },
  {
    code: "XP_MILESTONE_500",
    title: "XP Hunter",
    description: "Earned 500 total XP through consistent practice.",
    category: "XP",
    icon: "⭐",
    tier: "BRONZE",
    criteriaType: "XP_TOTAL",
    criteriaValue: 500,
    xpReward: 50,
  },
  {
    code: "XP_MILESTONE_2000",
    title: "XP Champion",
    description: "Earned 2000 total XP — a true career cracker.",
    category: "XP",
    icon: "🌟",
    tier: "SILVER",
    criteriaType: "XP_TOTAL",
    criteriaValue: 2000,
    xpReward: 150,
  },
  {
    code: "STREAK_7_DAYS",
    title: "Week Warrior",
    description: "Maintained an unbroken study streak for 7 days.",
    category: "STREAK",
    icon: "🗓️",
    tier: "GOLD",
    criteriaType: "STREAK_DAYS",
    criteriaValue: 7,
    xpReward: 150,
  },
  {
    code: "STREAK_30_DAYS",
    title: "Month Master",
    description: "Maintained an unbroken study streak for 30 consecutive days.",
    category: "STREAK",
    icon: "🔱",
    tier: "GOLD",
    criteriaType: "STREAK_DAYS",
    criteriaValue: 30,
    xpReward: 500,
  },
  {
    code: "ACCURACY_90",
    title: "Precision Elite",
    description: "Achieved 90%+ accuracy on a practice drill (min. 5 questions).",
    category: "ACCURACY",
    icon: "🎖️",
    tier: "GOLD",
    criteriaType: "ACCURACY_PCT",
    criteriaValue: 90,
    xpReward: 200,
  },
  {
    code: "QUESTIONS_100",
    title: "Century Club",
    description: "Answered 100 practice questions correctly.",
    category: "PRACTICE",
    icon: "💯",
    tier: "SILVER",
    criteriaType: "QUESTIONS_COUNT",
    criteriaValue: 100,
    xpReward: 100,
  },
  {
    code: "QUESTIONS_500",
    title: "Question Titan",
    description: "Answered 500 practice questions — an unstoppable aspirant.",
    category: "PRACTICE",
    icon: "🦅",
    tier: "GOLD",
    criteriaType: "QUESTIONS_COUNT",
    criteriaValue: 500,
    xpReward: 300,
  },
  {
    code: "MISTAKE_HUNTER_10",
    title: "Mistake Slayer",
    description: "Resolved and reviewed at least 10 mistakes from your Vault.",
    category: "MISTAKES",
    icon: "🛡️",
    tier: "SILVER",
    criteriaType: "MISTAKES_REVIEWED",
    criteriaValue: 10,
    xpReward: 120,
  },

  // ─── Phase 9 Question Bank Achievements ──────────────────────────────────
  {
    code: "QUESTION_HUNTER_250",
    title: "Question Hunter",
    description: "Attempted 250 practice and PYQ questions.",
    category: "PRACTICE",
    icon: "🏹",
    tier: "SILVER",
    criteriaType: "QUESTIONS_COUNT",
    criteriaValue: 250,
    xpReward: 180,
  },
  {
    code: "QUESTION_MASTER_1000",
    title: "Question Master",
    description: "Conquered 1,000 question attempts across multiple subjects.",
    category: "PRACTICE",
    icon: "👑",
    tier: "GOLD",
    criteriaType: "QUESTIONS_COUNT",
    criteriaValue: 1000,
    xpReward: 400,
  },
  {
    code: "QUESTION_LEGEND_2500",
    title: "Question Legend",
    description: "Reached 2,500 total question attempts in your preparation journey.",
    category: "PRACTICE",
    icon: "⚡",
    tier: "GOLD",
    criteriaType: "QUESTIONS_COUNT",
    criteriaValue: 2500,
    xpReward: 800,
  },
  {
    code: "CRACKER_5K",
    title: "5K Cracker",
    description: "Mastered 5,000 question attempts — ultimate mastery of the question bank!",
    category: "PRACTICE",
    icon: "🏆",
    tier: "GOLD",
    criteriaType: "QUESTIONS_COUNT",
    criteriaValue: 5000,
    xpReward: 1500,
  },
];

export async function ensureDefaultAchievements() {
  for (const a of DEFAULT_ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      update: {
        title: a.title,
        description: a.description,
        icon: a.icon,
        tier: a.tier,
        category: a.category,
        criteriaType: a.criteriaType,
        criteriaValue: a.criteriaValue,
        xpReward: a.xpReward ?? 50,
      },
      create: {
        code: a.code,
        title: a.title,
        description: a.description,
        icon: a.icon,
        tier: a.tier,
        category: a.category,
        criteriaType: a.criteriaType,
        criteriaValue: a.criteriaValue,
        xpReward: a.xpReward ?? 50,
      },
    });
  }
}

export async function evaluateAndAwardAchievements(userId: string) {
  try {
    await ensureDefaultAchievements();

    // 1. Gather actual user metrics
    const completedSessionsCount = await prisma.practiceSession.count({
      where: { userId, status: "COMPLETED" },
    });

    const questionsAnsweredCount = await prisma.practiceSessionQuestion.count({
      where: {
        session: { userId, status: "COMPLETED" },
        isAnswered: true,
      },
    });

    const highAccuracySession = await prisma.practiceSession.findFirst({
      where: {
        userId,
        status: "COMPLETED",
        totalQuestions: { gte: 5 },
        accuracy: { gte: 75 },
      },
    });

    const veryHighAccuracySession = await prisma.practiceSession.findFirst({
      where: {
        userId,
        status: "COMPLETED",
        totalQuestions: { gte: 5 },
        accuracy: { gte: 90 },
      },
    });

    const mistakesReviewedCount = await prisma.userMistake.count({
      where: {
        userId,
        reviewStatus: { in: ["REVIEWED", "RESOLVED"] },
      },
    });

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { streakDays: true, longestStreak: true },
    });
    const currentStreak = Math.max(userProfile?.streakDays || 1, userProfile?.longestStreak || 1);

    const challengesCount = await prisma.dailyChallengeAttempt.count({
      where: { userId },
    });

    // Distinct topics practiced
    const distinctTopics = await prisma.practiceSessionQuestion.findMany({
      where: {
        session: { userId, status: "COMPLETED" },
        isAnswered: true,
      },
      select: { question: { select: { topicId: true } } },
      distinct: ["questionId"],
    });
    const distinctTopicSet = new Set(distinctTopics.map((d) => d.question.topicId).filter(Boolean));
    const topicsCount = distinctTopicSet.size;

    // Phase 7: Mock test metrics
    const mockTestCount = await prisma.mockTestAttempt.count({
      where: { userId, status: "COMPLETED" },
    });

    const highAccuracyMock = await prisma.mockTestAttempt.findFirst({
      where: { userId, status: "COMPLETED", accuracy: { gte: 80 } },
    });

    // Phase 7: Total XP
    const userLevelRec = await (prisma as any).userLevel.findUnique({
      where: { userId },
      select: { totalXP: true },
    });
    const totalXP = userLevelRec?.totalXP ?? 0;

    // 2. Fetch all achievements and existing earned list
    const allAchievements = await prisma.achievement.findMany();
    const existingEarned = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    const earnedSet = new Set(existingEarned.map((e) => e.achievementId));

    const newlyAwarded: string[] = [];

    for (const ach of allAchievements) {
      if (earnedSet.has(ach.id)) continue;

      let qualified = false;

      switch (ach.criteriaType) {
        case "SESSIONS_COUNT":
          qualified = completedSessionsCount >= ach.criteriaValue;
          break;
        case "QUESTIONS_COUNT":
          qualified = questionsAnsweredCount >= ach.criteriaValue;
          break;
        case "ACCURACY_PCT":
          if (ach.criteriaValue >= 90) {
            qualified = !!veryHighAccuracySession;
          } else {
            qualified = !!highAccuracySession;
          }
          break;
        case "MISTAKES_REVIEWED":
          qualified = mistakesReviewedCount >= ach.criteriaValue;
          break;
        case "STREAK_DAYS":
          qualified = currentStreak >= ach.criteriaValue;
          break;
        case "CHALLENGES_COUNT":
          qualified = challengesCount >= ach.criteriaValue;
          break;
        case "TOPICS_COUNT":
          qualified = topicsCount >= ach.criteriaValue;
          break;
        case "MOCK_COUNT":
          qualified = mockTestCount >= ach.criteriaValue;
          break;
        case "MOCK_ACCURACY":
          qualified = !!highAccuracyMock;
          break;
        case "XP_TOTAL":
          qualified = totalXP >= ach.criteriaValue;
          break;
      }

      if (qualified) {
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId,
              achievementId: ach.id,
            },
          },
          update: {},
          create: {
            userId,
            achievementId: ach.id,
          },
        });
        newlyAwarded.push(ach.title);

        // Award XP for unlocking this achievement
        const xpReward = (ach as any).xpReward;
        if (xpReward && xpReward > 0) {
          try {
            const { awardXP } = await import("@/lib/xp-engine");
            await awardXP(userId, "ACHIEVEMENT_UNLOCK", ach.id, xpReward);
          } catch (xpErr) {
            console.error("Error awarding achievement XP:", xpErr);
          }
        }
      }
    }

    return newlyAwarded;
  } catch (err) {
    console.error("Error evaluating achievements:", err);
    return [];
  }
}
