const { PrismaClient } = require("@prisma/client");
const { SignJWT } = require("jose");

const prisma = new PrismaClient();
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "career-crack-super-secret-jwt-key-default-32bytes"
);

async function runVerification() {
  console.log("=== PHASE 3 PRACTICE ENGINE AUTOMATED VERIFICATION ===");

  // 1. Find user
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found in database");
  console.log("✓ Found user:", user.email, "id:", user.id);

  // 2. Generate auth cookie
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    isOnboarded: user.isOnboarded,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);

  const authHeader = {
    Cookie: `career_crack_session=${token}`,
    "Content-Type": "application/json",
  };

  const BASE_URL = "http://localhost:3000";

  // 3. Create a Learning Mode session with 5 questions
  console.log("\n1. Testing POST /api/practice/sessions (Learning Mode, 5 questions)...");
  const createRes = await fetch(`${BASE_URL}/api/practice/sessions`, {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify({
      difficulty: "MIXED",
      sourceType: "ALL",
      questionCount: 5,
      enableTimer: true,
      mode: "LEARNING",
    }),
  });

  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`Failed to create session: ${createRes.status} ${text}`);
  }
  const createJson = await createRes.json();
  const sessionId = createJson.sessionId || createJson.session?.id;
  console.log("✓ Created Session ID:", sessionId);

  // 4. Fetch session details via GET /api/practice/sessions/[id]
  console.log("\n2. Testing GET /api/practice/sessions/[id]...");
  const getRes = await fetch(`${BASE_URL}/api/practice/sessions/${sessionId}`, {
    headers: authHeader,
  });
  if (!getRes.ok) throw new Error(`Failed to get session: ${getRes.status}`);
  const getJson = await getRes.json();
  const sessionObj = getJson.session || getJson;
  const questionsList = sessionObj.questions || [];
  console.log("✓ Session loaded:", sessionObj.title, "| Questions count:", questionsList.length);
  console.log("✓ Remaining seconds:", sessionObj.remainingSeconds);

  // 5. Answer Question 1 (Test instant feedback)
  const q1 = questionsList[0];
  const q1Id = q1.questionId || q1.id;
  console.log(`\n3. Answering Question 1 (${q1Id}) with option '${q1.options[0].optionKey}'...`);
  const ansRes = await fetch(`${BASE_URL}/api/practice/sessions/${sessionId}/answer`, {
    method: "PATCH",
    headers: authHeader,
    body: JSON.stringify({
      questionId: q1Id,
      selectedOptionKey: q1.options[0].optionKey,
      timeSpentDelta: 25,
    }),
  });
  if (!ansRes.ok) throw new Error(`Failed to submit answer: ${ansRes.status}`);
  const ansJson = await ansRes.json();
  console.log("✓ Answer response:", {
    isCorrect: ansJson.isCorrect,
    correctOptionKey: ansJson.correctOptionKey,
    hasExplanation: !!ansJson.explanation,
  });

  // 6. Mark Question 2 for review
  const q2 = questionsList[1];
  const q2Id = q2.questionId || q2.id;
  console.log(`\n4. Toggling review on Question 2 (${q2Id})...`);
  const revRes = await fetch(`${BASE_URL}/api/practice/sessions/${sessionId}/review`, {
    method: "PATCH",
    headers: authHeader,
    body: JSON.stringify({
      questionId: q2Id,
      markedForReview: true,
    }),
  });
  if (!revRes.ok) throw new Error(`Failed to toggle review: ${revRes.status}`);
  const revJson = await revRes.json();
  console.log("✓ Marked for review status:", revJson.markedForReview);

  // 7. Complete session via POST /api/practice/sessions/[id]/complete
  console.log(`\n5. Completing session via POST /api/practice/sessions/${sessionId}/complete...`);
  const compRes = await fetch(`${BASE_URL}/api/practice/sessions/${sessionId}/complete`, {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify({
      totalTimeSpent: 120,
    }),
  });
  if (!compRes.ok) throw new Error(`Failed to complete session: ${compRes.status}`);
  const compJson = await compRes.json();
  const completedSession = compJson.session || compJson;
  console.log("✓ Session Completed:", {
    score: completedSession.score,
    accuracy: completedSession.accuracy,
    correct: completedSession.correctCount,
    incorrect: completedSession.incorrectCount,
    skipped: completedSession.skippedCount,
  });

  // 8. Fetch detailed results via GET /api/practice/sessions/[id]/results
  console.log(`\n6. Fetching results via GET /api/practice/sessions/${sessionId}/results...`);
  const resRes = await fetch(`${BASE_URL}/api/practice/sessions/${sessionId}/results`, {
    headers: authHeader,
  });
  if (!resRes.ok) throw new Error(`Failed to get results: ${resRes.status}`);
  const resJson = await resRes.json();
  console.log("✓ Results Summary:", {
    totalQuestions: resJson.summary.totalQuestions,
    correctCount: resJson.summary.correctCount,
    score: resJson.summary.score,
    accuracy: resJson.summary.accuracy + "%",
    strengthsCount: resJson.strengths.length,
    areasToImproveCount: resJson.areasToImprove.length,
    reviewedQuestionsCount: resJson.questions.length,
  });

  // 9. Fetch history via GET /api/practice/history
  console.log("\n7. Testing GET /api/practice/history...");
  const histRes = await fetch(`${BASE_URL}/api/practice/history`, {
    headers: authHeader,
  });
  if (!histRes.ok) throw new Error(`Failed to get history: ${histRes.status}`);
  const histJson = await histRes.json();
  console.log("✓ History Summary:", {
    totalSessionsCompleted: histJson.stats.totalSessionsCompleted,
    totalQuestionsAttempted: histJson.stats.totalQuestionsAttempted,
    averageAccuracy: histJson.stats.averageAccuracy + "%",
    recentSessionsCount: histJson.sessions.length,
  });

  console.log("\n=== ALL 7 ENDPOINTS & FLOWS VERIFIED SUCCESSFULLY! ===");
}

runVerification()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
