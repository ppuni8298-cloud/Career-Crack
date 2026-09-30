import { prisma } from "@/lib/prisma";

export interface StudentProfileContext {
  userId: string;
  userName: string;
  email: string;
  targetExam: string;
  targetSubjects: string[];
  goalCategory: string;
  dailyStudyHours: string;
  targetExamDate: string | null;
  readinessScore: number;
  streakDays: number;
  longestStreak: number;
  totalQuestionsAttempted: number;
  overallAccuracy: number;
  totalStudyMinutes: number;
  unresolvedMistakesCount: number;
  resolvedMistakesCount: number;
  recentMistakes: Array<{
    id: string;
    questionText: string;
    topicName: string;
    subjectName: string;
    timesIncorrect: number;
    commonMistake?: string;
    concept?: string;
    shortcut?: string;
  }>;
  topicMastery: {
    weak: Array<{
      id: string;
      name: string;
      slug: string;
      subjectName: string;
      accuracy: number;
      attempted: number;
      mistakeCount: number;
      daysSinceLastPracticed?: number;
    }>;
    improving: Array<{
      id: string;
      name: string;
      slug: string;
      subjectName: string;
      accuracy: number;
      attempted: number;
    }>;
    strong: Array<{
      id: string;
      name: string;
      slug: string;
      subjectName: string;
      accuracy: number;
      attempted: number;
    }>;
    unpracticed: Array<{
      id: string;
      name: string;
      slug: string;
      subjectName: string;
      questionCount: number;
    }>;
  };
  retentionDecayTopics: Array<{
    id: string;
    name: string;
    slug: string;
    subjectName: string;
    lastPracticedDaysAgo: number;
    previousAccuracy: number;
  }>;
  mockTestPerformance: {
    attemptsCount: number;
    bestScore: number;
    averageScore: number;
    recentTestTitle?: string;
    recentTestAccuracy?: number;
  };
  dailyCrackStatus: {
    completedToday: boolean;
    totalCompleted: number;
  };
  // Phase 8 Ecosystem Telemetry
  revisionQueueCount: number;
  completedInterviewsCount: number;
  averageInterviewScore: number | null;
}

export interface AIDailyStudyBlock {
  id: string;
  title: string;
  subject: string;
  topicSlug?: string;
  duration: string;
  durationMinutes: number;
  priority: "HIGH" | "MEDIUM" | "NORMAL";
  type: "WEAK_TOPIC" | "MISTAKE_REVISION" | "RETENTION_REFRESHER" | "SYLLABUS_EXPANSION" | "SPEED_CHALLENGE";
  why: string;
  actionText: string;
  actionHref: string;
  readinessGain: string;
}

export interface AIWeaknessInsight {
  topicId: string;
  topicName: string;
  subjectName: string;
  slug: string;
  accuracy: number;
  questionsAttempted: number;
  mistakesCount: number;
  errorPattern: "CONCEPT_GAP" | "CALCULATION_TRAP" | "SPEED_PRESSURE" | "MEMORY_DECAY";
  errorPatternLabel: string;
  explanation: string;
  recommendation: string;
  drillHref: string;
  actionText: string;
}

export interface NextBestAction {
  title: string;
  subtitle: string;
  reason: string;
  actionText: string;
  actionHref: string;
  badge: string;
  readinessGain: string;
  estimatedMinutes: number;
  urgency: "HIGH" | "MEDIUM";
}

/**
 * Compiles a deep, 360-degree real performance profile of a student
 * across all Phases 1-5 database records.
 */
export async function compileStudentProfile(userId: string): Promise<StudentProfileContext | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      dailyTasks: true,
      studyLogs: true,
    },
  });

  if (!user) return null;

  const profile = user.profile;
  const targetExam = profile?.targetExam || "Government & Placement Exams";
  const goalCategory = profile?.goalCategory || "GOVERNMENT";
  const dailyStudyHours = profile?.dailyStudyHours || "2-4 hours";
  const targetExamDate = profile?.targetExamDate?.toISOString().split("T")[0] || null;
  const readinessScore = profile?.readinessScore ?? 35;
  const streakDays = profile?.streakDays ?? 1;
  const longestStreak = profile?.longestStreak ?? 1;

  let targetSubjects: string[] = [];
  try {
    targetSubjects = profile?.targetSubjects ? JSON.parse(profile.targetSubjects) : [];
  } catch {
    targetSubjects = ["Quantitative Aptitude", "Logical Reasoning", "General Awareness", "English"];
  }

  // 1. Fetch practice questions & answers
  const [
    userSessionQuestions,
    userMistakes,
    mockAttempts,
    dailyChallengesAttempted,
    allTopics,
    revisionCountRes,
    interviewsRes,
  ] = await Promise.all([
    prisma.practiceSessionQuestion.findMany({
      where: {
        session: { userId, status: "COMPLETED" },
        isAnswered: true,
      },
      include: {
        question: {
          include: {
            topic: { include: { subject: true } },
            subject: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userMistake.findMany({
      where: { userId },
      include: {
        question: {
          include: {
            topic: true,
            subject: true,
          },
        },
      },
      orderBy: { lastAttemptedAt: "desc" },
    }),
    prisma.mockTestAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      include: {
        mockTest: true,
      },
      orderBy: { completedAt: "desc" },
    }),
    prisma.dailyChallengeAttempt.findMany({
      where: { userId },
      include: { challenge: true },
      orderBy: { completedAt: "desc" },
    }),
    prisma.topic.findMany({
      where: { active: true },
      include: {
        subject: true,
        _count: { select: { questions: true } },
      },
      orderBy: { name: "asc" },
    }),
    (prisma as any).revisionItem.count({
      where: { userId, status: { in: ["PENDING", "SNOOZED"] } },
    }),
    (prisma as any).interviewSession.findMany({
      where: { userId, status: "COMPLETED" },
      select: { score: true },
    }),
  ]);

  const revisionQueueCount: number = (revisionCountRes as any) || 0;
  const completedInterviews: any[] = (interviewsRes as any) || [];
  const completedInterviewsCount = completedInterviews.length;
  const averageInterviewScore =
    completedInterviewsCount > 0
      ? Math.round(
          completedInterviews.reduce((acc: number, s: any) => acc + (s.score || 0), 0) / completedInterviewsCount
        )
      : null;

  // Aggregate questions & time
  const totalQuestionsAttempted = userSessionQuestions.length;
  let correctCount = 0;
  let totalTimeSeconds = 0;

  // Topic metrics accumulator
  const topicStats: Record<
    string,
    {
      id: string;
      name: string;
      slug: string;
      subjectName: string;
      attempted: number;
      correct: number;
      incorrect: number;
      lastPracticed: Date;
    }
  > = {};

  userSessionQuestions.forEach((sq) => {
    if (sq.answerStatus === "CORRECT") correctCount++;
    totalTimeSeconds += sq.timeSpentSeconds || 0;

    const t = sq.question.topic;
    if (t) {
      if (!topicStats[t.id]) {
        topicStats[t.id] = {
          id: t.id,
          name: t.name,
          slug: t.slug,
          subjectName: sq.question.subject?.name || "General",
          attempted: 0,
          correct: 0,
          incorrect: 0,
          lastPracticed: sq.createdAt,
        };
      }
      topicStats[t.id].attempted++;
      if (sq.answerStatus === "CORRECT") topicStats[t.id].correct++;
      else if (sq.answerStatus === "INCORRECT") topicStats[t.id].incorrect++;
      if (sq.createdAt > topicStats[t.id].lastPracticed) {
        topicStats[t.id].lastPracticed = sq.createdAt;
      }
    }
  });

  const overallAccuracy =
    totalQuestionsAttempted > 0
      ? Math.round((correctCount / totalQuestionsAttempted) * 100)
      : 0;

  const totalStudyMinutes = Math.round(totalTimeSeconds / 60);

  // Mistakes analysis
  const unresolvedMistakes = userMistakes.filter((m) => m.reviewStatus === "UNRESOLVED");
  const resolvedMistakes = userMistakes.filter((m) => m.reviewStatus === "RESOLVED");

  // Mistakes count mapped by topicId
  const topicMistakesCount: Record<string, number> = {};
  unresolvedMistakes.forEach((m) => {
    const tid = m.question.topicId;
    topicMistakesCount[tid] = (topicMistakesCount[tid] || 0) + 1;
  });

  // Segregate topics into Weak, Improving, Strong, Unpracticed
  const weakTopics: StudentProfileContext["topicMastery"]["weak"] = [];
  const improvingTopics: StudentProfileContext["topicMastery"]["improving"] = [];
  const strongTopics: StudentProfileContext["topicMastery"]["strong"] = [];
  const retentionDecayTopics: StudentProfileContext["retentionDecayTopics"] = [];

  const now = new Date();

  Object.values(topicStats).forEach((ts) => {
    const acc = Math.round((ts.correct / ts.attempted) * 100);
    const mistakesCount = topicMistakesCount[ts.id] || 0;
    const daysSince = Math.floor(
      (now.getTime() - new Date(ts.lastPracticed).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (acc < 60 || mistakesCount >= 2) {
      weakTopics.push({
        id: ts.id,
        name: ts.name,
        slug: ts.slug,
        subjectName: ts.subjectName,
        accuracy: acc,
        attempted: ts.attempted,
        mistakeCount: mistakesCount,
        daysSinceLastPracticed: daysSince,
      });
    } else if (acc < 80) {
      improvingTopics.push({
        id: ts.id,
        name: ts.name,
        slug: ts.slug,
        subjectName: ts.subjectName,
        accuracy: acc,
        attempted: ts.attempted,
      });
    } else {
      strongTopics.push({
        id: ts.id,
        name: ts.name,
        slug: ts.slug,
        subjectName: ts.subjectName,
        accuracy: acc,
        attempted: ts.attempted,
      });
    }

    // Check for retention decay (practiced before, but dormant >= 5 days)
    if (daysSince >= 5 && ts.attempted >= 3) {
      retentionDecayTopics.push({
        id: ts.id,
        name: ts.name,
        slug: ts.slug,
        subjectName: ts.subjectName,
        lastPracticedDaysAgo: daysSince,
        previousAccuracy: acc,
      });
    }
  });

  // Sort weak topics by urgency (most mistakes first, then lowest accuracy)
  weakTopics.sort((a, b) => b.mistakeCount - a.mistakeCount || a.accuracy - b.accuracy);
  retentionDecayTopics.sort((a, b) => b.lastPracticedDaysAgo - a.lastPracticedDaysAgo);

  // Identify unpracticed topics
  const practicedIds = new Set(Object.keys(topicStats));
  const unpracticedTopics = allTopics
    .filter((t) => !practicedIds.has(t.id) && t._count.questions > 0)
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      subjectName: t.subject?.name || "General",
      questionCount: t._count.questions,
    }));

  // Mock test performance
  const mockScores = mockAttempts.map((m) => m.score);
  const bestScore = mockScores.length > 0 ? Math.max(...mockScores) : 0;
  const averageScore =
    mockScores.length > 0
      ? Math.round(mockScores.reduce((a, b) => a + b, 0) / mockScores.length)
      : 0;
  const recentMock = mockAttempts[0];

  // Daily challenge today check
  const todayStr = now.toISOString().split("T")[0];
  const completedToday = dailyChallengesAttempted.some(
    (a) => a.challenge.date === todayStr
  );

  return {
    userId: user.id,
    userName: user.name,
    email: user.email,
    targetExam,
    targetSubjects,
    goalCategory,
    dailyStudyHours,
    targetExamDate,
    readinessScore,
    streakDays,
    longestStreak,
    totalQuestionsAttempted,
    overallAccuracy,
    totalStudyMinutes,
    unresolvedMistakesCount: unresolvedMistakes.length,
    resolvedMistakesCount: resolvedMistakes.length,
    recentMistakes: unresolvedMistakes.slice(0, 5).map((m) => ({
      id: m.id,
      questionText: m.question.questionText,
      topicName: m.question.topic?.name || "Topic",
      subjectName: m.question.subject?.name || "Subject",
      timesIncorrect: m.timesIncorrect,
      commonMistake: m.question.commonMistake || undefined,
      concept: m.question.concept || undefined,
      shortcut: m.question.shortcut || undefined,
    })),
    topicMastery: {
      weak: weakTopics,
      improving: improvingTopics,
      strong: strongTopics,
      unpracticed: unpracticedTopics,
    },
    retentionDecayTopics,
    mockTestPerformance: {
      attemptsCount: mockAttempts.length,
      bestScore,
      averageScore,
      recentTestTitle: recentMock?.mockTest?.title,
      recentTestAccuracy: recentMock ? Math.round(recentMock.accuracy) : undefined,
    },
    dailyCrackStatus: {
      completedToday,
      totalCompleted: dailyChallengesAttempted.length,
    },
    revisionQueueCount,
    completedInterviewsCount,
    averageInterviewScore,
  };
}

/**
 * Answers: "What should I study today, and why should I study it?"
 * Returns 3-4 structured, prioritized study blocks tailored to their study hours & weak points.
 */
export function generateAIDailyPlan(profile: StudentProfileContext): AIDailyStudyBlock[] {
  const blocks: AIDailyStudyBlock[] = [];

  // 1. Block 1: Critical Weakness or Mistake Remediation (Priority HIGH)
  if (profile.unresolvedMistakesCount > 0) {
    const topWeak = profile.topicMastery.weak[0];
    const subject = topWeak ? topWeak.subjectName : profile.targetSubjects[0] || "Foundations";
    blocks.push({
      id: "plan-mistakes",
      title: topWeak
        ? `Remediate Weak Spot: ${topWeak.name}`
        : `Mistake Notebook Overhaul (${profile.unresolvedMistakesCount} Pending)`,
      subject: subject,
      topicSlug: topWeak?.slug,
      duration: "25 mins",
      durationMinutes: 25,
      priority: "HIGH",
      type: "MISTAKE_REVISION",
      why: topWeak
        ? `You have ${topWeak.mistakeCount} active mistakes in ${topWeak.name} with ${topWeak.accuracy}% accuracy. Fixing these high-frequency errors yields immediate marks.`
        : `You have ${profile.unresolvedMistakesCount} unresolved questions in your Mistake Vault. Reviewing them turns recurring errors into solid fundamentals.`,
      actionText: topWeak ? `Practice ${topWeak.name}` : "Review Mistake Vault",
      actionHref: topWeak ? `/practice?topic=${topWeak.slug}` : "/mistakes",
      readinessGain: "+4 Readiness Pts",
    });
  } else if (profile.topicMastery.weak.length > 0) {
    const worst = profile.topicMastery.weak[0];
    blocks.push({
      id: `plan-weak-${worst.id}`,
      title: `Intensive Concept Booster: ${worst.name}`,
      subject: worst.subjectName,
      topicSlug: worst.slug,
      duration: "25 mins",
      durationMinutes: 25,
      priority: "HIGH",
      type: "WEAK_TOPIC",
      why: `Your accuracy in ${worst.name} is currently ${worst.accuracy}%. Targeted practice with step-by-step shortcuts will eliminate conceptual doubts.`,
      actionText: `Launch ${worst.name} Drill`,
      actionHref: `/practice?topic=${worst.slug}`,
      readinessGain: "+4 Readiness Pts",
    });
  }

  // 2. Block 2: Spaced Repetition / Memory Decay Prevention (Priority MEDIUM)
  if (profile.retentionDecayTopics.length > 0) {
    const decay = profile.retentionDecayTopics[0];
    blocks.push({
      id: `plan-decay-${decay.id}`,
      title: `Retention Refresher: ${decay.name}`,
      subject: decay.subjectName,
      topicSlug: decay.slug,
      duration: "20 mins",
      durationMinutes: 20,
      priority: "MEDIUM",
      type: "RETENTION_REFRESHER",
      why: `You last practiced ${decay.name} ${decay.lastPracticedDaysAgo} days ago (previously ${decay.previousAccuracy}%). Spaced retrieval now ensures formula recall during live exams.`,
      actionText: `Refresh ${decay.name}`,
      actionHref: `/practice?topic=${decay.slug}`,
      readinessGain: "+3 Readiness Pts",
    });
  } else if (profile.topicMastery.improving.length > 0) {
    const imp = profile.topicMastery.improving[0];
    blocks.push({
      id: `plan-improving-${imp.id}`,
      title: `Ascend to Mastery: ${imp.name}`,
      subject: imp.subjectName,
      topicSlug: imp.slug,
      duration: "20 mins",
      durationMinutes: 20,
      priority: "MEDIUM",
      type: "WEAK_TOPIC",
      why: `You are at ${imp.accuracy}% accuracy in ${imp.name}. One high-accuracy sprint pushes this topic into your STRONG mastery tier.`,
      actionText: `Practice ${imp.name}`,
      actionHref: `/practice?topic=${imp.slug}`,
      readinessGain: "+3 Readiness Pts",
    });
  }

  // 3. Block 3: Daily Consistency & Habit (Priority HIGH or MEDIUM)
  if (!profile.dailyCrackStatus.completedToday) {
    blocks.push({
      id: "plan-daily-crack",
      title: "Daily Crack 10 Speed Drill",
      subject: "Mixed Aptitude & Reasoning",
      duration: "10 mins",
      durationMinutes: 10,
      priority: "HIGH",
      type: "SPEED_CHALLENGE",
      why: `Maintain your active ${profile.streakDays}-day streak. 10 rapid-fire questions across official exam patterns to test speed under the clock.`,
      actionText: "Crack Today's 10",
      actionHref: "/daily-crack",
      readinessGain: "+2 Readiness Pts",
    });
  }

  // 4. Block 4: Syllabus Expansion or Mock Test Simulation
  if (profile.mockTestPerformance.attemptsCount === 0) {
    blocks.push({
      id: "plan-first-mock",
      title: "Official Pattern Diagnostic Mock Test",
      subject: profile.targetExam,
      duration: "60 mins",
      durationMinutes: 60,
      priority: "NORMAL",
      type: "SPEED_CHALLENGE",
      why: "You haven't completed a full-length proctored mock test yet. Take a baseline assessment to establish real sectional benchmarks and cut-off viability.",
      actionText: "Select Mock Test",
      actionHref: "/mock-tests",
      readinessGain: "+8 Readiness Pts",
    });
  } else if (profile.topicMastery.unpracticed.length > 0) {
    const unpracticed = profile.topicMastery.unpracticed[0];
    blocks.push({
      id: `plan-unpracticed-${unpracticed.id}`,
      title: `Syllabus Expansion: ${unpracticed.name}`,
      subject: unpracticed.subjectName,
      topicSlug: unpracticed.slug,
      duration: "20 mins",
      durationMinutes: 20,
      priority: "NORMAL",
      type: "SYLLABUS_EXPANSION",
      why: `You have 0 attempts in ${unpracticed.name} (${unpracticed.questionCount} questions available). Covering all syllabus areas avoids zero-scoring blind spots.`,
      actionText: `Explore ${unpracticed.name}`,
      actionHref: `/practice?topic=${unpracticed.slug}`,
      readinessGain: "+3 Readiness Pts",
    });
  }

  // Fallback if blocks count is less than 3
  if (blocks.length < 3) {
    const primarySubject = profile.targetSubjects[0] || "Quantitative Aptitude";
    blocks.push({
      id: "plan-speed-drill",
      title: `10-Question High-Yield Sprint (${primarySubject})`,
      subject: primarySubject,
      duration: "15 mins",
      durationMinutes: 15,
      priority: "MEDIUM",
      type: "SPEED_CHALLENGE",
      why: `Rapid formula and calculation workout in ${primarySubject} to build instinctive problem-solving reflexes.`,
      actionText: "Launch Speed Drill",
      actionHref: "/practice",
      readinessGain: "+2 Readiness Pts",
    });
  }

  return blocks;
}

/**
 * Answers: "What am I weak at?"
 * Performs root-cause analysis on mistakes, drop-offs, and time spent.
 */
export function analyzeStudentWeaknesses(profile: StudentProfileContext): AIWeaknessInsight[] {
  const insights: AIWeaknessInsight[] = [];

  for (const weak of profile.topicMastery.weak) {
    let errorPattern: AIWeaknessInsight["errorPattern"] = "CONCEPT_GAP";
    let patternLabel = "Core Concept Gap";
    let explanation = `Your accuracy in ${weak.name} is ${weak.accuracy}%. Multiple fundamental questions are being answered incorrectly.`;
    let recommendation = `Review the core formulas and standard derivations for ${weak.name}, then solve 5 beginner-to-intermediate questions.`;

    if (weak.mistakeCount >= 3) {
      errorPattern = "CALCULATION_TRAP";
      patternLabel = "Recurring Trap Options";
      explanation = `You have made ${weak.mistakeCount} repeat mistakes in this topic, indicating susceptibility to examiner trap distractors.`;
      recommendation = `Read question conditions carefully (e.g. units, reverse questions, 'not true' clauses) before selecting options.`;
    } else if (weak.daysSinceLastPracticed && weak.daysSinceLastPracticed >= 7) {
      errorPattern = "MEMORY_DECAY";
      patternLabel = "Retention Decay (7+ days dormant)";
      explanation = `It has been ${weak.daysSinceLastPracticed} days since you practiced this topic. Formulas and shortcuts fade without spaced repetition.`;
      recommendation = `Do a quick 10-minute speed refresher drill to refresh neural pathways.`;
    }

    insights.push({
      topicId: weak.id,
      topicName: weak.name,
      subjectName: weak.subjectName,
      slug: weak.slug,
      accuracy: weak.accuracy,
      questionsAttempted: weak.attempted,
      mistakesCount: weak.mistakeCount,
      errorPattern,
      errorPatternLabel: patternLabel,
      explanation,
      recommendation,
      drillHref: `/practice?topic=${weak.slug}`,
      actionText: `Practice ${weak.name}`,
    });
  }

  // Also include top retention decay topics if not already in weak
  for (const decay of profile.retentionDecayTopics) {
    if (!insights.some((i) => i.topicId === decay.id)) {
      insights.push({
        topicId: decay.id,
        topicName: decay.name,
        subjectName: decay.subjectName,
        slug: decay.slug,
        accuracy: decay.previousAccuracy,
        questionsAttempted: 5,
        mistakesCount: 0,
        errorPattern: "MEMORY_DECAY",
        errorPatternLabel: `Retention Warning (${decay.lastPracticedDaysAgo}d inactive)`,
        explanation: `Topic previously mastered at ${decay.previousAccuracy}% accuracy, but unvisited for over a week. Risk of hesitation on test day.`,
        recommendation: `Spend 15 minutes reviewing your bookmarks or completing a targeted practice set.`,
        drillHref: `/practice?topic=${decay.slug}`,
        actionText: `Refresh ${decay.name}`,
      });
    }
  }

  return insights;
}

/**
 * Answers: "What should I do next?"
 * Decides the single most impactful, 1-click action right now.
 */
export function determineNextBestAction(profile: StudentProfileContext): NextBestAction {
  // 1. Highest urgency: Unresolved mistakes pending
  if (profile.unresolvedMistakesCount >= 3) {
    const topWeak = profile.topicMastery.weak[0];
    return {
      title: topWeak ? `Remediate ${topWeak.name} Mistakes` : "Clear Your Mistake Vault",
      subtitle: `${profile.unresolvedMistakesCount} unresolved questions waiting for review`,
      reason: "Correcting repeated errors stops negative marking in upcoming tests and adds +4 to your readiness score.",
      actionText: topWeak ? `Practice ${topWeak.name}` : "Review Mistake Vault",
      actionHref: topWeak ? `/practice?topic=${topWeak.slug}` : "/mistakes",
      badge: "High Impact",
      readinessGain: "+4 Readiness Pts",
      estimatedMinutes: 20,
      urgency: "HIGH",
    };
  }

  // 2. High urgency: Daily Crack 10 uncompleted today
  if (!profile.dailyCrackStatus.completedToday) {
    return {
      title: "Complete Today's Daily Crack 10",
      subtitle: `Protect your active ${profile.streakDays}-day consistency streak`,
      reason: "10 rapid-fire questions covering core aptitude and logical deduction.",
      actionText: "Start Daily Challenge",
      actionHref: "/daily-crack",
      badge: "Streak Guard",
      readinessGain: "+2 Readiness Pts",
      estimatedMinutes: 10,
      urgency: "HIGH",
    };
  }

  // 3. Medium urgency: Primary weak topic
  if (profile.topicMastery.weak.length > 0) {
    const worst = profile.topicMastery.weak[0];
    return {
      title: `Targeted Mastery Drill: ${worst.name}`,
      subtitle: `Current accuracy is ${worst.accuracy}% across ${worst.attempted} questions`,
      reason: "A targeted 10-question practice set with step-by-step explanations.",
      actionText: `Practice ${worst.name}`,
      actionHref: `/practice?topic=${worst.slug}`,
      badge: "Skill Booster",
      readinessGain: "+3 Readiness Pts",
      estimatedMinutes: 15,
      urgency: "MEDIUM",
    };
  }

  // 4. Fallback: Proctored Mock Test or Exploration
  return {
    title: "Attempt a Full-Length Mock Test",
    subtitle: `Official exam simulation for ${profile.targetExam}`,
    reason: "Benchmark your time management, sectional cutoff score, and exam readiness.",
    actionText: "Launch Mock Test",
    actionHref: "/mock-tests",
    badge: "Benchmark",
    readinessGain: "+8 Readiness Pts",
    estimatedMinutes: 60,
    urgency: "MEDIUM",
  };
}

/**
 * Generates interactive AI coach response for chat questions,
 * grounded in real student database metrics.
 */
export async function generateCoachChatResponse(
  profile: StudentProfileContext,
  userMessage: string,
  history: Array<{ role: "USER" | "COACH"; content: string }>
): Promise<{ reply: string; suggestedActions?: Array<{ label: string; href: string }> }> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  const systemPrompt = `You are CrackCoach AI, an elite exam mentor and personal study coach on the Career Crack platform.
You are coaching a real student with the following live profile:
- Student Name: ${profile.userName}
- Target Exam: ${profile.targetExam} (${profile.goalCategory})
- Readiness Score: ${profile.readinessScore}/100
- Daily Study Budget: ${profile.dailyStudyHours}
- Active Streak: ${profile.streakDays} days (Longest: ${profile.longestStreak} days)
- Overall Accuracy: ${profile.overallAccuracy}% across ${profile.totalQuestionsAttempted} questions
- Total Study Time: ${profile.totalStudyMinutes} minutes
- Unresolved Mistakes in Vault: ${profile.unresolvedMistakesCount}
- Weakest Topics: ${
    profile.topicMastery.weak.map((w) => `${w.name} (${w.accuracy}% accuracy, ${w.mistakeCount} mistakes)`).join(", ") || "None currently detected"
  }
- Dormant Topics (Retention Decay): ${
    profile.retentionDecayTopics.map((d) => `${d.name} (${d.lastPracticedDaysAgo} days ago)`).join(", ") || "None"
  }
- Mock Test Attempts: ${profile.mockTestPerformance.attemptsCount} (Best score: ${profile.mockTestPerformance.bestScore})
- Daily Challenge Today: ${profile.dailyCrackStatus.completedToday ? "Completed" : "Not yet attempted"}
- Spaced Revision Queue: ${profile.revisionQueueCount} topics waiting for review
- AI Mock Interviews: ${profile.completedInterviewsCount} completed (Average Score: ${profile.averageInterviewScore !== null ? `${profile.averageInterviewScore}%` : "No completed interviews yet"})

Guidelines:
1. Always be encouraging, strategic, and practical.
2. Ground your advice directly in the student's real numbers (quote their accuracy, weak topics, or mistakes where relevant).
3. Provide crisp, actionable bullet points, mnemonics, or shortcuts when asked for study tips or topic advice.
4. Format in clean GitHub-style Markdown with bolding, lists, and clear headers.
5. Keep responses concise (under 250 words) so they are fast and easily readable on mobile and desktop.`;

  // 1. Try Gemini API if key is present
  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: systemPrompt },
                  ...history.map((h) => ({
                    text: `${h.role === "USER" ? "Student" : "Coach"}: ${h.content}`,
                  })),
                  { text: `Student's question: ${userMessage}` },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600,
            },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const reply = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return {
            reply,
            suggestedActions: deriveSuggestedActions(profile, userMessage),
          };
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to deterministic AI coach:", err);
    }
  }

  // 2. High-Intelligence Deterministic Fallback Engine
  return generateDeterministicCoachResponse(profile, userMessage);
}

function deriveSuggestedActions(
  profile: StudentProfileContext,
  query: string
): Array<{ label: string; href: string }> {
  const actions: Array<{ label: string; href: string }> = [];
  const q = query.toLowerCase();

  if (q.includes("mistake") || q.includes("wrong") || q.includes("error")) {
    actions.push({ label: "Open Mistake Vault", href: "/mistakes" });
  }

  if (q.includes("mock") || q.includes("test") || q.includes("exam")) {
    actions.push({ label: "Browse Mock Tests", href: "/mock-tests" });
  }

  if (profile.topicMastery.weak.length > 0) {
    const topWeak = profile.topicMastery.weak[0];
    actions.push({ label: `Practice ${topWeak.name}`, href: `/practice?topic=${topWeak.slug}` });
  }

  if (!profile.dailyCrackStatus.completedToday) {
    actions.push({ label: "Today's Daily Crack 10", href: "/daily-crack" });
  }

  if (actions.length === 0) {
    actions.push({ label: "Launch Practice Bank", href: "/practice" });
    actions.push({ label: "View Progress Dashboard", href: "/progress" });
  }

  return actions.slice(0, 3);
}

/**
 * High-intelligence heuristic coach generator that answers questions
 * using real numbers, syllabus knowledge, and exam strategies.
 */
function generateDeterministicCoachResponse(
  profile: StudentProfileContext,
  userMessage: string
): { reply: string; suggestedActions: Array<{ label: string; href: string }> } {
  const q = userMessage.toLowerCase();
  const topWeak = profile.topicMastery.weak[0];

  // A. Questions about today's focus or what to study
  if (q.includes("today") || q.includes("what should i study") || q.includes("focus") || q.includes("start")) {
    const plan = generateAIDailyPlan(profile);
    const topBlock = plan[0];

    const reply = `### 📋 Your Daily Strategy for **${profile.targetExam}**

Based on your current **${profile.readinessScore}/100 Readiness Score** and **${profile.overallAccuracy}% overall accuracy**:

1. **Top Priority:** **${topBlock.title}** (${topBlock.duration})
   - *Why:* ${topBlock.why}
2. **Consistency:** ${
      profile.dailyCrackStatus.completedToday
        ? `Great job completing today's Daily Crack 10! Your streak is at **${profile.streakDays} days**.`
        : `Complete today's **Daily Crack 10** to protect your **${profile.streakDays}-day streak** and build speed.`
    }
3. **Target Allocation:** Budget **${profile.dailyStudyHours}** with 60% active practice and 40% mistake analysis.

> **Coach's Tip:** Always review your incorrect choices before jumping to a new chapter. Re-solving 5 mistakes teaches you more than solving 20 easy questions!`;

    return {
      reply,
      suggestedActions: [
        { label: topBlock.actionText, href: topBlock.actionHref },
        { label: "View Full Daily Plan", href: "/coach#daily-plan" },
      ],
    };
  }

  // B. Questions about mistakes or errors
  if (q.includes("mistake") || q.includes("wrong") || q.includes("vault") || q.includes("error")) {
    if (profile.unresolvedMistakesCount === 0) {
      return {
        reply: `### 🎉 Excellent Error Discipline!
You currently have **0 unresolved mistakes** in your Mistake Vault.

- **Completed Questions:** ${profile.totalQuestionsAttempted}
- **Overall Accuracy:** ${profile.overallAccuracy}%
- **Next Step:** Push your limits by attempting a **Medium/Hard Practice Drill** or a **Full-Length Mock Test** to identify any remaining edge cases.`,
        suggestedActions: [
          { label: "Take Full Mock Test", href: "/mock-tests" },
          { label: "Practice Difficult Questions", href: "/practice?difficulty=HARD" },
        ],
      };
    }

    const reply = `### 🔍 Mistake Vault Diagnostic Analysis
You have **${profile.unresolvedMistakesCount} unresolved questions** awaiting review.

- **Primary Vulnerability:** ${
      topWeak
        ? `**${topWeak.name}** (${topWeak.mistakeCount} errors, ${topWeak.accuracy}% accuracy)`
        : "Scattered across core syllabus sections"
    }
- **Recommended Action:**
  1. Go to your **Mistake Vault** and filter by *Unresolved*.
  2. Before looking at the answer, cover the solution and re-solve with pencil/scratchpad.
  3. Pay attention to the **Common Trap Alert** tag to prevent repeated calculation slips.`;

    return {
      reply,
      suggestedActions: [
        { label: "Review Mistake Vault", href: "/mistakes" },
        topWeak ? { label: `Practice ${topWeak.name}`, href: `/practice?topic=${topWeak.slug}` } : { label: "Launch Practice", href: "/practice" },
      ],
    };
  }

  // C. Questions about weak topics or weak areas
  if (q.includes("weak") || q.includes("worst") || q.includes("improve") || q.includes("bad")) {
    if (profile.topicMastery.weak.length === 0) {
      return {
        reply: `### 🚀 Strong Foundational Baseline!
Your accuracy across practiced topics is **${profile.overallAccuracy}%**, with no topics currently in the red zone (<60%).

- **Recommendation:** Expand your syllabus coverage into unpracticed topics or attempt a full **Mock Test** to test your endurance under timer pressure.`,
        suggestedActions: [
          { label: "Explore Syllabus", href: "/progress" },
          { label: "Take Mock Test", href: "/mock-tests" },
        ],
      };
    }

    const weakList = profile.topicMastery.weak
      .slice(0, 3)
      .map((w, i) => `${i + 1}. **${w.name}** (${w.subjectName}): **${w.accuracy}% accuracy**, ${w.mistakeCount} mistakes`)
      .join("\n");

    const reply = `### ⚠️ Diagnostic Weakness Report
Here are your current priority areas needing immediate remediation:

${weakList}

#### How to Crack These Topics:
1. **Focus on Standard Shortcut Methods:** Use substitution and elimination to avoid lengthy calculations.
2. **Solve in 2 Passes:** Mark for review on questions taking >75 seconds.
3. **Immediate Drill:** Complete an 8-question drill on **${topWeak.name}** today.`;

    return {
      reply,
      suggestedActions: [
        { label: `Practice ${topWeak.name}`, href: `/practice?topic=${topWeak.slug}` },
        { label: "Open Mistake Vault", href: "/mistakes" },
      ],
    };
  }

  // D. Questions about mock tests, cutoff, or exam strategy
  if (q.includes("mock") || q.includes("cutoff") || q.includes("score") || q.includes("exam") || q.includes("strategy")) {
    const reply = `### 🎯 Strategy Blueprint for **${profile.targetExam}**

- **Current Readiness Score:** **${profile.readinessScore}/100**
- **Mock Tests Completed:** ${profile.mockTestPerformance.attemptsCount}
- **Best Mock Score:** ${profile.mockTestPerformance.bestScore} marks
- **Target Target:** Aim for **80%+ accuracy** and sectional clearing benchmarks.

#### 3 Key Pillars for Score Maximization:
1. **Sectional Discipline:** Stick strictly to your sectional time limits (e.g. 15 mins Quant, 12 mins Reasoning, 10 mins GA, 12 mins English for SSC CGL).
2. **Zero Negative Marking Leaks:** Do not guess on 50/50 questions unless you have eliminated at least 2 traps.
3. **Post-Test Diagnostics:** Spend at least 45 minutes reviewing your test results to analyze which questions took >90 seconds.`;

    return {
      reply,
      suggestedActions: [
        { label: "Take Full Mock Test", href: "/mock-tests" },
        { label: "View Practice Drills", href: "/practice" },
      ],
    };
  }

  // E. Generic coaching query
  const reply = `### 💡 Coach's Recommendation for **${profile.userName}**

You're preparing for **${profile.targetExam}** with an active **${profile.streakDays}-day streak** and **${profile.readinessScore}/100 Readiness**.

Here is what will give you the biggest score boost right now:
- **Immediate Task:** ${
    topWeak
      ? `Solve an 8-question practice set in **${topWeak.name}** (current accuracy ${topWeak.accuracy}%).`
      : "Complete today's Daily Crack 10 speed challenge."
  }
- **Mistake Vault Status:** ${
    profile.unresolvedMistakesCount > 0
      ? `You have **${profile.unresolvedMistakesCount} unresolved errors** waiting. Review them to convert doubts into certainty.`
      : "Your mistake vault is fully resolved! Keep pushing higher difficulty questions."
  }

Feel free to ask me for:
- *"What should I study today?"*
- *"Analyze my recent mistakes"*
- *"How to improve speed in Quant or Reasoning?"*
- *"Create a 7-day revision sprint"*`;

  return {
    reply,
    suggestedActions: deriveSuggestedActions(profile, userMessage),
  };
}
