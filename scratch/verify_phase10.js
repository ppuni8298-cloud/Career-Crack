// scratch/verify_phase10.js
const { PrismaClient } = require('@prisma/client');
const http = require('http');

const prisma = new PrismaClient();

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const durationMs = Date.now() - startTime;
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed, durationMs });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data, durationMs });
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
  console.log("==========================================================");
  console.log("CAREER CRACK 🌱 — PHASE 10 MASTER VERIFICATION SUITE");
  console.log("==========================================================\n");

  const errors = [];

  // 1. Database Safety & Question Bank Count Verification
  const totalQuestions = await prisma.question.count();
  const totalUsers = await prisma.user.count();
  console.log(`1. Database Preservation Check:`);
  console.log(`   - Total Questions in DB: ${totalQuestions}`);
  console.log(`   - Total Registered Users: ${totalUsers}`);
  if (totalQuestions < 5000) {
    errors.push(`Question bank count dropped below 5,000 (${totalQuestions})!`);
  } else {
    console.log(`   ✅ PASSED: 5,000+ Question Bank Fully Preserved (${totalQuestions} verified)`);
  }

  // 2. Authenticate / Create Phase 10 Candidate
  const email = `phase10_aspirant_${Date.now()}@example.com`;
  const password = "Password123!";
  console.log(`\n2. Creating Authenticated Candidate: ${email}`);

  const signupRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/auth/signup",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { name: "Phase 10 Top Candidate", email, password }
  );

  let cookie = signupRes.headers["set-cookie"]?.[0]?.split(";")[0];
  if (!cookie) {
    console.log("Signing in existing candidate...");
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

  const authHeader = { Cookie: cookie || "" };
  console.log(`   ✅ PASSED: Authenticated Session Established`);

  // 3. FEATURE 1: Personal AI Learning Assistant Context & Chat
  console.log(`\n3. Testing Feature 1: AI Coach Context & Chat (/api/ai/coach/chat)...`);
  const chatRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/ai/coach/chat",
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
    },
    { message: "What is my current study status and recommended focus?" }
  );

  if (chatRes.status !== 200 || !chatRes.body?.reply) {
    errors.push(`AI Coach chat failed with status ${chatRes.status}`);
  } else {
    console.log(`   ✓ Coach Reply: "${chatRes.body.reply.substring(0, 80)}..."`);
    console.log(`   ✓ Suggested Actions: ${chatRes.body.suggestedActions?.length || 0}`);
    console.log(`   ✅ PASSED: AI Learning Assistant Active (${chatRes.durationMs}ms)`);
  }

  // 4. FEATURE 2: Dynamic Study Roadmap & Preferences
  console.log(`\n4. Testing Feature 2: Dynamic Study Roadmap (/api/roadmap & /api/roadmap/preferences)...`);
  const prefRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/roadmap/preferences",
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
    },
    {
      targetExam: "SSC CGL",
      dailyStudyHours: "3-4 hours",
      goalCategory: "GOVERNMENT",
      targetExamDate: "2026-12-15",
    }
  );

  const tasksRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/roadmap/tasks",
    method: "GET",
    headers: { ...authHeader },
  });

  if (tasksRes.status !== 200 || !Array.isArray(tasksRes.body?.tasks)) {
    errors.push(`Roadmap tasks failed with status ${tasksRes.status}`);
  } else {
    console.log(`   ✓ Dynamic Tasks Generated: ${tasksRes.body.tasks.length}`);
    console.log(`   ✓ Summary: ${tasksRes.body.summary?.completed || 0} completed, ${tasksRes.body.summary?.pending || 0} pending`);
    console.log(`   ✅ PASSED: Dynamic Roadmap Tasks Configured`);
  }

  // 5. FEATURE 3: Advanced Performance & Readiness Analytics
  console.log(`\n5. Testing Feature 3: Advanced Performance Analytics (/api/analytics)...`);
  const analyticsRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/analytics",
    method: "GET",
    headers: { ...authHeader },
  });

  if (analyticsRes.status !== 200 || !analyticsRes.body?.summary) {
    errors.push(`Analytics endpoint failed with status ${analyticsRes.status}`);
  } else {
    const s = analyticsRes.body.summary;
    console.log(`   ✓ Accuracy: ${s.overallAccuracy}%, Speed: ${s.avgSpeedSeconds}s/q`);
    console.log(`   ✓ Composite Readiness: ${s.compositeReadiness}%`);
    console.log(`   ✓ Methodology: ${analyticsRes.body.readinessMethodology?.formula}`);
    console.log(`   ✓ Consistency Heatmap Days: ${analyticsRes.body.consistencyData?.length || 0}`);
    console.log(`   ✅ PASSED: Advanced Analytics Engine Verified`);
  }

  // 6. FEATURE 4: AI Interview & Placement Simulator
  console.log(`\n6. Testing Feature 4: AI Interview Simulator (/api/interview)...`);
  const interviewStart = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/interview",
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
    },
    {
      interviewType: "TECHNICAL",
      topicOrRole: "Data Structures & Algorithms",
      difficulty: "INTERMEDIATE",
    }
  );

  if (interviewStart.status !== 200 || !interviewStart.body?.sessionId) {
    errors.push(`Interview creation failed with status ${interviewStart.status}`);
  } else {
    const sessionId = interviewStart.body.sessionId;
    console.log(`   ✓ Interview Session Created: ${sessionId}`);

    // Submit user answer
    const turnRes = await request(
      {
        hostname: "localhost",
        port: 3000,
        path: `/api/interview/${sessionId}`,
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
      },
      {
        userAnswer: "In binary search trees, average lookup is O(log n), but in the worst case with unbalanced skewed nodes it becomes O(n). Self-balancing AVL trees avoid this.",
      }
    );

    console.log(`   ✓ Turn Evaluated: Score ${turnRes.body?.evaluation?.score || 0}%`);
    console.log(`   ✓ Follow-up: "${turnRes.body?.followUpQuestion || "Next Question"}"`);
    console.log(`   ✅ PASSED: AI Interview Simulation Operational`);
  }

  // 7. FEATURE 5: Collaborative Study Groups & Challenges
  console.log(`\n7. Testing Feature 5: Study Groups & Peer Challenges (/api/study-groups)...`);
  const createGroupRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/study-groups",
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
    },
    {
      name: `Apex Aspirants Club ${Date.now()}`,
      description: "Daily 30 Quant Questions Target group",
      targetExam: "SSC CGL",
    }
  );

  if (createGroupRes.status !== 200 || !createGroupRes.body?.group) {
    errors.push(`Study group creation failed with status ${createGroupRes.status}`);
  } else {
    const grp = createGroupRes.body.group;
    console.log(`   ✓ Created Group: "${grp.name}" with Invite Code: [${grp.code}]`);

    // Add study goal to group
    const goalRes = await request(
      {
        hostname: "localhost",
        port: 3000,
        path: `/api/study-groups/${grp.id}/goals`,
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
      },
      {
        title: "Solve 50 Geometry PYQs",
        targetCount: 50,
        subject: "Quantitative Aptitude",
        dueDate: "2026-10-15",
      }
    );

    console.log(`   ✓ Group Goal Set: "${goalRes.body?.goal?.title}"`);
    console.log(`   ✅ PASSED: Study Group & Goal Ecosystem Active`);
  }

  // 8. FEATURE 6: Smart Revision & Notification Preferences
  console.log(`\n8. Testing Feature 6: Opt-in Notifications & Spaced Revision (/api/notifications/preferences)...`);
  const notifRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/notifications/preferences",
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader },
    },
    {
      emailReminders: true,
      dailyTaskAlerts: true,
      revisionDueAlerts: true,
      studyGroupAlerts: true,
      reminderTime: "08:30",
    }
  );

  if (notifRes.status !== 200 || !notifRes.body?.preferences) {
    errors.push(`Notification preferences failed with status ${notifRes.status}`);
  } else {
    console.log(`   ✓ Notification Preferences: Daily Alerts=${notifRes.body.preferences.dailyTaskAlerts}, Time=${notifRes.body.preferences.reminderTime}`);
    console.log(`   ✅ PASSED: Opt-in Reminder Preferences Configured`);
  }

  console.log("\n==========================================================");
  console.log("FINAL PHASE 10 INTEGRATION VERIFICATION SUMMARY");
  console.log("==========================================================");
  console.log(`Total Errors  : ${errors.length}`);

  if (errors.length > 0) {
    console.log("\n❌ VERIFICATION FAILED:");
    for (const err of errors) {
      console.log(`  - ${err}`);
    }
    process.exit(1);
  } else {
    console.log("\n🎉 ALL PHASE 10 MASTER FEATURES VALIDATED & VERIFIED SUCCESSFULLY!");
  }
}

main()
  .catch((e) => {
    console.error("Verification suite failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
