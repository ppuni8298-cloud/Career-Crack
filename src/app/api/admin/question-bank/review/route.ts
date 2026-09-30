import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const [total, questions] = await Promise.all([
      prisma.question.count({
        where: {
          OR: [
            { needsReview: true },
            { verificationStatus: "REVIEW_REQUIRED" },
          ],
        },
      }),
      prisma.question.findMany({
        where: {
          OR: [
            { needsReview: true },
            { verificationStatus: "REVIEW_REQUIRED" },
          ],
        },
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          subject: { select: { name: true, slug: true } },
          topic: { select: { name: true, slug: true } },
          exam: { select: { name: true, slug: true } },
          options: true,
          pyqMetadata: true,
        },
      }),
    ]);

    return NextResponse.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      questions,
    });
  } catch (error: any) {
    console.error("Error fetching review queue:", error);
    return NextResponse.json({ error: "Failed to fetch review queue" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionId, action, reviewNotes, updatedData } = body;

    if (!questionId || !action) {
      return NextResponse.json(
        { error: "questionId and action are required." },
        { status: 400 }
      );
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { pyqMetadata: true },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      await prisma.question.update({
        where: { id: questionId },
        data: {
          needsReview: false,
          verified: true,
          verificationStatus: "VERIFIED",
          reviewNotes: reviewNotes || "Approved by Admin",
        },
      });

      if (question.pyqMetadata) {
        await prisma.pYQMetadata.update({
          where: { id: question.pyqMetadata.id },
          data: { verificationStatus: "VERIFIED" },
        });
      }
      return NextResponse.json({ success: true, message: "Question successfully approved." });
    }

    if (action === "REJECT") {
      await prisma.question.update({
        where: { id: questionId },
        data: {
          active: false,
          needsReview: false,
          verificationStatus: "REJECTED",
          reviewNotes: reviewNotes || "Rejected during review",
        },
      });
      return NextResponse.json({ success: true, message: "Question rejected and deactivated." });
    }

    if (action === "MARK_DUPLICATE") {
      await prisma.question.update({
        where: { id: questionId },
        data: {
          active: false,
          needsReview: false,
          verificationStatus: "DUPLICATE",
          reviewNotes: reviewNotes || "Marked as duplicate",
        },
      });
      return NextResponse.json({ success: true, message: "Question marked as duplicate." });
    }

    if (action === "EDIT" && updatedData) {
      await prisma.question.update({
        where: { id: questionId },
        data: {
          questionText: updatedData.questionText || question.questionText,
          difficulty: updatedData.difficulty || question.difficulty,
          explanation: updatedData.explanation || question.explanation,
          shortcut: updatedData.shortcut ?? question.shortcut,
          commonMistake: updatedData.commonMistake ?? question.commonMistake,
          needsReview: false,
          reviewNotes: reviewNotes || "Edited and verified",
        },
      });
      return NextResponse.json({ success: true, message: "Question updated successfully." });
    }

    return NextResponse.json({ error: `Unknown action '${action}'` }, { status: 400 });
  } catch (error: any) {
    console.error("Error processing review action:", error);
    return NextResponse.json({ error: "Failed to process review action" }, { status: 500 });
  }
}
