import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const whereClause: any = { active: true };
    if (category) {
      whereClause.category = category;
    }

    const subjects = await prisma.subject.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            topics: true,
            questions: true,
            examSubjects: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = subjects.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      category: s.category,
      icon: s.icon,
      topicCount: s._count.topics,
      questionCount: s._count.questions,
      examCount: s._count.examSubjects,
    }));

    return NextResponse.json({ subjects: formatted });
  } catch (error: any) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}
