/**
 * Career Crack — Scalable Question Bank Ingestion Pipeline
 *
 * Prepared for future bulk imports of 5,000 to 50,000+ questions from JSON or CSV.
 * Validates question schema, ensures exam/subject/topic referential integrity,
 * maps options safely, and handles PYQ metadata & tagging with batch transactions.
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

export interface BulkQuestionInput {
  examSlug?: string;
  subjectSlug: string;
  topicSlug: string;
  questionText: string;
  questionType?: "MCQ_SINGLE" | "MCQ_MULTIPLE" | "TRUE_FALSE";
  sourceType: "PRACTICE" | "PYQ" | "AI_CHALLENGE";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  options: Array<{
    key: string; // e.g. "A", "B", "C", "D"
    text: string;
    isCorrect: boolean;
  }>;
  explanation?: string;
  shortcut?: string;
  commonMistake?: string;
  concept?: string;
  expectedTimeSeconds?: number;
  marks?: number;
  negativeMarks?: number;
  verificationStatus?: "UNVERIFIED" | "REVIEWED" | "VERIFIED";
  tags?: string[];
  pyqMetadata?: {
    exam: string;
    year: number;
    paper?: string;
    stage?: string;
    shift?: string;
    questionNumber?: number;
    sourceReference?: string;
    notes?: string;
  };
}

export interface IngestionResult {
  totalProcessed: number;
  totalInserted: number;
  totalSkipped: number;
  errors: Array<{ index: number; question: string; error: string }>;
}

export async function importQuestionsFromDataset(
  questions: BulkQuestionInput[]
): Promise<IngestionResult> {
  const result: IngestionResult = {
    totalProcessed: 0,
    totalInserted: 0,
    totalSkipped: 0,
    errors: [],
  };

  // Pre-fetch cache of subjects, exams, and tags to minimize round-trips
  const allSubjects = await prisma.subject.findMany({ select: { id: true, slug: true } });
  const subjectMap = new Map(allSubjects.map((s) => [s.slug, s.id]));

  const allExams = await prisma.exam.findMany({ select: { id: true, slug: true } });
  const examMap = new Map(allExams.map((e) => [e.slug, e.id]));

  const allTopics = await prisma.topic.findMany({
    select: { id: true, slug: true, subjectId: true },
  });
  const topicMap = new Map(allTopics.map((t) => [`${t.subjectId}:${t.slug}`, t.id]));

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    result.totalProcessed++;

    try {
      // 1. Validation
      if (!q.questionText || !q.options || q.options.length < 2) {
        throw new Error("Question text and at least 2 options are required.");
      }

      const hasCorrect = q.options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        throw new Error("Question must contain at least one correct option.");
      }

      const subjectId = subjectMap.get(q.subjectSlug);
      if (!subjectId) {
        throw new Error(`Subject slug '${q.subjectSlug}' not found.`);
      }

      const topicId = topicMap.get(`${subjectId}:${q.topicSlug}`);
      if (!topicId) {
        throw new Error(`Topic '${q.topicSlug}' not found under subject '${q.subjectSlug}'.`);
      }

      const examId = q.examSlug ? examMap.get(q.examSlug) || null : null;

      // 2. Check for duplicate question text in same topic
      const existing = await prisma.question.findFirst({
        where: {
          topicId,
          questionText: q.questionText,
        },
      });

      if (existing) {
        result.totalSkipped++;
        continue;
      }

      // 3. Database transaction
      await prisma.$transaction(async (tx) => {
        const createdQ = await tx.question.create({
          data: {
            examId,
            subjectId,
            topicId,
            questionText: q.questionText,
            questionType: q.questionType || "MCQ_SINGLE",
            sourceType: q.sourceType || "PRACTICE",
            difficulty: q.difficulty || "MEDIUM",
            explanation: q.explanation || null,
            shortcut: q.shortcut || null,
            commonMistake: q.commonMistake || null,
            concept: q.concept || null,
            expectedTimeSeconds: q.expectedTimeSeconds || 60,
            marks: q.marks ?? 1.0,
            negativeMarks: q.negativeMarks ?? 0.25,
            verificationStatus: q.verificationStatus || (q.sourceType === "PYQ" ? "VERIFIED" : "REVIEWED"),
            verified: q.verificationStatus === "VERIFIED" || q.sourceType === "PYQ",
            options: {
              create: q.options.map((opt, idx) => ({
                optionKey: opt.key,
                optionText: opt.text,
                isCorrect: opt.isCorrect,
                order: idx,
              })),
            },
          },
        });

        // PYQ Metadata if applicable
        if (q.sourceType === "PYQ" && q.pyqMetadata) {
          await tx.pYQMetadata.create({
            data: {
              questionId: createdQ.id,
              exam: q.pyqMetadata.exam,
              examYear: q.pyqMetadata.year,
              paper: q.pyqMetadata.paper,
              stage: q.pyqMetadata.stage,
              shift: q.pyqMetadata.shift,
              questionNumber: q.pyqMetadata.questionNumber,
              sourceReference: q.pyqMetadata.sourceReference,
              notes: q.pyqMetadata.notes,
            },
          });
        }

        // Tags
        if (q.tags && q.tags.length > 0) {
          for (const tagSlug of q.tags) {
            let tag = await tx.tag.findUnique({ where: { slug: tagSlug } });
            if (!tag) {
              tag = await tx.tag.create({
                data: {
                  name: tagSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
                  slug: tagSlug,
                },
              });
            }

            await tx.questionTag.create({
              data: {
                questionId: createdQ.id,
                tagId: tag.id,
              },
            });
          }
        }
      });

      result.totalInserted++;
    } catch (err: any) {
      result.errors.push({
        index: i,
        question: q.questionText?.substring(0, 50) || "Unknown",
        error: err.message,
      });
    }
  }

  return result;
}

// CLI entry point if run directly
async function run() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.log("Usage: node --experimental-strip-types scripts/import-questions.ts <path-to-json>");
    process.exit(0);
  }

  const resolvedPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(resolvedPath, "utf-8");
  const dataset: BulkQuestionInput[] = JSON.parse(content);

  console.log(`Starting import of ${dataset.length} questions from ${filePath}...`);
  const result = await importQuestionsFromDataset(dataset);

  console.log("=== INGESTION SUMMARY ===");
  console.log(`Total processed: ${result.totalProcessed}`);
  console.log(`Total inserted:  ${result.totalInserted}`);
  console.log(`Total skipped:   ${result.totalSkipped}`);
  console.log(`Errors:          ${result.errors.length}`);
  if (result.errors.length > 0) {
    console.log("Error details:", result.errors.slice(0, 5));
  }
}

if (process.argv[1]?.includes("import-questions.ts")) {
  run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
