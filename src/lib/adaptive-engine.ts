import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// TOPIC MASTERY DEFINITIONS & THRESHOLDS (Documented in Code)
// ---------------------------------------------------------------------------
// 1. NEW: 0 recorded attempts
// 2. LEARNING: 1 - 3 attempts, establishing baseline
// 3. DEVELOPING: 4 - 9 attempts, accuracy between 50% and 74%
// 4. STRONG: >= 6 attempts, accuracy >= 75%
// 5. MASTERED: >= 10 attempts, accuracy >= 80%, across at least 2 distinct days/sessions
// 6. NEEDS_REVISION: Previously Strong or Mastered, but recent accuracy < 60% OR unpracticed for >= 14 days
// ---------------------------------------------------------------------------

export type MasteryState = "NEW" | "LEARNING" | "DEVELOPING" | "STRONG" | "MASTERED" | "NEEDS_REVISION";

export interface NextBestActionItem {
  id: string;
  title: string;
  subtitle: string;
  reason: string;
  metricProof: string;
  actionUrl: string;
  buttonLabel: string;
  priorityType:
    | "REPEATED_MISTAKE"
    | "WEAK_TOPIC"
    | "DECLINING_TOPIC"
    | "INSUFFICIENT_COVERAGE"
    | "REVISION_DUE"
    | "BALANCED_PRACTICE"
    | "CHALLENGE"
    | "FULL_MOCK";
}

export interface HoldingBackItem {
  id: string;
  category: "ACCURACY" | "TIME_MANAGEMENT" | "MISTAKE_BACKLOG" | "REVISION_GAP" | "COVERAGE_DEFICIT" | "MOCK_READINESS";
  title: string;
  description: string;
  severity: "CRITICAL" | "MODERATE" | "LOW";
  fixUrl: string;
  fixLabel: string;
  metric: string;
}

export interface ReadinessScoreComponent {
  name: string;
  score: number; // 0 - 100
  weight: number;
  description: string;
  status: "OPTIMAL" | "ADEQUATE" | "NEEDS_ATTENTION";
}

export interface ComprehensiveReadiness {
  compositeScore: number; // 0 - 100
  previousScore: number;
  scoreDelta: number;
  trendSummary: string;
  components: {
    coverage: ReadinessScoreComponent;
    accuracy: ReadinessScoreComponent;
    consistency: ReadinessScoreComponent;
    mockPerformance: ReadinessScoreComponent;
    mistakeHealth: ReadinessScoreComponent;
    revisionHealth: ReadinessScoreComponent;
  };
  holdingBack: HoldingBackItem[];
  nextBestAction: NextBestActionItem;
}

export interface TopicMasteryDetail {
  topicId: string;
  topicName: string;
  topicSlug: string;
  subjectId: string;
  subjectName: string;
  masteryState: MasteryState;
  questionsAttempted: number;
  correctAnswers: number;
  accuracy: number;
  daysSinceLastPracticed: number | null;
  totalAvailableQuestions: number;
  coveragePct: number;
  unresolvedMistakes: number;
  masteryExplanation: string;
}

// ---------------------------------------------------------------------------
// 1. TOPIC MASTERY EVALUATION
// ---------------------------------------------------------------------------

export function calculateTopicMastery(stats: {
  attempted: number;
  correct: number;
  accuracy: number;
  daysSinceLastPracticed: number | null;
  sessionCount: number;
  recentAccuracy?: number;
}): { state: MasteryState; explanation: string } {
  const { attempted, accuracy, daysSinceLastPracticed, sessionCount, recentAccuracy } = stats;

  if (attempted === 0) {
    return {
      state: "NEW",
      explanation: "No questions attempted yet in this syllabus topic.",
    };
  }

  // Check for Needs Revision (Decay or Recent Drop)
  if (
    attempted >= 6 &&
    ((daysSinceLastPracticed !== null && daysSinceLastPracticed >= 14) ||
      (recentAccuracy !== undefined && recentAccuracy < 60 && accuracy >= 70))
  ) {
    return {
      state: "NEEDS_REVISION",
      explanation:
        daysSinceLastPracticed !== null && daysSinceLastPracticed >= 14
          ? `Unpracticed for ${daysSinceLastPracticed} days. Retention decay alert.`
          : `Recent accuracy dropped to ${recentAccuracy}%, below your historical ${accuracy}%.`,
    };
  }

  // Mastered rule: at least 10 attempts, 80%+ accuracy, across at least 2 sessions
  if (attempted >= 10 && accuracy >= 80 && sessionCount >= 2) {
    return {
      state: "MASTERED",
      explanation: `Mastered with ${accuracy}% accuracy across ${attempted} questions and multiple sessions.`,
    };
  }

  // Strong: at least 6 attempts, 75%+ accuracy
  if (attempted >= 6 && accuracy >= 75) {
    return {
      state: "STRONG",
      explanation: `Solid fundamentals: ${accuracy}% accuracy across ${attempted} questions.`,
    };
  }

  // Developing: 4-9 attempts, 50-74% accuracy OR >= 10 attempts with 60-79% accuracy
  if (attempted >= 4 && accuracy >= 50) {
    return {
      state: "DEVELOPING",
      explanation: `Moderate mastery (${accuracy}% accuracy, ${attempted} attempted). Needs targeted drill.`,
    };
  }

  // Learning: 1-3 attempts OR < 50% accuracy with few attempts
  return {
    state: "LEARNING",
    explanation: `Early learning phase (${attempted} attempted, ${accuracy}% accuracy).`,
  };
}

// ---------------------------------------------------------------------------
// 2. COMPUTE ADAPTIVE RECOMMENDATIONS, READINESS & NEXT BEST ACTION
// ---------------------------------------------------------------------------

export async function computeAdaptiveIntelligence(userId: string): Promise<{
  readiness: ComprehensiveReadiness;
  topicMasteryList: TopicMasteryDetail[];
  nextBestAction: NextBestActionItem;
  holdingBack: HoldingBackItem[];
}> {
  const now = new Date();

  // Fetch all user raw data in parallel
  const [
    userProfile,
    userMistakes,
    allTopics,
    allSubjects,
    practiceQuestions,
    mockAttempts,
    dailyAttempts,
    revisionItems,
    allQuestionsCount,
  ] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId },
    }),
    prisma.userMistake.findMany({
      where: { userId },
      include: {
        question: {
          include: { topic: true, subject: true },
        },
      },
      orderBy: { timesIncorrect: "desc" },
    }),
    prisma.topic.findMany({
      where: { active: true },
      include: {
        subject: { select: { id: true, name: true, slug: true, category: true } },
        _count: { select: { questions: { where: { active: true } } } },
      },
    }),
    prisma.subject.findMany({
      where: { active: true },
      select: { id: true, name: true, slug: true, category: true },
    }),
    prisma.practiceSessionQuestion.findMany({
      where: {
        session: { userId, status: "COMPLETED" },
        isAnswered: true,
      },
      select: {
        id: true,
        sessionId: true,
        answerStatus: true,
        timeSpentSeconds: true,
        createdAt: true,
        question: {
          select: {
            id: true,
            topicId: true,
            subjectId: true,
            difficulty: true,
          },
        },
      },
    }),
    prisma.mockTestAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 10,
    }),
    prisma.dailyChallengeAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: 30,
    }),
    (prisma as any).revisionItem.findMany({
      where: { userId, status: "PENDING" },
      include: { topic: true, subject: true },
    }),
    prisma.question.count({ where: { active: true } }),
  ]);

  // Group practice questions by topic
  const topicAgg: Record<
    string,
    {
      attempted: number;
      correct: number;
      sessions: Set<string>;
      lastPracticed: Date | null;
      recentCorrect: number;
      recentTotal: number;
    }
  > = {};

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  practiceQuestions.forEach((pq) => {
    const tid = pq.question.topicId;
    if (!topicAgg[tid]) {
      topicAgg[tid] = {
        attempted: 0,
        correct: 0,
        sessions: new Set(),
        lastPracticed: null,
        recentCorrect: 0,
        recentTotal: 0,
      };
    }
    topicAgg[tid].attempted++;
    topicAgg[tid].sessions.add(pq.sessionId);
    if (pq.answerStatus === "CORRECT") topicAgg[tid].correct++;

    if (!topicAgg[tid].lastPracticed || pq.createdAt > topicAgg[tid].lastPracticed!) {
      topicAgg[tid].lastPracticed = pq.createdAt;
    }

    if (pq.createdAt >= sevenDaysAgo) {
      topicAgg[tid].recentTotal++;
      if (pq.answerStatus === "CORRECT") topicAgg[tid].recentCorrect++;
    }
  });

  // Calculate mastery details for each topic
  const topicMasteryList: TopicMasteryDetail[] = allTopics.map((top) => {
    const agg = topicAgg[top.id];
    const attempted = agg?.attempted || 0;
    const correct = agg?.correct || 0;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const sessionCount = agg?.sessions.size || 0;
    const recentAccuracy = agg?.recentTotal ? Math.round((agg.recentCorrect / agg.recentTotal) * 100) : undefined;

    let daysSinceLastPracticed: number | null = null;
    if (agg?.lastPracticed) {
      daysSinceLastPracticed = Math.floor(
        (now.getTime() - agg.lastPracticed.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    const { state, explanation } = calculateTopicMastery({
      attempted,
      correct,
      accuracy,
      daysSinceLastPracticed,
      sessionCount,
      recentAccuracy,
    });

    const totalAvailable = top._count.questions;
    const coveragePct = totalAvailable > 0 ? Math.min(100, Math.round((attempted / totalAvailable) * 100)) : 0;
    const unresolvedMistakes = userMistakes.filter(
      (m) => m.question?.topicId === top.id && m.reviewStatus === "UNRESOLVED"
    ).length;

    return {
      topicId: top.id,
      topicName: top.name,
      topicSlug: top.slug,
      subjectId: top.subjectId,
      subjectName: top.subject.name,
      masteryState: state,
      questionsAttempted: attempted,
      correctAnswers: correct,
      accuracy,
      daysSinceLastPracticed,
      totalAvailableQuestions: totalAvailable,
      coveragePct,
      unresolvedMistakes,
      masteryExplanation: explanation,
    };
  });

  // -------------------------------------------------------------------------
  // READINESS COMPONENTS CALCULATION (Actual Data Only)
  // -------------------------------------------------------------------------

  // 1. Coverage: % topics with at least 1 attempt
  const totalTopicsCount = allTopics.length;
  const attemptedTopicsCount = topicMasteryList.filter((t) => t.questionsAttempted > 0).length;
  const coverageScore = totalTopicsCount > 0 ? Math.round((attemptedTopicsCount / totalTopicsCount) * 100) : 0;

  // 2. Accuracy: weighted practice accuracy
  const totalAttemptedQuestions = practiceQuestions.length;
  const totalCorrectQuestions = practiceQuestions.filter((p) => p.answerStatus === "CORRECT").length;
  const accuracyScore =
    totalAttemptedQuestions > 0 ? Math.round((totalCorrectQuestions / totalAttemptedQuestions) * 100) : 0;

  // 3. Consistency: streak & daily activity
  const currentStreak = userProfile?.streakDays || 0;
  const consistencyScore = Math.min(100, currentStreak * 15 + dailyAttempts.length * 5);

  // 4. Mock Performance: completion & average score
  let mockPerformanceScore = 0;
  if (mockAttempts.length > 0) {
    const avgScore = mockAttempts.reduce((acc, m) => acc + (m.accuracy || 0), 0) / mockAttempts.length;
    mockPerformanceScore = Math.min(100, Math.round(avgScore * 0.7 + Math.min(30, mockAttempts.length * 10)));
  }

  // 5. Mistake Health: ratio of resolved vs total mistakes
  const totalMistakes = userMistakes.length;
  const unresolvedCount = userMistakes.filter((m) => m.reviewStatus === "UNRESOLVED").length;
  const resolvedCount = totalMistakes - unresolvedCount;
  const mistakeHealthScore =
    totalMistakes === 0 ? 100 : Math.round((resolvedCount / totalMistakes) * 100);

  // 6. Revision Health: based on revision items & topics needing revision
  const needsRevisionTopics = topicMasteryList.filter((t) => t.masteryState === "NEEDS_REVISION").length;
  const revisionHealthScore = Math.max(0, 100 - needsRevisionTopics * 15);

  // Composite Weighted Readiness (0 - 100)
  const compositeScore = Math.round(
    coverageScore * 0.25 +
      accuracyScore * 0.3 +
      consistencyScore * 0.15 +
      mockPerformanceScore * 0.15 +
      mistakeHealthScore * 0.08 +
      revisionHealthScore * 0.07
  );

  const previousScore = userProfile?.readinessScore ?? 35;
  const scoreDelta = compositeScore - previousScore;

  let trendSummary = "Readiness steady with active baseline.";
  if (scoreDelta > 0) {
    trendSummary = `Readiness climbed +${scoreDelta}% due to improved topic accuracy and active practice consistency.`;
  } else if (scoreDelta < 0) {
    trendSummary = `Readiness dipped ${scoreDelta}% reflecting unresolved mistake clusters and syllabus coverage gaps.`;
  }

  const readinessComponents: ComprehensiveReadiness["components"] = {
    coverage: {
      name: "Syllabus Coverage",
      score: coverageScore,
      weight: 0.25,
      description: `${attemptedTopicsCount} of ${totalTopicsCount} syllabus topics practiced.`,
      status: coverageScore >= 70 ? "OPTIMAL" : coverageScore >= 40 ? "ADEQUATE" : "NEEDS_ATTENTION",
    },
    accuracy: {
      name: "Solving Accuracy",
      score: accuracyScore,
      weight: 0.3,
      description: `${accuracyScore}% overall accuracy across ${totalAttemptedQuestions} questions.`,
      status: accuracyScore >= 75 ? "OPTIMAL" : accuracyScore >= 55 ? "ADEQUATE" : "NEEDS_ATTENTION",
    },
    consistency: {
      name: "Study Consistency",
      score: consistencyScore,
      weight: 0.15,
      description: `${currentStreak} day study streak with ${dailyAttempts.length} daily challenges recorded.`,
      status: consistencyScore >= 70 ? "OPTIMAL" : consistencyScore >= 35 ? "ADEQUATE" : "NEEDS_ATTENTION",
    },
    mockPerformance: {
      name: "Mock Exam Simulation",
      score: mockPerformanceScore,
      weight: 0.15,
      description:
        mockAttempts.length > 0
          ? `${mockAttempts.length} full-length mock tests completed.`
          : "No full-length mock tests attempted yet.",
      status: mockPerformanceScore >= 70 ? "OPTIMAL" : mockPerformanceScore >= 30 ? "ADEQUATE" : "NEEDS_ATTENTION",
    },
    mistakeHealth: {
      name: "Mistake Vault Health",
      score: mistakeHealthScore,
      weight: 0.08,
      description: `${resolvedCount} resolved vs ${unresolvedCount} unresolved mistake records.`,
      status: unresolvedCount <= 3 ? "OPTIMAL" : unresolvedCount <= 8 ? "ADEQUATE" : "NEEDS_ATTENTION",
    },
    revisionHealth: {
      name: "Spaced Retention Health",
      score: revisionHealthScore,
      weight: 0.07,
      description:
        needsRevisionTopics === 0
          ? "All active topics are within optimal retention windows."
          : `${needsRevisionTopics} topics are due for spaced repetition review.`,
      status: needsRevisionTopics === 0 ? "OPTIMAL" : needsRevisionTopics <= 2 ? "ADEQUATE" : "NEEDS_ATTENTION",
    },
  };

  // -------------------------------------------------------------------------
  // 3. "WHAT IS HOLDING ME BACK?" DIAGNOSTIC
  // -------------------------------------------------------------------------

  const holdingBack: HoldingBackItem[] = [];

  // Diagnostic 1: Repeated Unresolved Mistakes
  const repeatedMistakes = userMistakes.filter((m) => m.reviewStatus === "UNRESOLVED" && m.timesIncorrect >= 2);
  if (repeatedMistakes.length > 0) {
    holdingBack.push({
      id: "diag-repeated-mistakes",
      category: "MISTAKE_BACKLOG",
      title: "Repeated Mistake Traps",
      description: `You have ${repeatedMistakes.length} questions answered incorrectly 2 or more times. These signify recurring conceptual traps.`,
      severity: "CRITICAL",
      fixUrl: "/mistakes",
      fixLabel: "Clear Mistake Traps →",
      metric: `${repeatedMistakes.length} Questions`,
    });
  } else if (unresolvedCount >= 5) {
    holdingBack.push({
      id: "diag-mistake-backlog",
      category: "MISTAKE_BACKLOG",
      title: "Unresolved Mistake Vault Backlog",
      description: `${unresolvedCount} incorrect questions have accumulated without review. Mistakes left unanalyzed tend to recur in mock tests.`,
      severity: "MODERATE",
      fixUrl: "/mistakes",
      fixLabel: "Review Vault →",
      metric: `${unresolvedCount} Pending`,
    });
  }

  // Diagnostic 2: Weak Syllabus Topics
  const weakTopics = topicMasteryList
    .filter((t) => t.questionsAttempted >= 4 && t.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy);

  if (weakTopics.length > 0) {
    const worst = weakTopics[0];
    holdingBack.push({
      id: `diag-weak-${worst.topicId}`,
      category: "ACCURACY",
      title: `Low Accuracy in ${worst.topicName}`,
      description: `Accuracy is currently ${worst.accuracy}% across ${worst.questionsAttempted} attempts in ${worst.subjectName}.`,
      severity: worst.accuracy < 45 ? "CRITICAL" : "MODERATE",
      fixUrl: `/practice?topic=${worst.topicSlug}`,
      fixLabel: `Drill ${worst.topicName} →`,
      metric: `${worst.accuracy}% Accuracy`,
    });
  }

  // Diagnostic 3: Revision Gap
  if (needsRevisionTopics > 0) {
    const overdue = topicMasteryList.find((t) => t.masteryState === "NEEDS_REVISION")!;
    holdingBack.push({
      id: "diag-revision-gap",
      category: "REVISION_GAP",
      title: "Spaced Retention Decay",
      description: `${needsRevisionTopics} topics have not been practiced recently (including ${overdue.topicName}), leading to memory decay.`,
      severity: "MODERATE",
      fixUrl: "/revision",
      fixLabel: "Open Revision Center →",
      metric: `${needsRevisionTopics} Overdue`,
    });
  }

  // Diagnostic 4: Lack of Mock Tests
  if (mockAttempts.length === 0 && totalAttemptedQuestions >= 25) {
    holdingBack.push({
      id: "diag-no-mocks",
      category: "MOCK_READINESS",
      title: "No Mock Test Simulations",
      description: "You have built practice volume, but haven't tested yourself under timed, multi-section exam conditions.",
      severity: "MODERATE",
      fixUrl: "/mock-tests",
      fixLabel: "Take First Mock Test →",
      metric: "0 Completed",
    });
  }

  // Diagnostic 5: Coverage Gap
  const unpracticedCount = topicMasteryList.filter((t) => t.questionsAttempted === 0).length;
  if (unpracticedCount >= 4 && holdingBack.length < 4) {
    holdingBack.push({
      id: "diag-coverage-gap",
      category: "COVERAGE_DEFICIT",
      title: "Unopened Syllabus Areas",
      description: `${unpracticedCount} topics in your exam curriculum have zero practice attempts recorded.`,
      severity: "LOW",
      fixUrl: "/exam-intelligence",
      fixLabel: "Inspect Syllabus →",
      metric: `${unpracticedCount} Topics`,
    });
  }

  // -------------------------------------------------------------------------
  // 4. ONE SINGLE NEXT BEST ACTION (Strict Priority Hierarchy)
  // -------------------------------------------------------------------------

  let nextBestAction: NextBestActionItem;

  if (repeatedMistakes.length > 0) {
    const topMistake = repeatedMistakes[0];
    nextBestAction = {
      id: "nba-repeated-mistake",
      title: `Eliminate Repeated Trap in ${topMistake.question?.topic?.name || "Mistake Vault"}`,
      subtitle: `Incorrect ${topMistake.timesIncorrect} times`,
      reason: `You have tripped on this exact concept multiple times. Reviewing the shortcut and explanation right now stops the mistake pattern.`,
      metricProof: `${topMistake.timesIncorrect}x Recurring`,
      actionUrl: "/mistakes",
      buttonLabel: "Fix Mistake Now →",
      priorityType: "REPEATED_MISTAKE",
    };
  } else if (weakTopics.length > 0) {
    const worst = weakTopics[0];
    nextBestAction = {
      id: `nba-weak-topic-${worst.topicId}`,
      title: `Targeted Mastery Drill: ${worst.topicName}`,
      subtitle: `${worst.subjectName} • ${worst.accuracy}% Accuracy`,
      reason: `This topic is your highest-impact vulnerability. Raising accuracy from ${worst.accuracy}% to 75% will boost your exam readiness score significantly.`,
      metricProof: `${worst.accuracy}% Accuracy (${worst.questionsAttempted} attempts)`,
      actionUrl: `/practice?topic=${worst.topicSlug}`,
      buttonLabel: `Drill ${worst.topicName} →`,
      priorityType: "WEAK_TOPIC",
    };
  } else if (needsRevisionTopics > 0) {
    const overdue = topicMasteryList.find((t) => t.masteryState === "NEEDS_REVISION")!;
    nextBestAction = {
      id: `nba-revision-${overdue.topicId}`,
      title: `Revise ${overdue.topicName} (Retention Interval Due)`,
      subtitle: `Last practiced ${overdue.daysSinceLastPracticed || 14} days ago`,
      reason: `Human memory decays on a predictable forgetting curve. A quick 5-question review now preserves weeks of prior study effort.`,
      metricProof: `${overdue.daysSinceLastPracticed || 14} Days Inactive`,
      actionUrl: `/crack-mode?topic=${overdue.topicSlug}&count=5`,
      buttonLabel: "Revise Topic →",
      priorityType: "REVISION_DUE",
    };
  } else if (mockAttempts.length === 0 && totalAttemptedQuestions >= 20) {
    nextBestAction = {
      id: "nba-first-mock",
      title: "Take a Full-Length Mock Exam Simulation",
      subtitle: "Official Pattern & Timer Calibration",
      reason: "Your question accuracy is solid. Now benchmark your section speed, negative marking discipline, and endurance.",
      metricProof: `${totalAttemptedQuestions} Questions Mastered`,
      actionUrl: "/mock-tests",
      buttonLabel: "Start Mock Test →",
      priorityType: "FULL_MOCK",
    };
  } else if (unpracticedCount > 0) {
    const nextTopic = topicMasteryList.find((t) => t.questionsAttempted === 0)!;
    nextBestAction = {
      id: `nba-coverage-${nextTopic.topicId}`,
      title: `Expand Syllabus: ${nextTopic.topicName}`,
      subtitle: `${nextTopic.subjectName} (${nextTopic.totalAvailableQuestions} questions ready)`,
      reason: "You have zero attempts in this syllabus topic. Taking an introductory drill establishes your baseline score.",
      metricProof: "0% Coverage",
      actionUrl: `/practice?topic=${nextTopic.topicSlug}`,
      buttonLabel: `Start ${nextTopic.topicName} →`,
      priorityType: "INSUFFICIENT_COVERAGE",
    };
  } else {
    nextBestAction = {
      id: "nba-adaptive-crack",
      title: "Launch Adaptive Crack Mode",
      subtitle: "AI-Curated 10-Question Drill",
      reason: "An intelligent mix of challenging, PYQ, and balanced questions tailored to your current performance level.",
      metricProof: `${compositeScore}% Readiness`,
      actionUrl: "/crack-mode",
      buttonLabel: "Start Adaptive Drill →",
      priorityType: "CHALLENGE",
    };
  }

  return {
    readiness: {
      compositeScore,
      previousScore,
      scoreDelta,
      trendSummary,
      components: readinessComponents,
      holdingBack,
      nextBestAction,
    },
    topicMasteryList,
    nextBestAction,
    holdingBack,
  };
}

// ---------------------------------------------------------------------------
// 5. ADAPTIVE QUESTION SELECTION ENGINE (For /crack-mode)
// ---------------------------------------------------------------------------

export async function selectAdaptiveQuestions(
  userId: string,
  options: {
    count: number;
    mode?: "QUICK" | "BALANCED" | "CHALLENGE";
    examId?: string;
    subjectId?: string;
    topicId?: string;
  }
): Promise<Array<any>> {
  const { count = 10, mode = "BALANCED", examId, subjectId, topicId } = options;

  // 1. Fetch user's exposures to minimize repetitive serving
  const existingExposures = await (prisma as any).questionExposure.findMany({
    where: { userId },
    select: { questionId: true, timesShown: true, lastResult: true },
  });
  const exposureMap = new Map<string, any>(existingExposures.map((e: any) => [e.questionId, e]));

  // 2. Fetch user's unresolved mistakes
  const userMistakes = await prisma.userMistake.findMany({
    where: { userId, reviewStatus: "UNRESOLVED" },
    select: { questionId: true, timesIncorrect: true },
  });
  const mistakeMap = new Map(userMistakes.map((m) => [m.questionId, m.timesIncorrect]));

  // 3. Fetch topic mastery details to know weak topics
  const topicProgressRecords = await prisma.topicProgress.findMany({
    where: { userId },
    select: { topicId: true, accuracy: true, questionsAttempted: true },
  });
  const weakTopicIds = new Set(
    topicProgressRecords.filter((tp) => tp.questionsAttempted >= 3 && tp.accuracy < 65).map((tp) => tp.topicId)
  );

  // 4. Build base query for active questions
  const whereClause: any = { active: true };
  if (examId) whereClause.examId = examId;
  if (subjectId) whereClause.subjectId = subjectId;
  if (topicId) whereClause.topicId = topicId;

  if (mode === "CHALLENGE") {
    whereClause.difficulty = { in: ["MEDIUM", "HARD"] };
  }

  const pool = await prisma.question.findMany({
    where: whereClause,
    include: {
      topic: { select: { id: true, name: true, slug: true } },
      subject: { select: { id: true, name: true, slug: true, icon: true } },
      options: {
        orderBy: { order: "asc" },
        select: { id: true, optionKey: true, optionText: true, order: true },
      },
      pyqMetadata: true,
      tags: { include: { tag: true } },
    },
    take: 120,
  });

  if (pool.length === 0) return [];

  // Score candidate questions for adaptive relevance
  const scored = pool.map((q) => {
    let relevanceScore = 50; // base score
    let reason = "Balanced curriculum question to verify concept understanding.";

    const exposure = exposureMap.get(q.id);
    const timesShown = exposure?.timesShown || 0;

    // Heavily penalize frequently shown questions
    relevanceScore -= timesShown * 18;

    // High priority: Unresolved mistake
    if (mistakeMap.has(q.id)) {
      const timesIncorrect = mistakeMap.get(q.id) || 1;
      relevanceScore += 120 + timesIncorrect * 20;
      reason = `You previously answered this question incorrectly (${timesIncorrect}x) in your Mistake Vault.`;
    }
    // High priority: Weak topic
    else if (weakTopicIds.has(q.topicId)) {
      relevanceScore += 65;
      const tp = topicProgressRecords.find((r) => r.topicId === q.topicId);
      reason = `This topic (${q.topic.name}) has ${tp?.accuracy || 50}% accuracy in your recent practice.`;
    }
    // Priority: PYQ question
    else if (q.sourceType === "PYQ" && q.pyqMetadata) {
      relevanceScore += 35;
      reason = `Verified PYQ from ${q.pyqMetadata.exam} ${q.pyqMetadata.examYear} shift.`;
    }
    // Priority: Never seen before
    else if (timesShown === 0) {
      relevanceScore += 45;
      reason = "Unattempted question to expand your syllabus exposure.";
    }

    if (mode === "CHALLENGE" && q.difficulty === "HARD") {
      relevanceScore += 40;
      reason = "Advanced challenge question to test conceptual depth.";
    }

    return {
      question: q,
      relevanceScore,
      whyThisQuestion: reason,
    };
  });

  // Sort by relevance score descending and take top N
  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const selected = scored.slice(0, count);

  // Record / update QuestionExposure asynchronously
  const nowTime = new Date();
  Promise.all(
    selected.map(async (item) => {
      try {
        await (prisma as any).questionExposure.upsert({
          where: {
            userId_questionId: {
              userId,
              questionId: item.question.id,
            },
          },
          update: {
            timesShown: { increment: 1 },
            lastShownAt: nowTime,
            adaptiveDifficulty: item.question.difficulty,
          },
          create: {
            userId,
            questionId: item.question.id,
            timesShown: 1,
            lastShownAt: nowTime,
            adaptiveDifficulty: item.question.difficulty,
          },
        });
      } catch (err) {
        console.error("Exposure upsert error:", err);
      }
    })
  ).catch(console.error);

  return selected.map((item, idx) => ({
    ...item.question,
    questionOrder: idx + 1,
    whyThisQuestion: item.whyThisQuestion,
  }));
}
