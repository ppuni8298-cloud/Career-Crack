import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      total,
      practice,
      verifiedPYQ,
      aiChallenge,
      needsReview,
      addedToday,
      difficulties,
      exams,
      subjects,
      topics,
    ] = await Promise.all([
      prisma.question.count(),
      prisma.question.count({ where: { sourceType: "PRACTICE" } }),
      prisma.question.count({ where: { sourceType: "VERIFIED_PYQ" } }),
      prisma.question.count({ where: { sourceType: "AI_CHALLENGE" } }),
      prisma.question.count({ where: { needsReview: true } }),
      prisma.question.count({ where: { createdAt: { gte: today } } }),
      prisma.question.groupBy({
        by: ["difficulty"],
        _count: { id: true },
      }),
      prisma.question.groupBy({
        by: ["examId"],
        _count: { id: true },
      }),
      prisma.question.groupBy({
        by: ["subjectId"],
        _count: { id: true },
      }),
      prisma.question.groupBy({
        by: ["topicId"],
        _count: { id: true },
      }),
    ]);

    // Fetch relational names for exams, subjects, topics
    const [examDetails, subjectDetails, topicDetails] = await Promise.all([
      prisma.exam.findMany({ select: { id: true, name: true, slug: true } }),
      prisma.subject.findMany({ select: { id: true, name: true, slug: true } }),
      prisma.topic.findMany({ select: { id: true, name: true, slug: true, subjectId: true } }),
    ]);

    const examMap = new Map(examDetails.map((e) => [e.id, e.name]));
    const subjectMap = new Map(subjectDetails.map((s) => [s.id, s.name]));
    const topicMap = new Map(topicDetails.map((t) => [t.id, t.name]));

    const byExam = exams.map((e) => ({
      examId: e.examId,
      name: e.examId ? examMap.get(e.examId) || "Other / Variant" : "General / Multi-Exam",
      count: e._count.id,
    }));

    const bySubject = subjects.map((s) => ({
      subjectId: s.subjectId,
      name: subjectMap.get(s.subjectId) || "Unknown Subject",
      count: s._count.id,
    }));

    const byTopic = topics
      .map((t) => ({
        topicId: t.topicId,
        name: topicMap.get(t.topicId) || "Unknown Topic",
        count: t._count.id,
      }))
      .sort((a, b) => b.count - a.count);

    const byDifficulty = difficulties.reduce((acc: any, d) => {
      acc[d.difficulty] = d._count.id;
      return acc;
    }, { EASY: 0, MEDIUM: 0, HARD: 0 });

    return NextResponse.json({
      total,
      practice,
      verifiedPYQ,
      aiChallenge,
      needsReview,
      addedToday,
      byDifficulty,
      byExam,
      bySubject,
      byTopic: byTopic.slice(0, 20),
      duplicates: 0,
    });
  } catch (error: any) {
    console.error("Error fetching question bank stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch question bank statistics" },
      { status: 500 }
    );
  }
}
