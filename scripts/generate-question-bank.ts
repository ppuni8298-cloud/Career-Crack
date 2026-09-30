/**
 * Career Crack — Master Question Bank Ingestion Pipeline
 * 
 * Compiles and ingests 5,000+ validated, high-quality, unique questions
 * across Government Exams, Verified PYQs, Technical CS, and Placements.
 */

import { PrismaClient } from "@prisma/client";
import { importQuestionBatch } from "./import-question-batch";
import { generateGovernmentQuantQuestions } from "./generators/government-quant";
import { generateGovernmentReasoningQuestions } from "./generators/government-reasoning";
import { generateGovernmentEnglishQuestions } from "./generators/government-english";
import { generateGovernmentGKQuestions } from "./generators/government-gk";
import { generateVerifiedPYQQuestions } from "./generators/pyq-questions";
import { generateTechnicalCSQuestions } from "./generators/technical-cs";
import { generatePlacementInterviewQuestions } from "./generators/placement-interview";

const prisma = new PrismaClient();

async function main() {
  console.log("=================================================");
  console.log("CAREER CRACK 🌱 — 5,000+ QUESTION BANK COMPILER");
  console.log("=================================================\n");

  const startCount = await prisma.question.count();
  console.log(`Current questions in database before import: ${startCount}`);

  console.log("\n1. Compiling question datasets...");
  const quantQuestions = generateGovernmentQuantQuestions();
  console.log(`   ✓ Government Quant generated: ${quantQuestions.length}`);

  const reasoningQuestions = generateGovernmentReasoningQuestions();
  console.log(`   ✓ Government Reasoning generated: ${reasoningQuestions.length}`);

  const englishQuestions = generateGovernmentEnglishQuestions();
  console.log(`   ✓ Government English generated: ${englishQuestions.length}`);

  const gkQuestions = generateGovernmentGKQuestions();
  console.log(`   ✓ Government General Awareness generated: ${gkQuestions.length}`);

  const pyqQuestions = generateVerifiedPYQQuestions();
  console.log(`   ✓ Authentic Verified PYQs generated: ${pyqQuestions.length}`);

  const techQuestions = generateTechnicalCSQuestions();
  console.log(`   ✓ Technical Computer Science generated: ${techQuestions.length}`);

  const placementQuestions = generatePlacementInterviewQuestions();
  console.log(`   ✓ Placement & Interview generated: ${placementQuestions.length}`);

  const allGenerated = [
    ...quantQuestions,
    ...reasoningQuestions,
    ...englishQuestions,
    ...gkQuestions,
    ...pyqQuestions,
    ...techQuestions,
    ...placementQuestions,
  ];

  console.log(`\nTotal generated unique question candidates: ${allGenerated.length}`);

  console.log("\n2. Executing safe, transactional import pipeline...");
  const startTime = Date.now();
  const importResult = await importQuestionBatch(allGenerated, { chunkSize: 100, verbose: true });
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log("\n=================================================");
  console.log("BATCH INGESTION SUMMARY");
  console.log("=================================================");
  console.log(`Total Candidates Processed : ${importResult.totalReceived}`);
  console.log(`Total Valid Candidates     : ${importResult.totalValid}`);
  console.log(`Total Successfully Inserted: ${importResult.totalInserted}`);
  console.log(`Total Duplicate / Skipped  : ${importResult.totalSkipped}`);
  console.log(`Total Rejected / Errors    : ${importResult.totalRejected}`);
  console.log(`Time Elapsed               : ${durationSec}s`);

  if (importResult.errors.length > 0) {
    console.log(`\nFirst 5 errors encountered:`);
    for (const err of importResult.errors.slice(0, 5)) {
      console.log(`  - [Idx ${err.index}] ${err.question}: ${err.reason}`);
    }
  }

  const finalCount = await prisma.question.count();
  console.log(`\nFinal questions in database: ${finalCount}`);
  if (finalCount >= 5000) {
    console.log("\n🎉 TARGET ACHIEVED: 5,000+ ACTUAL QUESTIONS CONFIRMED IN DATABASE!");
  } else {
    console.log(`\n⚠️ Progress: ${finalCount} / 5,000 questions.`);
  }
  console.log("=================================================\n");
}

main()
  .catch((err) => {
    console.error("Master generation failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
