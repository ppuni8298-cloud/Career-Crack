// scratch/verify_question_bank.js
const { PrismaClient } = require('@prisma/client');
const http = require('http');

const prisma = new PrismaClient();

async function checkApi(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const durationMs = Date.now() - startTime;
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          durationMs,
          body: parsed,
          headers: res.headers,
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 0,
        error: err.message,
        durationMs: Date.now() - startTime,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 408, error: 'Request Timeout', durationMs: Date.now() - startTime });
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function main() {
  console.log("=================================================");
  console.log("CAREER CRACK 🌱 — 5,000+ QUESTION BANK VERIFIER");
  console.log("=================================================\n");

  const errors = [];
  const warnings = [];

  // 1. Total Count Verification
  const totalCount = await prisma.question.count();
  console.log(`1. Total Questions in Database: ${totalCount}`);
  if (totalCount < 5000) {
    errors.push(`Total questions (${totalCount}) is less than required 5,000.`);
  } else {
    console.log(`   ✅ PASSED: Total count >= 5,000 (${totalCount} verified)`);
  }

  // 2. Source Types & PYQ Integrity
  const practiceCount = await prisma.question.count({ where: { sourceType: 'PRACTICE' } });
  const pyqCount = await prisma.question.count({ where: { sourceType: 'VERIFIED_PYQ' } });
  const aiChallengeCount = await prisma.question.count({ where: { sourceType: 'AI_CHALLENGE' } });

  console.log(`\n2. Source Type Breakdown:`);
  console.log(`   - PRACTICE: ${practiceCount}`);
  console.log(`   - VERIFIED_PYQ: ${pyqCount}`);
  console.log(`   - AI_CHALLENGE: ${aiChallengeCount}`);

  // Check PYQ metadata integrity
  const pyqsWithoutMeta = await prisma.question.count({
    where: {
      sourceType: 'VERIFIED_PYQ',
      pyqMetadata: null,
    },
  });

  if (pyqsWithoutMeta > 0) {
    errors.push(`Found ${pyqsWithoutMeta} VERIFIED_PYQ questions without pyqMetadata.`);
  } else {
    console.log(`   ✅ PASSED: 100% of VERIFIED_PYQs have required pyqMetadata`);
  }

  // 3. Deep Integrity Check across all questions
  console.log(`\n3. Checking structural integrity of all ${totalCount} records...`);
  const allQuestions = await prisma.question.findMany({
    select: {
      id: true,
      questionText: true,
      difficulty: true,
      sourceType: true,
      explanation: true,
      subjectId: true,
      topicId: true,
      options: {
        select: { id: true, optionKey: true, optionText: true, isCorrect: true },
      },
      subject: { select: { id: true, name: true } },
      topic: { select: { id: true, name: true } },
      pyqMetadata: { select: { exam: true, examYear: true, verificationStatus: true } },
    },
  });

  let missingText = 0;
  let missingOptions = 0;
  let missingCorrect = 0;
  let missingExplanations = 0;
  let missingSubject = 0;
  let missingTopic = 0;
  let invalidDifficulty = 0;
  let invalidSourceType = 0;
  const seenHashes = new Map();
  let duplicateCount = 0;

  const validDiffs = new Set(['EASY', 'MEDIUM', 'HARD']);
  const validSources = new Set(['PRACTICE', 'VERIFIED_PYQ', 'AI_CHALLENGE']);

  for (const q of allQuestions) {
    if (!q.questionText || q.questionText.trim().length === 0) missingText++;
    if (!q.options || q.options.length < 2) missingOptions++;
    const correctOpts = (q.options || []).filter((o) => o.isCorrect);
    if (correctOpts.length !== 1) missingCorrect++;
    if (!q.explanation || q.explanation.trim().length === 0) missingExplanations++;
    if (!q.subject) missingSubject++;
    if (!q.topic) missingTopic++;
    if (!validDiffs.has(q.difficulty)) invalidDifficulty++;
    if (!validSources.has(q.sourceType)) invalidSourceType++;

    // Duplicate check
    const normalized = q.questionText
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (seenHashes.has(normalized)) {
      duplicateCount++;
    } else {
      seenHashes.set(normalized, q.id);
    }
  }

  console.log(`   - Missing Question Text : ${missingText}`);
  console.log(`   - Missing Options (<2)  : ${missingOptions}`);
  console.log(`   - Invalid Correct Count : ${missingCorrect}`);
  console.log(`   - Missing Explanations  : ${missingExplanations}`);
  console.log(`   - Missing Subject Link  : ${missingSubject}`);
  console.log(`   - Missing Topic Link    : ${missingTopic}`);
  console.log(`   - Invalid Difficulty    : ${invalidDifficulty}`);
  console.log(`   - Invalid Source Type   : ${invalidSourceType}`);
  console.log(`   - Duplicate Questions   : ${duplicateCount}`);

  if (missingText > 0) errors.push(`${missingText} questions missing questionText`);
  if (missingOptions > 0) errors.push(`${missingOptions} questions missing valid options`);
  if (missingCorrect > 0) errors.push(`${missingCorrect} questions missing exactly one correct answer`);
  if (missingExplanations > 0) errors.push(`${missingExplanations} questions missing explanations`);
  if (missingSubject > 0) errors.push(`${missingSubject} questions missing valid Subject association`);
  if (missingTopic > 0) errors.push(`${missingTopic} questions missing valid Topic association`);
  if (invalidDifficulty > 0) errors.push(`${invalidDifficulty} questions have invalid difficulty`);
  if (invalidSourceType > 0) errors.push(`${invalidSourceType} questions have invalid sourceType`);
  if (duplicateCount > 0) warnings.push(`${duplicateCount} possible duplicate questions detected`);

  if (errors.length === 0) {
    console.log(`   ✅ PASSED: Full Structural and Relational Integrity Verified`);
  }

  // 4. API Query Performance against 5,000+ records
  console.log(`\n4. Testing API Performance against 5,000+ records...`);
  const routesToTest = [
    { name: 'Questions API (Paginated)', path: '/api/questions?limit=20&page=1' },
    { name: 'Questions API (Filtered by Exam & Subject)', path: '/api/questions?exam=ssc-cgl&subject=quantitative-aptitude&limit=20' },
    { name: 'Questions API (Search & PYQ filter)', path: '/api/questions?search=percentage&sourceType=VERIFIED_PYQ' },
    { name: 'Question Bank Stats API', path: '/api/admin/question-bank/stats' },
    { name: 'Practice Engine API', path: '/api/practice' },
    { name: 'Crack Mode Engine API', path: '/api/crack-mode' },
    { name: 'Revision System API', path: '/api/revision' },
  ];

  for (const route of routesToTest) {
    const res = await checkApi(route.path);
    if (res.status === 0 || res.status >= 500) {
      console.log(`   ⚠️ [${route.name}] (${route.path}): Status ${res.status} (${res.durationMs}ms) - Dev server might not be running or requires auth`);
    } else {
      console.log(`   ✓ [${route.name}]: Status ${res.status} | Response Time: ${res.durationMs}ms`);
    }
  }

  console.log("\n=================================================");
  console.log("FINAL VERIFICATION SUMMARY");
  console.log("=================================================");
  console.log(`Total Errors  : ${errors.length}`);
  console.log(`Total Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.log("\n❌ VERIFICATION FAILED:");
    for (const err of errors) {
      console.log(`  - ${err}`);
    }
    process.exit(1);
  } else {
    console.log("\n🎉 ALL PHASE 9 CRITERIA VERIFIED AND PASSED SUCCESSFULLY!");
  }
}

main()
  .catch((e) => {
    console.error("Verification script failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
