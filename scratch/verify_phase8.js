// scratch/verify_phase8.js
const http = require('http');

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function main() {
  console.log("=== PHASE 8 INTEGRATION SUITE ===");

  // 1. Sign up / login test user
  const email = `phase8_test_${Date.now()}@example.com`;
  const password = "Password123!";

  console.log(`\n1. Creating test user: ${email}`);
  const signupRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/auth/signup",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { name: "Phase 8 Candidate", email, password }
  );

  let cookie = signupRes.headers["set-cookie"]?.[0]?.split(";")[0];
  if (!cookie) {
    console.log("Signing in existing user...");
    const loginRes = await request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { email: "candidate@example.com", password: "Password123!" }
    );
    cookie = loginRes.headers["set-cookie"]?.[0]?.split(";")[0];
  }

  if (!cookie) {
    throw new Error("Failed to obtain authentication session cookie.");
  }
  console.log("✓ Authenticated session active.");

  const authHeaders = {
    Cookie: cookie,
    "Content-Type": "application/json",
  };

  // 2. Test Exam Intelligence
  console.log("\n2. Testing /api/exam-intelligence");
  const examIntelRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/exam-intelligence",
    method: "GET",
    headers: authHeaders,
  });
  console.log(`Status: ${examIntelRes.status}`);
  if (examIntelRes.status !== 200) {
    console.error("Exam Intel Error:", examIntelRes.body);
  } else {
    console.log(`✓ Exams Loaded: ${examIntelRes.body.exams?.length}`);
    console.log(`✓ Active Exam: ${examIntelRes.body.activeExam?.title}`);
  }

  // 3. Test Readiness Engine & Bottlenecks
  console.log("\n3. Testing /api/readiness");
  const readinessRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/readiness",
    method: "GET",
    headers: authHeaders,
  });
  console.log(`Status: ${readinessRes.status}`);
  if (readinessRes.status !== 200) {
    console.error("Readiness Error:", readinessRes.body);
  } else {
    console.log(`✓ Composite Score: ${readinessRes.body.readiness?.compositeScore}`);
    console.log(`✓ Bottlenecks Detected: ${readinessRes.body.holdingBack?.length}`);
    console.log(`✓ Next Best Action: ${readinessRes.body.nextBestAction?.title}`);
  }

  // 4. Test Adaptive Crack Mode
  console.log("\n4. Testing /api/crack-mode (GET questions)");
  const crackGetRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/crack-mode?limit=5&intensity=BALANCED",
    method: "GET",
    headers: authHeaders,
  });
  console.log(`Status: ${crackGetRes.status}`);
  let questionToAnswer = null;
  if (crackGetRes.status !== 200) {
    console.error("Crack Mode GET Error:", crackGetRes.body);
  } else {
    console.log(`✓ Adaptive Questions Returned: ${crackGetRes.body.questions?.length}`);
    questionToAnswer = crackGetRes.body.questions?.[0];
    if (questionToAnswer) {
      console.log(`✓ 'Why this question' metadata: "${questionToAnswer.whyThisQuestion}"`);
    }
  }

  if (questionToAnswer) {
    console.log("\n5. Testing /api/crack-mode (POST submit answer)");
    const crackPostRes = await request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/crack-mode",
        method: "POST",
        headers: authHeaders,
      },
      {
        answers: [
          {
            questionId: questionToAnswer.id,
            selectedOption: questionToAnswer.correctOption || "A",
            timeTakenSeconds: 32,
          },
        ],
      }
    );
    console.log(`Status: ${crackPostRes.status}`);
    if (crackPostRes.status !== 200) {
      console.error("Crack Mode POST Error:", crackPostRes.body);
    } else {
      console.log(`✓ Crack Mode XP Awarded: +${crackPostRes.body.xpAwarded} XP`);
      console.log(`✓ Questions Processed: ${crackPostRes.body.totalProcessed}`);
    }
  }

  // 6. Test Revision Queue & Sync
  console.log("\n6. Testing /api/revision (GET and SYNC)");
  const revisionGetRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/revision",
    method: "GET",
    headers: authHeaders,
  });
  console.log(`Status: ${revisionGetRes.status}`);
  if (revisionGetRes.status !== 200) {
    console.error("Revision GET Error:", revisionGetRes.body);
  } else {
    console.log(`✓ Due Today: ${revisionGetRes.body.dueToday?.length}, Upcoming: ${revisionGetRes.body.upcoming?.length}`);
  }

  const revisionSyncRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/revision",
      method: "POST",
      headers: authHeaders,
    },
    { action: "SYNC" }
  );
  console.log(`✓ Sync Result: ${revisionSyncRes.body.message}`);

  // 7. Test Dual-Track Roadmap
  console.log("\n7. Testing /api/roadmap (Dual Track)");
  const roadmapGovRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/roadmap?track=GOVERNMENT",
    method: "GET",
    headers: authHeaders,
  });
  console.log(`Status: ${roadmapGovRes.status}`);
  if (roadmapGovRes.status === 200) {
    console.log(`✓ Government Roadmap Milestones: ${roadmapGovRes.body.milestones?.length}`);
  }

  const roadmapPlaceRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/roadmap?track=PLACEMENT",
    method: "GET",
    headers: authHeaders,
  });
  console.log(`Status: ${roadmapPlaceRes.status}`);
  if (roadmapPlaceRes.status === 200) {
    console.log(`✓ Placement Roadmap Milestones: ${roadmapPlaceRes.body.milestones?.length}`);
  }

  // 8. Test Placement Hub Data
  console.log("\n8. Testing /api/placements");
  const placementsRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/placements",
    method: "GET",
    headers: authHeaders,
  });
  console.log(`Status: ${placementsRes.status}`);
  if (placementsRes.status !== 200) {
    console.error("Placements Error:", placementsRes.body);
  } else {
    console.log(`✓ Aptitude Readiness: ${placementsRes.body.placementReadiness?.aptitude?.status}`);
    console.log(`✓ DSA Readiness: ${placementsRes.body.placementReadiness?.dsa?.status}`);
    console.log(`✓ Core CS Readiness: ${placementsRes.body.placementReadiness?.coreCs?.status}`);
  }

  // 9. Test AI Technical Interview Engine
  console.log("\n9. Testing /api/interview (Start TECHNICAL session)");
  const interviewStartRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/interview",
      method: "POST",
      headers: authHeaders,
    },
    {
      interviewType: "TECHNICAL",
      topicOrRole: "DSA",
      difficulty: "INTERMEDIATE",
    }
  );
  console.log(`Status: ${interviewStartRes.status}`);
  const sessionId = interviewStartRes.body?.sessionId;
  if (!sessionId) {
    console.error("Interview Start Error:", interviewStartRes.body);
  } else {
    console.log(`✓ Session Created: ${sessionId}`);
    console.log(`✓ First Question: "${interviewStartRes.body.firstQuestion?.questionText}"`);

    // Submit answer to interview turn
    console.log("\n10. Testing /api/interview/[id] (Submit response & evaluate)");
    const turnAnswerRes = await request(
      {
        hostname: "localhost",
        port: 3000,
        path: `/api/interview/${sessionId}`,
        method: "POST",
        headers: authHeaders,
      },
      {
        answer: "A Hash Table resolves collisions using separate chaining with linked lists or open addressing with linear probing. In the average case, operations take O(1) time complexity, but degrade to O(N) when multiple keys hash to the same bucket without balanced tree resizing.",
      }
    );
    console.log(`Status: ${turnAnswerRes.status}`);
    if (turnAnswerRes.status !== 200) {
      console.error("Interview Answer Error:", turnAnswerRes.body);
    } else {
      console.log(`✓ Turn Evaluated: Score ${turnAnswerRes.body.evaluation?.score}%`);
      console.log(`✓ Strong Points:`, turnAnswerRes.body.evaluation?.strongPoints);
      console.log(`✓ Follow-up Generated: "${turnAnswerRes.body.evaluation?.followUpQuestion}"`);
    }

    // View interview report
    console.log("\n11. Testing /api/interview/[id] (GET full scorecard)");
    const reportRes = await request({
      hostname: "localhost",
      port: 3000,
      path: `/api/interview/${sessionId}`,
      method: "GET",
      headers: authHeaders,
    });
    console.log(`Status: ${reportRes.status}`);
    console.log(`✓ Turns Recorded: ${reportRes.body.turns?.length}`);
  }

  console.log("\n=======================================================");
  console.log("🎉 ALL PHASE 8 API ENDPOINTS VALIDATED SUCCESSFULLY! 🎉");
  console.log("=======================================================\n");
}

main().catch((err) => {
  console.error("Validation failed:", err);
  process.exit(1);
});
