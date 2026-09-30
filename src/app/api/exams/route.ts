import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const whereClause: any = { active: true };

    if (category && category !== "ALL") {
      whereClause.category = category;
    }

    if (search && search.trim() !== "") {
      whereClause.OR = [
        { name: { contains: search.trim() } },
        { organization: { contains: search.trim() } },
        { description: { contains: search.trim() } },
      ];
    }

    const exams = await prisma.exam.findMany({
      where: whereClause,
      include: {
        variants: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            examSubjects: true,
            questions: true,
          },
        },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    const formattedExams = exams.map((exam) => ({
      id: exam.id,
      name: exam.name,
      slug: exam.slug,
      category: exam.category,
      description: exam.description,
      organization: exam.organization,
      state: exam.state,
      logo: exam.logo,
      active: exam.active,
      subjectCount: exam._count.examSubjects,
      questionCount: exam._count.questions,
      variants: exam.variants,
    }));

    return NextResponse.json({
      exams: formattedExams,
      total: formattedExams.length,
    });
  } catch (error: any) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}
