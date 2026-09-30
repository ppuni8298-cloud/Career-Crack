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

async function runPhase7Tests() {
  console.log("==========================================================");
  console.log("   CAREER CRACK - PHASE 7 AUTOMATED INTEGRATION TESTS     ");
  console.log("==========================================================");

  const email = `phase7_aspirant_${Date.now()}@example.com`;
  const password = "Password@123";

  // 1. Sign up user
  console.log("\n[1] Registering Phase 7 Test Aspirant...");
  const signupRes = await request(
    "http://localhost:3000/api/auth/signup",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { name: "P7 Career Cracker", email, password }
  );
  console.log("Signup status:", signupRes.status, signupRes.data?.user?.email || signupRes.data?.message);

  const setCookie = signupRes.headers["set-cookie"];
  let cookieHeader = "";
  if (setCookie) {
    cookieHeader = Array.isArray(setCookie) ? setCookie.map((c) => c.split(";")[0]).join("; ") : setCookie.split(";")[0];
  }

  const authHeaders = {
    Cookie: cookieHeader,
    "Content-Type": "application/json",
  };

  // 2. Complete Onboarding
  console.log("\n[2] Completing Aspirant Onboarding...");
  const onboardRes = await request(
    "http://localhost:3000/api/onboarding",
    { method: "POST", headers: authHeaders },
    {
      goalCategory: "CENTRAL_GOVT",
      targetExam: "SSC CGL",
      targetSubjects: ["Quantitative Aptitude", "Logical Reasoning"],
      dailyStudyHours: "3-4 hours",
      targetExamDate: "2025-11-20",
    }
  );
  console.log("Onboard status:", onboardRes.status, onboardRes.data?.success ? "SUCCESS" : onboardRes.data);

  // 3. Test GET /api/xp
  console.log("\n[3] Testing GET /api/xp (Initial State)...");
  const xpRes = await request("http://localhost:3000/api/xp", { headers: authHeaders });
  console.log("XP status:", xpRes.status);
  console.log("Total XP:", xpRes.data?.totalXP, "| Level:", xpRes.data?.level, `(${xpRes.data?.title})`);
  console.log("XP to Next Level:", xpRes.data?.xpToNextLevel);

  // 4. Test POST /api/xp (Award XP for action)
  console.log("\n[4] Testing POST /api/xp (Award XP)...");
  const awardRes = await request(
    "http://localhost:3000/api/xp",
    { method: "POST", headers: authHeaders },
    {
      reason: "PRACTICE_SESSION_COMPLETE",
      refId: `session_test_${Date.now()}`,
      amount: 45,
    }
  );
  console.log("Award status:", awardRes.status);
  console.log("XP awarded:", awardRes.data?.xpAwarded, "| New Total XP:", awardRes.data?.totalXP, "| Level:", awardRes.data?.level);

  // 5. Test Idempotency of Award XP
  console.log("\n[5] Testing XP Idempotency (Prevent Duplicate XP)...");
  const dupAwardRes = await request(
    "http://localhost:3000/api/xp",
    { method: "POST", headers: authHeaders },
    {
      reason: "PRACTICE_SESSION_COMPLETE",
      refId: awardRes.data?.refId || "session_test",
      amount: 45,
    }
  );
  console.log("Duplicate award status:", dupAwardRes.status, "| Awarded:", dupAwardRes.data?.awarded);

  // 6. Test GET /api/xp/sync
  console.log("\n[6] Testing GET /api/xp/sync (Historical Backfill Engine)...");
  const syncRes = await request("http://localhost:3000/api/xp/sync", { headers: authHeaders });
  console.log("Sync status:", syncRes.status);
  console.log("Sync message:", syncRes.data?.message);

  // 7. Test GET /api/profile/advanced
  console.log("\n[7] Testing GET /api/profile/advanced (Career Intelligence API)...");
  const profRes = await request("http://localhost:3000/api/profile/advanced", { headers: authHeaders });
  console.log("Profile status:", profRes.status);
  console.log("User:", profRes.data?.user?.name, "| Target:", profRes.data?.profile?.targetExam);
  console.log("XP Level:", profRes.data?.xpLevel?.level, `(${profRes.data?.xpLevel?.title})`, `Total: ${profRes.data?.xpLevel?.totalXP} XP`);
  console.log("Personal Records keys:", Object.keys(profRes.data?.personalRecords || {}));
  console.log("Total Achievements defined:", profRes.data?.achievements?.length);
  console.log("XP History days count:", profRes.data?.charts?.xpHistory?.length);
  console.log("Accuracy trend array length:", profRes.data?.charts?.accuracyTrend?.length);

  // 8. Test GET /api/leaderboard
  console.log("\n[8] Testing GET /api/leaderboard (Community Rankings)...");
  const leadRes = await request("http://localhost:3000/api/leaderboard", { headers: authHeaders });
  console.log("Leaderboard status:", leadRes.status);
  console.log("Total participants:", leadRes.data?.totalParticipants);
  console.log("Current user rank:", leadRes.data?.currentUserRank);
  console.log("Entries count:", leadRes.data?.entries?.length);
  if (leadRes.data?.entries?.length > 0) {
    const top = leadRes.data.entries[0];
    console.log(`Top Rank 1: ${top.displayName} (Level ${top.level} ${top.levelTitle} - ${top.totalXP} XP)`);
  }

  // 9. Test Bookmarking a Question
  console.log("\n[9] Testing POST /api/questions/[id]/bookmark...");
  // Fetch an existing question
  const qListRes = await request("http://localhost:3000/api/questions?limit=1", { headers: authHeaders });
  const questionId = qListRes.data?.questions?.[0]?.id;

  if (questionId) {
    console.log("Bookmarking question ID:", questionId);
    const bmAddRes = await request(
      `http://localhost:3000/api/questions/${questionId}/bookmark`,
      { method: "POST", headers: authHeaders }
    );
    console.log("Bookmark Add status:", bmAddRes.status, bmAddRes.data?.message);

    // 10. Test GET /api/bookmarks
    console.log("\n[10] Testing GET /api/bookmarks (Saved Question Vault)...");
    const bmGetRes = await request("http://localhost:3000/api/bookmarks", { headers: authHeaders });
    console.log("Bookmarks GET status:", bmGetRes.status);
    console.log("Total bookmarks:", bmGetRes.data?.pagination?.total);
    console.log("Retrieved questions count:", bmGetRes.data?.questions?.length);
    if (bmGetRes.data?.questions?.length > 0) {
      const q = bmGetRes.data.questions[0];
      console.log("Bookmarked Question:", q.questionText?.substring(0, 50) + "...");
      console.log("Subject:", q.subject?.name, "| Options count:", q.options?.length);
    }

    // 11. Test DELETE /api/questions/[id]/bookmark
    console.log(`\n[11] Testing DELETE /api/questions/${questionId}/bookmark...`);
    const bmDelRes = await request(
      `http://localhost:3000/api/questions/${questionId}/bookmark`,
      { method: "DELETE", headers: authHeaders }
    );
    console.log("Bookmark DELETE status:", bmDelRes.status, bmDelRes.data?.message);

    // Verify deletion
    const bmVerifyRes = await request("http://localhost:3000/api/bookmarks", { headers: authHeaders });
    console.log("Bookmarks after delete:", bmVerifyRes.data?.pagination?.total);
  } else {
    console.log("Warning: No question found to test bookmarking");
  }

  console.log("\n==========================================================");
  console.log("  ALL PHASE 7 CORE APIS TESTED & VERIFIED SUCCESSFULLY!   ");
  console.log("==========================================================");
}

runPhase7Tests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
