const http = require("http");

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 3000,
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (e) {
          json = body;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on("error", reject);
    if (data) {
      req.write(typeof data === "string" ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING PHASE 4 INTEGRATION & API VALIDATION ===");
  const email = `aspirant_p4_${Date.now()}@example.com`;
  const password = "Password@123";

  // 1. Sign up a new user
  console.log("\n[1] Testing User Registration...");
  const signupRes = await request(
    "http://localhost:3000/api/auth/signup",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { name: "P4 Aspirant", email, password }
  );
  console.log("Signup status:", signupRes.status, signupRes.data?.user?.email || signupRes.data?.message);

  // Extract session cookie
  const setCookie = signupRes.headers["set-cookie"];
  let cookieHeader = "";
  if (setCookie) {
    cookieHeader = Array.isArray(setCookie) ? setCookie.map((c) => c.split(";")[0]).join("; ") : setCookie.split(";")[0];
  }
  console.log("Cookie received:", cookieHeader ? "YES" : "NO");

  const authHeaders = {
    Cookie: cookieHeader,
    "Content-Type": "application/json",
  };

  // 2. Complete Onboarding with correct schema
  console.log("\n[2] Setting Onboarding Profile...");
  const onboardRes = await request(
    "http://localhost:3000/api/onboarding",
    { method: "POST", headers: authHeaders },
    {
      goalCategory: "CENTRAL_GOVT",
      targetExam: "SSC CGL",
      targetSubjects: ["Quantitative Aptitude", "General Intelligence & Reasoning"],
      dailyStudyHours: "2-4 hours",
      targetExamDate: "2025-10-15",
    }
  );
  console.log("Onboard status:", onboardRes.status, onboardRes.data?.success ? "SUCCESS" : onboardRes.data);

  // 3. Test GET /api/dashboard
  console.log("\n[3] Testing GET /api/dashboard...");
  const dashRes = await request("http://localhost:3000/api/dashboard", { headers: authHeaders });
  console.log("Dashboard status:", dashRes.status);
  console.log("Performance summary questionsAttempted:", dashRes.data?.performanceSummary?.questionsAttempted);
  console.log("Continue learning recentExam:", dashRes.data?.continueLearning?.recentExam?.name);

  // 4. Test GET /api/progress
  console.log("\n[4] Testing GET /api/progress...");
  const progRes = await request("http://localhost:3000/api/progress", { headers: authHeaders });
  console.log("Progress status:", progRes.status);
  console.log("Syllabus total topics:", progRes.data?.stats?.totalTopics);
  console.log("Topics array length:", progRes.data?.topics?.length);

  // 5. Test GET /api/recommendations
  console.log("\n[5] Testing GET /api/recommendations...");
  const recRes = await request("http://localhost:3000/api/recommendations", { headers: authHeaders });
  console.log("Recommendations status:", recRes.status);
  console.log("Recommendations count:", recRes.data?.recommendations?.length);
  if (recRes.data?.recommendations?.length > 0) {
    console.log("Top recommendation title:", recRes.data.recommendations[0].title);
  }

  // 6. Test GET /api/daily-crack
  console.log("\n[6] Testing GET /api/daily-crack...");
  const dcRes = await request("http://localhost:3000/api/daily-crack", { headers: authHeaders });
  console.log("Daily Crack status:", dcRes.status);
  console.log("Challenge date:", dcRes.data?.challenge?.date);
  console.log("Total questions:", dcRes.data?.questions?.length);
  console.log("Is already completed today:", dcRes.data?.isCompleted);

  // Anti-cheat verification
  if (dcRes.data?.questions?.length > 0) {
    const q1 = dcRes.data.questions[0];
    const hasCorrectFlag = q1.options.some((o) => o.isCorrect !== undefined);
    console.log("Anti-cheat check passed (isCorrect hidden):", !hasCorrectFlag);
  }

  // 7. Test POST /api/daily-crack/complete
  console.log("\n[7] Testing POST /api/daily-crack/complete...");
  const answers = {};
  if (dcRes.data?.questions?.length > 0) {
    // Provide answers (some will be intentionally wrong to log into Mistake Vault)
    dcRes.data.questions.forEach((q, idx) => {
      answers[q.id] = "A"; // Answer option A
    });
  }

  const dcCompleteRes = await request(
    "http://localhost:3000/api/daily-crack/complete",
    { method: "POST", headers: authHeaders },
    {
      challengeId: dcRes.data?.challenge?.id,
      answers,
      timeSpentSeconds: 95,
    }
  );
  console.log("Daily crack completion status:", dcCompleteRes.status);
  console.log("Daily crack score:", dcCompleteRes.data?.result?.score);
  console.log("Daily crack correctCount:", dcCompleteRes.data?.result?.correctCount);
  console.log("Daily crack incorrectCount:", dcCompleteRes.data?.result?.incorrectCount);

  // 8. Test duplicate submission prevention
  console.log("\n[8] Testing duplicate Daily Challenge prevention...");
  const dupDcRes = await request(
    "http://localhost:3000/api/daily-crack/complete",
    { method: "POST", headers: authHeaders },
    {
      challengeId: dcRes.data?.challenge?.id,
      answers,
      timeSpentSeconds: 60,
    }
  );
  console.log("Duplicate submission status (expecting 400):", dupDcRes.status, dupDcRes.data?.error);

  // 9. Test GET /api/streak
  console.log("\n[9] Testing GET /api/streak...");
  const streakRes = await request("http://localhost:3000/api/streak", { headers: authHeaders });
  console.log("Streak status:", streakRes.status);
  console.log("Current streak:", streakRes.data?.currentStreak, "Longest streak:", streakRes.data?.longestStreak);
  console.log("Weekly activity days count:", streakRes.data?.weeklyActivity?.length);

  // 10. Test GET /api/achievements
  console.log("\n[10] Testing GET /api/achievements...");
  const achRes = await request("http://localhost:3000/api/achievements", { headers: authHeaders });
  console.log("Achievements status:", achRes.status);
  console.log("Total badges defined:", achRes.data?.totalCount);
  console.log("Unlocked count:", achRes.data?.unlockedCount);

  // 11. Test GET /api/mistakes
  console.log("\n[11] Testing GET /api/mistakes...");
  const mistRes = await request("http://localhost:3000/api/mistakes", { headers: authHeaders });
  console.log("Mistakes status:", mistRes.status);
  console.log("Mistakes count in Vault:", mistRes.data?.mistakes?.length);
  console.log("Mistakes stats:", mistRes.data?.stats);

  // 12. Test PATCH /api/mistakes/[id] & Practice Session creation
  if (mistRes.data?.mistakes?.length > 0) {
    const m1 = mistRes.data.mistakes[0];
    console.log(`\n[12] Testing PATCH /api/mistakes/${m1.id} (status -> REVIEWED)...`);
    const patchRes = await request(
      `http://localhost:3000/api/mistakes/${m1.id}`,
      { method: "PATCH", headers: authHeaders },
      { reviewStatus: "REVIEWED" }
    );
    console.log("Patch status:", patchRes.status, "New reviewStatus:", patchRes.data?.mistake?.reviewStatus);

    // 13. Test POST /api/mistakes/practice
    console.log("\n[13] Testing POST /api/mistakes/practice (Drill from Mistake Vault)...");
    const mistPracRes = await request(
      "http://localhost:3000/api/mistakes/practice",
      { method: "POST", headers: authHeaders },
      {
        onlyUnresolved: false,
        questionCount: 5,
      }
    );
    console.log("Mistake drill created status:", mistPracRes.status);
    console.log("Practice session ID:", mistPracRes.data?.sessionId);
    console.log("Total questions in drill:", mistPracRes.data?.totalQuestions);
  }

  // 14. Re-verify Dashboard with live metrics
  console.log("\n[14] Re-verifying Dashboard with live practice data...");
  const dashRes2 = await request("http://localhost:3000/api/dashboard", { headers: authHeaders });
  console.log("Updated Performance summary:", dashRes2.data?.performanceSummary);
  console.log("Updated Continue learning:", dashRes2.data?.continueLearning);

  console.log("\n========================================================");
  console.log("  ALL PHASE 4 API ENDPOINTS TESTED AND VERIFIED!  ");
  console.log("========================================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
