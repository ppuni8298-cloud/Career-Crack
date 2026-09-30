import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const attempts = await prisma.mockTestAttempt.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        mockTest: {
          select: {
            id: true,
            title: true,
            slug: true,
            totalQuestions: true,
            totalMarks: true,
            durationSeconds: true,
            difficulty: true,
            exam: {
              select: {
                id: true,
                name: true,
                category: true,
                organization: true,
                logo: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ attempts });
  } catch (error: any) {
    console.error("GET /api/mock-tests/history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mock test history", details: error.message },
      { status: 500 }
    );
  }
}
