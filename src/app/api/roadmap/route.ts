import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type StageState = "LOCKED" | "ACTIVE" | "COMPLETED" | "NEEDS_REVISION";

export interface RoadmapStage {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  state: StageState;
  progressPct: number;
  evidence: string;
  actionUrl: string;
  actionLabel: string;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const track = searchParams.get("track") || "GOVERNMENT"; // "GOVERNMENT" | "PLACEMENT"

    // Gather actual user data
    const [user, profile, practiceQuestions, completedSessions, mockAttempts, unresolvedMistakes, interviewSessions] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: session.userId },
          select: { isOnboarded: true },
        }),
        prisma.userProfile.findUnique({
          where: { userId: session.userId },
        }),
        prisma.practiceSessionQuestion.findMany({
          where: { session: { userId: session.userId, status: "COMPLETED" }, isAnswered: true },
          select: { answerStatus: true, question: { select: { subject: { select: { category: true, name: true } } } } },
        }),
        prisma.practiceSession.findMany({
          where: { userId: session.userId, status: "COMPLETED" },
          select: { id: true, accuracy: true },
        }),
        prisma.mockTestAttempt.findMany({
          where: { userId: session.userId, status: "COMPLETED" },
          select: { id: true, accuracy: true },
        }),
        prisma.userMistake.count({
          where: { userId: session.userId, reviewStatus: "UNRESOLVED" },
        }),
        (prisma as any).interviewSession.findMany({
          where: { userId: session.userId },
        }),
      ]);

    const totalQuestions = practiceQuestions.length;
    const correctQuestions = practiceQuestions.filter((p) => p.answerStatus === "CORRECT").length;
    const overallAccuracy = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;
    const totalSessions = completedSessions.length;
    const totalMocks = mockAttempts.length;
    const totalInterviews = interviewSessions.length;

    let stages: RoadmapStage[] = [];

    if (track === "PLACEMENT") {
      // -------------------------------------------------------------
      // PLACEMENTS TRACK ROADMAP
      // -------------------------------------------------------------
      // 1. Aptitude Foundation
      // 2. Programming Fundamentals
      // 3. Data Structures & Algorithms
      // 4. Core CS (OS, DBMS, Networks)
      // 5. Technical Interview Simulation
      // 6. Placement Ready

      const aptitudeQuestions = practiceQuestions.filter(
        (p) =>
          p.question.subject.category === "APTITUDE" ||
          p.question.subject.name.toLowerCase().includes("aptitude") ||
          p.question.subject.name.toLowerCase().includes("reasoning")
      ).length;

      const csQuestions = practiceQuestions.filter(
        (p) =>
          p.question.subject.category === "CORE_CS" ||
          p.question.subject.name.toLowerCase().includes("data") ||
          p.question.subject.name.toLowerCase().includes("database")
      ).length;

      stages = [
        {
          id: "p-aptitude",
          order: 1,
          title: "1. Aptitude & Reasoning Foundation",
          subtitle: "Clear the initial campus/company screening cutoff",
          description: "Quantitative Aptitude, Logical Reasoning, and Problem-Solving fundamentals.",
          state: aptitudeQuestions >= 20 ? "COMPLETED" : "ACTIVE",
          progressPct: Math.min(100, Math.round((aptitudeQuestions / 20) * 100)),
          evidence: `${aptitudeQuestions} of 20 recommended aptitude questions attempted.`,
          actionUrl: "/practice",
          actionLabel: "Practice Aptitude →",
        },
        {
          id: "p-dsa",
          order: 2,
          title: "2. Data Structures & Algorithms",
          subtitle: "Arrays, Linked Lists, Trees, Graphs, Sorting & Searching",
          description: "Master algorithmic problem-solving required for tech online assessments.",
          state:
            aptitudeQuestions < 10
              ? "LOCKED"
              : csQuestions >= 25
              ? "COMPLETED"
              : "ACTIVE",
          progressPct: Math.min(100, Math.round((csQuestions / 25) * 100)),
          evidence: `${csQuestions} technical questions completed.`,
          actionUrl: "/practice",
          actionLabel: "Drill Technical Questions →",
        },
        {
          id: "p-core-cs",
          order: 3,
          title: "3. Core Computer Science",
          subtitle: "DBMS, Operating Systems, Computer Networks, OOP",
          description: "Solidify theory concepts asked in technical interview rounds.",
          state:
            csQuestions < 15
              ? "LOCKED"
              : totalSessions >= 8
              ? "COMPLETED"
              : "ACTIVE",
          progressPct: Math.min(100, Math.round((csQuestions / 20) * 100)),
          evidence: `Verified curriculum coverage across Core CS topics.`,
          actionUrl: "/practice",
          actionLabel: "Study Core CS →",
        },
        {
          id: "p-interview",
          order: 4,
          title: "4. Technical & Project Interview",
          subtitle: "Mock Technical, Project-Architecture & Resume Interviews",
          description: "Simulate 1-on-1 technical rounds with structured AI evaluation and follow-up questions.",
          state:
            csQuestions < 10
              ? "LOCKED"
              : totalInterviews >= 2
              ? "COMPLETED"
              : "ACTIVE",
          progressPct: Math.min(100, totalInterviews * 50),
          evidence: `${totalInterviews} simulated interview sessions completed.`,
          actionUrl: "/interview/technical",
          actionLabel: "Start Mock Interview →",
        },
        {
          id: "p-ready",
          order: 5,
          title: "5. Placement Ready",
          subtitle: "Target Company Screening & Interview Clearance",
          description: "Holistic preparedness across Aptitude, Coding assessments, and Technical Interviews.",
          state:
            aptitudeQuestions >= 20 && csQuestions >= 20 && totalInterviews >= 2
              ? "ACTIVE"
              : "LOCKED",
          progressPct: Math.round(
            (Math.min(20, aptitudeQuestions) / 20) * 35 +
              (Math.min(20, csQuestions) / 20) * 35 +
              (Math.min(2, totalInterviews) / 2) * 30
          ),
          evidence: "Composite placement qualification index.",
          actionUrl: "/placements",
          actionLabel: "View Placement Hub →",
        },
      ];
    } else {
      // -------------------------------------------------------------
      // GOVERNMENT EXAMS TRACK ROADMAP (9 Sequential Stages)
      // -------------------------------------------------------------
      // 1. START
      // 2. FOUNDATION
      // 3. TOPIC COVERAGE
      // 4. PRACTICE
      // 5. WEAKNESS REPAIR
      // 6. SECTIONAL TESTS
      // 7. FULL MOCKS
      // 8. REVISION
      // 9. EXAM READY

      // Stage 1: START
      const s1Complete = user?.isOnboarded || false;

      // Stage 2: FOUNDATION
      const s2Complete = totalQuestions >= 15;

      // Stage 3: TOPIC COVERAGE
      const s3Complete = totalQuestions >= 40 && totalSessions >= 3;

      // Stage 4: PRACTICE
      const s4Complete = totalQuestions >= 60 && overallAccuracy >= 60;

      // Stage 5: WEAKNESS REPAIR
      const s5NeedsRev = unresolvedMistakes >= 5;
      const s5Complete = s4Complete && unresolvedMistakes <= 2 && totalQuestions >= 60;

      // Stage 6: SECTIONAL TESTS
      const s6Complete = totalSessions >= 8 && overallAccuracy >= 70;

      // Stage 7: FULL MOCKS
      const s7Complete = totalMocks >= 2;

      // Stage 8: REVISION
      const s8Complete = s7Complete && unresolvedMistakes === 0;

      // Stage 9: EXAM READY
      const s9Ready = s7Complete && s8Complete && overallAccuracy >= 75;

      stages = [
        {
          id: "stage-start",
          order: 1,
          title: "1. Start & Onboarding",
          subtitle: "Profile & Target Exam Calibration",
          description: "Define your primary goal, target exam, daily study commitment, and subjects.",
          state: s1Complete ? "COMPLETED" : "ACTIVE",
          progressPct: s1Complete ? 100 : 50,
          evidence: s1Complete ? `Target: ${profile?.targetExam || "Configured"}` : "Profile pending",
          actionUrl: "/onboarding",
          actionLabel: s1Complete ? "View Setup" : "Complete Onboarding →",
        },
        {
          id: "stage-foundation",
          order: 2,
          title: "2. Foundation Diagnostics",
          subtitle: "Baseline Assessment & Core Concepts",
          description: "Attempt introductory questions to establish your starting baseline across subjects.",
          state: !s1Complete ? "LOCKED" : s2Complete ? "COMPLETED" : "ACTIVE",
          progressPct: Math.min(100, Math.round((totalQuestions / 15) * 100)),
          evidence: `${totalQuestions} of 15 baseline questions completed.`,
          actionUrl: "/practice",
          actionLabel: "Start Baseline Drill →",
        },
        {
          id: "stage-topic-coverage",
          order: 3,
          title: "3. Topic Coverage",
          subtitle: "Broad Syllabus Exploration",
          description: "Expand breadth across quantitative, reasoning, english, and general awareness topics.",
          state: !s2Complete ? "LOCKED" : s3Complete ? "COMPLETED" : "ACTIVE",
          progressPct: Math.min(100, Math.round((totalQuestions / 40) * 100)),
          evidence: `${totalQuestions} questions practiced across ${totalSessions} sessions.`,
          actionUrl: "/exam-intelligence",
          actionLabel: "Explore Syllabus Topics →",
        },
        {
          id: "stage-practice",
          order: 4,
          title: "4. Rigorous Practice",
          subtitle: "Speed, Accuracy & PYQ Validation",
          description: "Solve official Previous Year Questions (PYQs) and timed practice sets.",
          state: !s3Complete ? "LOCKED" : s4Complete ? "COMPLETED" : "ACTIVE",
          progressPct: Math.min(100, Math.round((totalQuestions / 60) * 100)),
          evidence: `${totalQuestions} questions solved (${overallAccuracy}% accuracy).`,
          actionUrl: "/practice?sourceType=PYQ",
          actionLabel: "Practice Official PYQs →",
        },
        {
          id: "stage-weakness-repair",
          order: 5,
          title: "5. Weakness Repair",
          subtitle: "Mistake Vault Elimination",
          description: "Resolve recurring errors, eliminate concept traps, and practice targeted drills.",
          state: !s4Complete
            ? "LOCKED"
            : s5NeedsRev
            ? "NEEDS_REVISION"
            : s5Complete
            ? "COMPLETED"
            : "ACTIVE",
          progressPct: s5NeedsRev ? 45 : s5Complete ? 100 : 70,
          evidence:
            unresolvedMistakes > 0
              ? `${unresolvedMistakes} unresolved mistakes waiting in Vault.`
              : "All logged mistakes successfully resolved.",
          actionUrl: "/mistakes",
          actionLabel: "Clear Mistake Vault →",
        },
        {
          id: "stage-sectional-tests",
          order: 6,
          title: "6. Sectional Timed Tests",
          subtitle: "Subject-Wise Time Pressure",
          description: "Test your speed under timed conditions to refine minutes-per-question efficiency.",
          state: !s4Complete ? "LOCKED" : s6Complete ? "COMPLETED" : "ACTIVE",
          progressPct: Math.min(100, Math.round((totalSessions / 8) * 100)),
          evidence: `${totalSessions} completed practice and sectional drills.`,
          actionUrl: "/crack-mode",
          actionLabel: "Launch Timed Drill →",
        },
        {
          id: "stage-full-mocks",
          order: 7,
          title: "7. Full-Length Mock Exams",
          subtitle: "Official Pattern Simulation",
          description: "Simulate the real exam: official question palette, negative marking, and AIR benchmark.",
          state: !s6Complete ? "LOCKED" : s7Complete ? "COMPLETED" : "ACTIVE",
          progressPct: Math.min(100, totalMocks * 50),
          evidence: `${totalMocks} of 2 recommended full mock tests completed.`,
          actionUrl: "/mock-tests",
          actionLabel: "Attempt Full Mock Test →",
        },
        {
          id: "stage-revision",
          order: 8,
          title: "8. Intelligent Spaced Revision",
          subtitle: "Retention Reinforcement",
          description: "Review decay-prone topics and high-weightage formulas before exam day.",
          state: !s7Complete ? "LOCKED" : s8Complete ? "COMPLETED" : "ACTIVE",
          progressPct: s8Complete ? 100 : 60,
          evidence: "Spaced revision queue active.",
          actionUrl: "/revision",
          actionLabel: "Open Revision Center →",
        },
        {
          id: "stage-exam-ready",
          order: 9,
          title: "9. Exam Ready",
          subtitle: "Peak Performance & Confidence",
          description: "High syllabus mastery, calibrated mock test endurance, and proven accuracy.",
          state: s9Ready ? "ACTIVE" : "LOCKED",
          progressPct: s9Ready ? 100 : Math.round((profile?.readinessScore || 35)),
          evidence: `Readiness index: ${profile?.readinessScore || 35}%.`,
          actionUrl: "/readiness",
          actionLabel: "View Final Readiness Report →",
        },
      ];
    }

    return NextResponse.json({
      track,
      stages,
      currentActiveStage: stages.find((s) => s.state === "ACTIVE" || s.state === "NEEDS_REVISION")?.title || "Exam Ready",
    });
  } catch (err: any) {
    console.error("GET /api/roadmap error:", err);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}
