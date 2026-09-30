import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const exam = await prisma.exam.findUnique({
      where: { slug },
      include: {
        examSubjects: {
          orderBy: { order: "asc" },
          include: {
            subject: {
              include: {
                _count: {
                  select: {
                    topics: true,
                    questions: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const subjects = exam.examSubjects.map((es) => ({
      id: es.subject.id,
      name: es.subject.name,
      slug: es.subject.slug,
      description: es.subject.description,
      category: es.subject.category,
      icon: es.subject.icon,
      order: es.order,
      topicCount: es.subject._count.topics,
      questionCount: es.subject._count.questions,
    }));

    return NextResponse.json({
      exam: { id: exam.id, name: exam.name, slug: exam.slug },
      subjects,
    });
  } catch (error: any) {
    console.error("Error fetching exam subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam subjects" },
      { status: 500 }
    );
  }
}
