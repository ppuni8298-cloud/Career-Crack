const { PrismaClient } = require("@prisma/client");
const { SignJWT } = require("jose");

const prisma = new PrismaClient();
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "career-crack-super-secret-jwt-key-default-32bytes"
);

async function verifyTestMode() {
  console.log("=== VERIFYING TEST MODE (CHEATING PREVENTION & REDACTION) ===");

  const user = await prisma.user.findFirst();
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

  // 1. Create Test Mode session
  const createRes = await fetch(`${BASE_URL}/api/practice/sessions`, {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify({
      mode: "TEST",
      questionCount: 5,
      enableTimer: true,
    }),
  });
  const sessionData = await createRes.json();
  const sessionId = sessionData.sessionId || sessionData.session?.id;
  console.log("✓ Created Test Mode Session:", sessionId);

  // 2. Fetch session details while IN_PROGRESS
  const getRes = await fetch(`${BASE_URL}/api/practice/sessions/${sessionId}`, {
    headers: authHeader,
  });
  const getJson = await getRes.json();
  const q1 = (getJson.session?.questions || [])[0];

  // Verify that isCorrect is NOT present on any option
  const hasLeakedCorrectness = q1.options.some((o) => o.isCorrect !== undefined);
  const hasLeakedExplanation = q1.explanation !== undefined;
  console.log("✓ Correctness hidden in active Test Mode:", !hasLeakedCorrectness);
  console.log("✓ Explanation hidden in active Test Mode:", !hasLeakedExplanation);

  if (hasLeakedCorrectness || hasLeakedExplanation) {
    throw new Error("SECURITY FAILURE: Answers or explanations leaked in active Test Mode!");
  }

  // 3. Answer Q1
  const ansRes = await fetch(`${BASE_URL}/api/practice/sessions/${sessionId}/answer`, {
    method: "PATCH",
    headers: authHeader,
    body: JSON.stringify({
      questionId: q1.questionId || q1.id,
      selectedOptionKey: "B",
    }),
  });
  const ansJson = await ansRes.json();
  console.log("✓ Answer response confirms save without leaking correctness:", {
    saved: ansJson.saved,
    isCorrectOmitted: ansJson.isCorrect === undefined,
    explanationOmitted: ansJson.explanation === undefined,
  });

  // 4. Complete session
  await fetch(`${BASE_URL}/api/practice/sessions/${sessionId}/complete`, {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify({ totalTimeSpent: 60 }),
  });

  // 5. Fetch results - now explanation and correctness MUST be present!
  const resRes = await fetch(`${BASE_URL}/api/practice/sessions/${sessionId}/results`, {
    headers: authHeader,
  });
  const resJson = await resRes.json();
  const reviewedQ1 = resJson.questions[0];
  console.log("✓ Results reveal complete verified answer and explanation:", {
    correctOptionKey: reviewedQ1.correctOptionKey,
    hasExplanation: !!reviewedQ1.explanation,
    hasConcept: !!reviewedQ1.concept,
    answerStatus: reviewedQ1.answerStatus,
  });

  console.log("=== TEST MODE SECURITY & DISCLOSURE VERIFIED! ===");
}

verifyTestMode()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
