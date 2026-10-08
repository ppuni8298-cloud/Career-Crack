import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  INTERVIEW_CURRICULUM,
  generateProjectQuestions,
  generateResumeQuestions,
} from "@/lib/interview-engine";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const sessions = await (prisma as any).interviewSession.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { turns: true } },
      },
    });

    return NextResponse.json({
      sessions: sessions.map((s: any) => ({
        id: s.id,
        interviewType: s.interviewType,
        topicOrRole: s.topicOrRole,
        difficulty: s.difficulty,
        status: s.status,
        score: s.score,
        questionsAsked: s.questionsAsked,
        createdAt: s.createdAt,
      })),
    });
  } catch (err: any) {
    console.error("GET /api/interview error:", err);
    return NextResponse.json({ error: "Failed to load interview sessions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { interviewType, topicOrRole, difficulty = "INTERMEDIATE", projectContext, resumeText } = body;

    if (!interviewType || !["TECHNICAL", "PROJECT", "RESUME", "HR"].includes(interviewType)) {
      return NextResponse.json(
        { error: "Invalid interviewType. Must be TECHNICAL, PROJECT, RESUME, or HR." },
        { status: 400 }
      );
    }

    let initialQuestions: Array<{
      question: string;
      expectedKeywords: string[];
      idealStructure: string;
      followUp: string;
      questionType?: string;
    }> = [];

    if (interviewType === "TECHNICAL") {
      const topicKey = (topicOrRole || "DSA").toUpperCase();
      const topicData = INTERVIEW_CURRICULUM[topicKey] || INTERVIEW_CURRICULUM["DSA"];
      initialQuestions = topicData.questions.filter(
        (q) => difficulty === "ALL" || q.difficulty === difficulty || true
      );
    } else if (interviewType === "PROJECT") {
      if (!projectContext || !projectContext.name) {
        return NextResponse.json(
          { error: "Project context with at least a project name is required." },
          { status: 400 }
        );
      }
      initialQuestions = generateProjectQuestions(projectContext);
    } else if (interviewType === "RESUME") {
      if (!resumeText || typeof resumeText !== "string" || !resumeText.trim()) {
        return NextResponse.json(
          { error: "Resume text or skills summary is required." },
          { status: 400 }
        );
      }
      initialQuestions = generateResumeQuestions(resumeText);
    } else {
      // HR
      initialQuestions = [
        {
          question: "Tell me about a time you faced a difficult deadline or unexpected technical block. How did you prioritize and deliver?",
          expectedKeywords: ["STAR method", "situation", "task", "action", "result", "communication", "stakeholders"],
          idealStructure: "1. Situation & context. 2. Specific obstacle. 3. Proactive action taken. 4. Quantifiable result.",
          followUp: "Looking back, what would you have done differently to prevent that blocker?",
        },
        {
          question: "Why do you want to join this role, and where do you see your engineering skills evolving over the next two years?",
          expectedKeywords: ["growth", "ownership", "mentorship", "impact", "continuous learning"],
          idealStructure: "1. Alignment with role/mission. 2. Concrete technical skill aspirations. 3. Desire for team impact.",
          followUp: "How do you stay updated with emerging technologies and best practices?",
        },
      ];
    }

    if (initialQuestions.length === 0) {
      return NextResponse.json({ error: "Failed to generate questions for this topic." }, { status: 400 });
    }

    // Create InterviewSession
    const newSession = await (prisma as any).interviewSession.create({
      data: {
        userId: session.userId,
        interviewType,
        topicOrRole: topicOrRole || (interviewType === "PROJECT" ? projectContext?.name : "Software Engineer"),
        difficulty,
        projectContext: projectContext ? JSON.stringify(projectContext) : null,
        resumeText: resumeText || null,
        status: "IN_PROGRESS",
        questionsAsked: initialQuestions.length,
      },
    });

    // Create first turn with first question
    const firstQ = initialQuestions[0];
    await (prisma as any).interviewTurn.create({
      data: {
        sessionId: newSession.id,
        questionText: firstQ.question,
        questionType: (firstQ as any).type || (interviewType === "RESUME" ? "RESUME_DERIVED" : "TECHNICAL"),
        order: 1,
      },
    });

    const initialQData = {
      order: 1,
      questionText: firstQ.question,
      totalQuestions: initialQuestions.length,
    };

    return NextResponse.json({
      success: true,
      sessionId: newSession.id,
      interviewType,
      topicOrRole: newSession.topicOrRole,
      currentQuestion: initialQData,
      firstQuestion: initialQData,
    });
  } catch (err: any) {
    console.error("POST /api/interview error:", err);
    return NextResponse.json({ error: "Failed to start interview session" }, { status: 500 });
  }
}
