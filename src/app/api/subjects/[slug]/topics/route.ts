import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const subject = await prisma.subject.findUnique({
      where: { slug },
      include: {
        topics: {
          where: { active: true },
          orderBy: { order: "asc" },
          include: {
            _count: {
              select: { questions: true },
            },
          },
        },
      },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const formattedTopics = subject.topics.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      order: t.order,
      questionCount: t._count.questions,
    }));

    return NextResponse.json({
      subject: { id: subject.id, name: subject.name, slug: subject.slug },
      topics: formattedTopics,
    });
  } catch (error: any) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}
