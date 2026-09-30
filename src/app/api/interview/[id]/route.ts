import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  INTERVIEW_CURRICULUM,
  evaluateInterviewAnswer,
  generateProjectQuestions,
  generateResumeQuestions,
} from "@/lib/interview-engine";
import { awardXP, updatePersonalRecords } from "@/lib/xp-engine";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(context?.params || (context as any));
    const id = resolvedParams?.id || req.nextUrl.pathname.split("/").filter(Boolean).pop();

    if (!id) {
      return NextResponse.json({ error: "Interview ID is required" }, { status: 400 });
    }

    const interview = await prisma.interviewSession.findUnique({
      where: { id },
      include: {
        turns: { orderBy: { order: "asc" } },
      },
    });

    if (!interview || interview.userId !== session.userId) {
      return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
    }

    let parsedProjectContext = null;
    if (interview.projectContext) {
      try {
        parsedProjectContext = JSON.parse(interview.projectContext);
      } catch {}
    }

    let parsedStrongPoints = [];
    if (interview.strongPoints) {
      try {
        parsedStrongPoints = JSON.parse(interview.strongPoints);
      } catch {}
    }

    let parsedMissingPoints = [];
    if (interview.missingPoints) {
      try {
        parsedMissingPoints = JSON.parse(interview.missingPoints);
      } catch {}
    }

    return NextResponse.json({
      session: {
        id: interview.id,
        interviewType: interview.interviewType,
        topicOrRole: interview.topicOrRole,
        difficulty: interview.difficulty,
        status: interview.status,
        score: interview.score,
        strongPoints: parsedStrongPoints,
        missingPoints: parsedMissingPoints,
        feedback: interview.feedback,
        questionsAsked: interview.questionsAsked,
        createdAt: interview.createdAt,
        projectContext: parsedProjectContext,
      },
      turns: interview.turns.map((t: any) => {
        let parsedEvaluation = null;
        if (t.evaluation) {
          try {
            parsedEvaluation = typeof t.evaluation === "string" ? JSON.parse(t.evaluation) : t.evaluation;
          } catch {
            parsedEvaluation = { feedback: t.evaluation };
          }
        }
        return {
          id: t.id,
          order: t.order,
          questionText: t.questionText,
          questionType: t.questionType,
          userAnswer: t.userAnswer,
          evaluation: parsedEvaluation,
          followUpQuestion: t.followUpQuestion,
        };
      }),
    });
  } catch (err: any) {
    console.error("GET /api/interview/[id] error:", err);
    return NextResponse.json({ error: "Failed to load interview details" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(context?.params || (context as any));
    const id = resolvedParams?.id || req.nextUrl.pathname.split("/").filter(Boolean).pop();

    if (!id) {
      return NextResponse.json({ error: "Interview ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const { answer } = body;

    if (!answer || typeof answer !== "string" || !answer.trim()) {
      return NextResponse.json({ error: "Answer text is required" }, { status: 400 });
    }

    const interview = await prisma.interviewSession.findUnique({
      where: { id },
      include: {
        turns: { orderBy: { order: "asc" } },
      },
    });

    if (!interview || interview.userId !== session.userId) {
      return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
    }

    if (interview.status === "COMPLETED") {
      return NextResponse.json({ error: "This interview has already been completed" }, { status: 400 });
    }

    // Find current active turn (the latest turn without an answer)
    const currentTurn = interview.turns[interview.turns.length - 1];
    if (!currentTurn || currentTurn.userAnswer) {
      return NextResponse.json({ error: "No active question turn found" }, { status: 400 });
    }

    // Determine curriculum questions to look up ideal structure & keywords
    let allQuestions: any[] = [];
    if (interview.interviewType === "TECHNICAL") {
      const topicKey = (interview.topicOrRole || "DSA").toUpperCase();
      const topicData = INTERVIEW_CURRICULUM[topicKey] || INTERVIEW_CURRICULUM["DSA"];
      allQuestions = topicData.questions;
    } else if (interview.interviewType === "PROJECT") {
      if (interview.projectContext) {
        try {
          allQuestions = generateProjectQuestions(JSON.parse(interview.projectContext));
        } catch {}
      }
    } else if (interview.interviewType === "RESUME") {
      if (interview.resumeText) {
        allQuestions = generateResumeQuestions(interview.resumeText);
      }
    }

    const currentQMeta =
      allQuestions.find((q) => q.question === currentTurn.questionText) || allQuestions[currentTurn.order - 1] || {
        expectedKeywords: ["architecture", "performance", "trade-off", "scalability"],
        idealStructure: "1. Definition. 2. Mechanism. 3. Trade-off. 4. Real-world example.",
        followUp: "How would you test this implementation in automated CI/CD pipelines?",
      };

    // Evaluate answer using interview engine
    const evaluation = evaluateInterviewAnswer(
      currentTurn.questionText,
      answer.trim(),
      currentQMeta.expectedKeywords || [],
      currentQMeta.idealStructure || "",
      currentQMeta.followUp || ""
    );

    // Update current turn with answer & evaluation
    await (prisma as any).interviewTurn.update({
      where: { id: currentTurn.id },
      data: {
        userAnswer: answer.trim(),
        evaluation: JSON.stringify(evaluation),
        followUpQuestion: evaluation.followUpQuestion,
      },
    });

    const isLastQuestion = currentTurn.order >= interview.questionsAsked || currentTurn.order >= 3;

    if (!isLastQuestion && currentTurn.order < allQuestions.length) {
      // Spawn next question
      const nextQ = allQuestions[currentTurn.order];
      await (prisma as any).interviewTurn.create({
        data: {
          sessionId: interview.id,
          questionText: nextQ.question,
          questionType: nextQ.type || "TECHNICAL",
          order: currentTurn.order + 1,
        },
      });

      return NextResponse.json({
        success: true,
        isCompleted: false,
        evaluation,
        nextQuestion: {
          order: currentTurn.order + 1,
          questionText: nextQ.question,
          totalQuestions: Math.min(interview.questionsAsked, 3),
        },
      });
    } else {
      // Mark session as COMPLETED and compute overall report
      const allTurns = await (prisma as any).interviewTurn.findMany({
        where: { sessionId: interview.id },
      });

      const scores: number[] = [];
      const aggregateStrong: string[] = [];
      const aggregateMissing: string[] = [];

      allTurns.forEach((t: any) => {
        if (t.evaluation) {
          try {
            const ev = JSON.parse(t.evaluation);
            scores.push(ev.score);
            if (ev.strongPoints) aggregateStrong.push(...ev.strongPoints);
            if (ev.missingPoints) aggregateMissing.push(...ev.missingPoints);
          } catch {}
        }
      });

      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 70;

      const finalFeedback =
        avgScore >= 80
          ? "Strong conceptual foundation and articulate communication. Ready for senior technical evaluation rounds."
          : avgScore >= 60
          ? "Solid baseline understanding. Focus on elaborating architectural trade-offs and step-by-step edge cases."
          : "Foundational review recommended. Review core algorithms, system memory models, and standard architectural patterns.";

      await (prisma as any).interviewSession.update({
        where: { id: interview.id },
        data: {
          status: "COMPLETED",
          score: avgScore,
          strongPoints: JSON.stringify(Array.from(new Set(aggregateStrong)).slice(0, 5)),
          missingPoints: JSON.stringify(Array.from(new Set(aggregateMissing)).slice(0, 5)),
          feedback: finalFeedback,
        },
      });

      // Award XP for completing an interview simulation
      const xpResult = await awardXP(
        session.userId,
        "PRACTICE_SESSION_COMPLETE",
        interview.id,
        60 + Math.round((avgScore / 100) * 40)
      );

      await updatePersonalRecords(session.userId);

      return NextResponse.json({
        success: true,
        isCompleted: true,
        evaluation,
        finalReport: {
          score: avgScore,
          strongPoints: Array.from(new Set(aggregateStrong)).slice(0, 5),
          missingPoints: Array.from(new Set(aggregateMissing)).slice(0, 5),
          feedback: finalFeedback,
          xpAwarded: xpResult.xpAwarded,
        },
      });
    }
  } catch (err: any) {
    console.error("POST /api/interview/[id] error:", err);
    return NextResponse.json({ error: "Failed to evaluate interview answer" }, { status: 500 });
  }
}
