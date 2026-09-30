import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const todayStr = dateParam || new Date().toISOString().split("T")[0];

    // 1. Find or initialize today's Daily Challenge
    let challenge = await prisma.dailyChallenge.findUnique({
      where: { date: todayStr },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: {
            question: {
              include: {
                topic: { select: { id: true, name: true } },
                subject: { select: { id: true, name: true } },
                options: {
                  orderBy: { order: "asc" },
                  select: {
                    id: true,
                    optionKey: true,
                    optionText: true,
                    isCorrect: true,
                  },
                },
                pyqMetadata: true,
                tags: { include: { tag: true } },
              },
            },
          },
        },
      },
    });

    if (!challenge) {
      // Pick up to 10 real candidate questions from DB
      const candidateQuestions = await prisma.question.findMany({
        where: { active: true },
        take: 25,
      });

      if (candidateQuestions.length === 0) {
        return NextResponse.json(
          { error: "No questions currently available for daily challenge." },
          { status: 404 }
        );
      }

      // Deterministic shuffle based on date string
      const dateHash = todayStr.split("-").reduce((acc, part) => acc + parseInt(part, 10), 0);
      const shuffled = [...candidateQuestions].sort((a, b) => {
        return ((a.id.charCodeAt(0) + dateHash) % 10) - ((b.id.charCodeAt(0) + dateHash) % 10);
      });

      const selected = shuffled.slice(0, Math.min(10, candidateQuestions.length));

      challenge = await prisma.$transaction(async (tx) => {
        const created = await tx.dailyChallenge.create({
          data: {
            date: todayStr,
            title: `Daily Crack 10 · ${new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}`,
            totalQuestions: selected.length,
          },
        });

        await tx.dailyChallengeQuestion.createMany({
          data: selected.map((q, idx) => ({
            challengeId: created.id,
            questionId: q.id,
            order: idx + 1,
          })),
        });

        return tx.dailyChallenge.findUnique({
          where: { id: created.id },
          include: {
            questions: {
              orderBy: { order: "asc" },
              include: {
                question: {
                  include: {
                    topic: { select: { id: true, name: true } },
                    subject: { select: { id: true, name: true } },
                    options: {
                      orderBy: { order: "asc" },
                      select: {
                        id: true,
                        optionKey: true,
                        optionText: true,
                        isCorrect: true,
                      },
                    },
                    pyqMetadata: true,
                    tags: { include: { tag: true } },
                  },
                },
              },
            },
          },
        });
      });
    }

    if (!challenge) {
      return NextResponse.json({ error: "Failed to load daily challenge" }, { status: 500 });
    }

    // 2. Check if user already attempted today's challenge
    const attempt = await prisma.dailyChallengeAttempt.findUnique({
      where: {
        userId_challengeId: {
          userId: session.userId,
          challengeId: challenge.id,
        },
      },
    });

    const isCompleted = !!attempt;

    // 3. Format questions (redact answers and explanations if not completed)
    const formattedQuestions = challenge.questions.map((cq) => {
      const q = cq.question;
      return {
        id: q.id,
        order: cq.order,
        questionText: q.questionText,
        difficulty: q.difficulty,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        topic: q.topic?.name,
        subject: q.subject?.name,
        tags: q.tags.map((t) => t.tag.name),
        pyqMetadata: q.pyqMetadata,
        options: q.options.map((opt) => ({
          id: opt.id,
          optionKey: opt.optionKey,
          optionText: opt.optionText,
          ...(isCompleted ? { isCorrect: opt.isCorrect } : {}),
        })),
        ...(isCompleted
          ? {
              explanation: q.explanation,
              concept: q.concept,
              shortcut: q.shortcut,
              commonMistake: q.commonMistake,
            }
          : {}),
      };
    });

    return NextResponse.json({
      challenge: {
        id: challenge.id,
        date: challenge.date,
        title: challenge.title,
        totalQuestions: challenge.totalQuestions,
      },
      isCompleted,
      attempt: attempt
        ? {
            score: attempt.score,
            accuracy: attempt.accuracy,
            correctCount: attempt.correctCount,
            incorrectCount: attempt.incorrectCount,
            timeSpentSeconds: attempt.timeSpentSeconds,
            completedAt: attempt.completedAt,
          }
        : null,
      questions: formattedQuestions,
    });
  } catch (err: any) {
    console.error("Error fetching daily challenge:", err);
    return NextResponse.json(
      { error: "Failed to load daily challenge" },
      { status: 500 }
    );
  }
}
