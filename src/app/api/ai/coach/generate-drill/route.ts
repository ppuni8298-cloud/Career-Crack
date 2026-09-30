import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compileStudentProfile } from "@/lib/ai-coach";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { topicId, topicSlug, type = "AUTO", count = 10 } = body;

    const profile = await compileStudentProfile(session.userId);
    if (!profile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    let targetTopicId = topicId;
    let targetSubjectId: string | undefined;
    let drillTitle = "AI Coach Targeted Drill";

    // 1. If targeting mistakes specifically
    if (type === "MISTAKE_REVISION" && profile.unresolvedMistakesCount > 0) {
      const mistakeRecords = await prisma.userMistake.findMany({
        where: { userId: session.userId, reviewStatus: "UNRESOLVED" },
        include: { question: true },
        take: Math.min(20, count),
      });

      if (mistakeRecords.length > 0) {
        const questionIds = mistakeRecords.map((m) => m.questionId);
        drillTitle = `AI Mistake Vault Remediation (${questionIds.length} Questions)`;

        const practiceSession = await prisma.practiceSession.create({
          data: {
            userId: session.userId,
            title: drillTitle,
            mode: "TEST",
            difficulty: "MIXED",
            sourceType: "PRACTICE",
            totalQuestions: questionIds.length,
            durationSeconds: questionIds.length * 90, // 1.5 min per question
            status: "IN_PROGRESS",
            sessionQuestions: {
              create: questionIds.map((qid, idx) => ({
                questionId: qid,
                questionOrder: idx + 1,
                answerStatus: "UNANSWERED",
              })),
            },
          },
        });

        return NextResponse.json({
          sessionId: practiceSession.id,
          title: drillTitle,
          questionCount: questionIds.length,
          type: "MISTAKE_REVISION",
        });
      }
    }

    // 2. Identify target topic
    if (!targetTopicId && topicSlug) {
      const topicObj = await prisma.topic.findFirst({
        where: { slug: topicSlug },
      });
      if (topicObj) {
        targetTopicId = topicObj.id;
        targetSubjectId = topicObj.subjectId;
        drillTitle = `AI Targeted Drill: ${topicObj.name}`;
      }
    }

    // If still no topic, pick top weak topic from profile
    if (!targetTopicId) {
      const topWeak = profile.topicMastery.weak[0];
      if (topWeak) {
        targetTopicId = topWeak.id;
        drillTitle = `AI Weak Spot Booster: ${topWeak.name}`;
      } else {
        // Fallback to first available active topic
        const anyTopic = await prisma.topic.findFirst({
          where: { active: true, questions: { some: { active: true } } },
        });
        if (anyTopic) {
          targetTopicId = anyTopic.id;
          targetSubjectId = anyTopic.subjectId;
          drillTitle = `AI Diagnostic Practice: ${anyTopic.name}`;
        }
      }
    }

    // Query questions for target topic
    let questions = await prisma.question.findMany({
      where: {
        active: true,
        ...(targetTopicId ? { topicId: targetTopicId } : {}),
      },
      select: { id: true },
      take: Math.min(25, count * 2),
    });

    if (questions.length === 0) {
      // Fallback: any active questions
      questions = await prisma.question.findMany({
        where: { active: true },
        select: { id: true },
        take: count,
      });
    }

    if (questions.length === 0) {
      return NextResponse.json({ error: "No questions available to generate drill" }, { status: 404 });
    }

    // Shuffle and slice to desired count
    const selectedQuestions = [...questions]
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(count, questions.length));

    const practiceSession = await prisma.practiceSession.create({
      data: {
        userId: session.userId,
        title: drillTitle,
        topicId: targetTopicId || null,
        subjectId: targetSubjectId || null,
        mode: "TEST",
        difficulty: "MIXED",
        sourceType: "ALL",
        totalQuestions: selectedQuestions.length,
        durationSeconds: selectedQuestions.length * 90,
        status: "IN_PROGRESS",
        sessionQuestions: {
          create: selectedQuestions.map((q, idx) => ({
            questionId: q.id,
            questionOrder: idx + 1,
            answerStatus: "UNANSWERED",
          })),
        },
      },
    });

    return NextResponse.json({
      sessionId: practiceSession.id,
      title: drillTitle,
      questionCount: selectedQuestions.length,
      topicId: targetTopicId,
    });
  } catch (error: any) {
    console.error("POST /api/ai/coach/generate-drill error:", error);
    return NextResponse.json(
      { error: "Failed to generate targeted drill", details: error.message },
      { status: 500 }
    );
  }
}
