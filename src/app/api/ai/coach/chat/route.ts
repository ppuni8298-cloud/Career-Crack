import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compileStudentProfile, generateCoachChatResponse } from "@/lib/ai-coach";

// GET: Retrieve user's past conversation history with CrackCoach AI
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const messages = await prisma.coachMessage.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("GET /api/ai/coach/chat error:", error);
    return NextResponse.json(
      { error: "Failed to load chat history", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Send query to CrackCoach AI
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const profile = await compileStudentProfile(session.userId);
    if (!profile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    // Fetch last 10 messages for conversational context
    const recentMessages = await prisma.coachMessage.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const conversationHistory = recentMessages
      .reverse()
      .map((m) => ({
        role: m.role as "USER" | "COACH",
        content: m.content,
      }));

    // Record the user's message
    await prisma.coachMessage.create({
      data: {
        userId: session.userId,
        role: "USER",
        content: message.trim(),
      },
    });

    // Generate response using grounded AI coach
    const { reply, suggestedActions } = await generateCoachChatResponse(
      profile,
      message.trim(),
      conversationHistory
    );

    // Save coach's reply
    const savedCoachMessage = await prisma.coachMessage.create({
      data: {
        userId: session.userId,
        role: "COACH",
        content: reply,
        context: suggestedActions ? JSON.stringify(suggestedActions) : null,
      },
    });

    return NextResponse.json({
      messageId: savedCoachMessage.id,
      reply,
      suggestedActions: suggestedActions || [],
      createdAt: savedCoachMessage.createdAt,
    });
  } catch (error: any) {
    console.error("POST /api/ai/coach/chat error:", error);
    return NextResponse.json(
      { error: "Coach chat error", details: error.message },
      { status: 500 }
    );
  }
}
