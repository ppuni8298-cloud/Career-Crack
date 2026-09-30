/**
 * Career Crack — Phase 9 Safe Question Batch Ingestion Pipeline
 * 
 * Guarantees schema validation, answer validation, deterministic content hashing,
 * duplicate rejection, and atomic transaction inserts.
 */

import { PrismaClient } from "@prisma/client";
import { validateQuestion } from "./validate-question-bank";
import type { QuestionValidationInput } from "./validate-question-bank";

const prisma = new PrismaClient();

export interface BatchImportResult {
  totalReceived: number;
  totalValid: number;
  totalInserted: number;
  totalSkipped: number;
  totalRejected: number;
  errors: Array<{ index: number; question: string; reason: string }>;
}

export async function importQuestionBatch(
  batch: QuestionValidationInput[],
  options: { chunkSize?: number; verbose?: boolean } = {}
): Promise<BatchImportResult> {
  const chunkSize = options.chunkSize || 50;
  const verbose = options.verbose ?? true;

  const result: BatchImportResult = {
    totalReceived: batch.length,
    totalValid: 0,
    totalInserted: 0,
    totalSkipped: 0,
    totalRejected: 0,
    errors: [],
  };

  if (batch.length === 0) return result;

  // 1. Preload lookup caches
  const [subjects, topics, exams, existingHashes] = await Promise.all([
    prisma.subject.findMany({ select: { id: true, slug: true } }),
    prisma.topic.findMany({ select: { id: true, slug: true, subjectId: true } }),
    prisma.exam.findMany({ select: { id: true, slug: true } }),
    prisma.question.findMany({
      where: { contentHash: { not: null } },
      select: { contentHash: true },
    }),
  ]);

  const subjectMap = new Map(subjects.map((s) => [s.slug, s.id]));
  const topicMap = new Map(topics.map((t) => [`${t.subjectId}:${t.slug}`, t.id]));
  const examMap = new Map(exams.map((e) => [e.slug, e.id]));
  const knownHashes = new Set(existingHashes.map((h) => h.contentHash!));

  // 2. Validate and deduplicate in memory
  const validItems: Array<{
    input: QuestionValidationInput;
    contentHash: string;
    subjectId: string;
    topicId: string;
    examId?: string;
  }> = [];

  for (let i = 0; i < batch.length; i++) {
    const q = batch[i];
    const val = validateQuestion(q);

    if (!val.isValid) {
      result.totalRejected++;
      result.errors.push({
        index: i,
        question: q.questionText?.substring(0, 60) || "[Missing Text]",
        reason: val.issues.map((iss) => iss.message).join("; "),
      });
      continue;
    }

    const subjectId = subjectMap.get(q.subjectSlug);
    if (!subjectId) {
      result.totalRejected++;
      result.errors.push({
        index: i,
        question: q.questionText.substring(0, 60),
        reason: `Subject slug '${q.subjectSlug}' not found in database.`,
      });
      continue;
    }

    const topicId = topicMap.get(`${subjectId}:${q.topicSlug}`);
    if (!topicId) {
      result.totalRejected++;
      result.errors.push({
        index: i,
        question: q.questionText.substring(0, 60),
        reason: `Topic '${q.topicSlug}' not found under subject '${q.subjectSlug}'.`,
      });
      continue;
    }

    const examId = q.examSlug ? examMap.get(q.examSlug) : undefined;

    // Check duplicate via contentHash
    if (knownHashes.has(val.contentHash)) {
      result.totalSkipped++;
      continue;
    }

    knownHashes.add(val.contentHash);
    result.totalValid++;
    validItems.push({
      input: q,
      contentHash: val.contentHash,
      subjectId,
      topicId,
      examId,
    });
  }

  // 3. Process database inserts in chunked transactions
  for (let i = 0; i < validItems.length; i += chunkSize) {
    const chunk = validItems.slice(i, i + chunkSize);

    try {
      await prisma.$transaction(async (tx) => {
        for (const item of chunk) {
          const { input: q, contentHash, subjectId, topicId, examId } = item;

          const created = await tx.question.create({
            data: {
              questionText: q.questionText.trim(),
              questionType: "MCQ_SINGLE",
              sourceType: q.sourceType,
              difficulty: q.difficulty.toUpperCase(),
              explanation: q.explanation?.trim() || null,
              shortcut: q.shortcut?.trim() || null,
              commonMistake: q.commonMistake?.trim() || null,
              concept: q.concept?.trim() || null,
              expectedTimeSeconds: q.expectedTimeSeconds || 60,
              marks: q.marks ?? 1.0,
              negativeMarks: q.negativeMarks ?? 0.25,
              active: true,
              verified: q.sourceType === "VERIFIED_PYQ" || q.sourceType === "PYQ",
              verificationStatus:
                q.sourceType === "VERIFIED_PYQ" || q.sourceType === "PYQ"
                  ? "VERIFIED"
                  : "UNVERIFIED",
              contentHash,
              subjectId,
              topicId,
              examId: examId || null,
              options: {
                create: q.options.map((opt, idx) => ({
                  optionKey: opt.key || String.fromCharCode(65 + idx),
                  optionText: opt.text.trim(),
                  order: idx,
                  isCorrect: opt.isCorrect,
                })),
              },
            },
          });

          if (
            (q.sourceType === "VERIFIED_PYQ" || q.sourceType === "PYQ") &&
            q.pyqMetadata
          ) {
            await tx.pYQMetadata.create({
              data: {
                questionId: created.id,
                exam: q.pyqMetadata.exam,
                examYear: q.pyqMetadata.year,
                paper: q.pyqMetadata.paper || null,
                stage: q.pyqMetadata.stage || null,
                shift: q.pyqMetadata.shift || null,
                questionNumber: q.pyqMetadata.questionNumber || null,
                sourceReference: q.pyqMetadata.sourceReference || "Official Exam Paper",
                verificationStatus: q.pyqMetadata.verificationStatus || "VERIFIED",
              },
            });
          }

          result.totalInserted++;
        }
      });
    } catch (err: any) {
      if (verbose) {
        console.error(`Transaction failed for chunk ${i} - ${i + chunk.length}:`, err.message);
      }
      result.totalRejected += chunk.length;
      result.errors.push({
        index: i,
        question: `Chunk starting at ${i}`,
        reason: `Database transaction error: ${err.message}`,
      });
    }
  }

  return result;
}

export { prisma };
