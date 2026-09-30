/**
 * Career Crack — Phase 9 Question Bank Validation Pipeline
 * 
 * Programmatically validates questions for integrity, correctness,
 * options balance, explanation depth, and duplicate prevention.
 */

import * as crypto from "crypto";

export interface QuestionValidationInput {
  questionText: string;
  subjectSlug: string;
  topicSlug: string;
  examSlug?: string;
  difficulty: string;
  sourceType: string;
  options: Array<{
    key?: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation?: string;
  shortcut?: string;
  commonMistake?: string;
  concept?: string;
  marks?: number;
  negativeMarks?: number;
  expectedTimeSeconds?: number;
  pyqMetadata?: {
    exam: string;
    year: number;
    paper?: string;
    stage?: string;
    shift?: string;
    questionNumber?: number;
    sourceReference?: string;
    verificationStatus?: string;
  };
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "ERROR" | "WARNING";
}

export interface ValidationResult {
  isValid: boolean;
  contentHash: string;
  normalizedText: string;
  issues: ValidationIssue[];
}

export function normalizeQuestionText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function computeQuestionHash(
  normalizedText: string,
  options: Array<{ text: string; isCorrect: boolean }>,
  sourceType: string
): string {
  const sortedOptionTexts = [...options]
    .map((o) => normalizeQuestionText(o.text))
    .sort()
    .join("|");
  const payload = `${sourceType.toUpperCase()}:${normalizedText}:${sortedOptionTexts}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function validateQuestion(q: QuestionValidationInput): ValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. Question Text
  if (!q.questionText || typeof q.questionText !== "string" || q.questionText.trim().length === 0) {
    issues.push({ field: "questionText", message: "Question text is required and cannot be empty.", severity: "ERROR" });
  } else if (q.questionText.trim().length < 12) {
    issues.push({ field: "questionText", message: "Question text is excessively short (< 12 characters).", severity: "ERROR" });
  }

  // Placeholder check
  const placeholderRegex = /^(question\s*\d+|sample\s*question|demo\s*question|test\s*question|placeholder)/i;
  if (q.questionText && placeholderRegex.test(q.questionText.trim())) {
    issues.push({ field: "questionText", message: "Question appears to be a prohibited placeholder/demo string.", severity: "ERROR" });
  }

  // 2. Options Check
  if (!Array.isArray(q.options) || q.options.length < 2) {
    issues.push({ field: "options", message: "At least 2 options are required (standard 4).", severity: "ERROR" });
  } else {
    let correctCount = 0;
    const seenOptionTexts = new Set<string>();

    for (let i = 0; i < q.options.length; i++) {
      const opt = q.options[i];
      if (!opt.text || opt.text.trim().length === 0) {
        issues.push({ field: `options[${i}]`, message: "Option text cannot be empty.", severity: "ERROR" });
      } else {
        const normOpt = normalizeQuestionText(opt.text);
        if (seenOptionTexts.has(normOpt)) {
          issues.push({ field: `options[${i}]`, message: `Duplicate option text found: "${opt.text}".`, severity: "ERROR" });
        }
        seenOptionTexts.add(normOpt);
      }

      if (opt.isCorrect) {
        correctCount++;
      }
    }

    if (correctCount === 0) {
      issues.push({ field: "options", message: "Question has no correct option selected.", severity: "ERROR" });
    } else if (correctCount > 1) {
      issues.push({ field: "options", message: `Question has multiple correct options (${correctCount}) for single-choice MCQ.`, severity: "ERROR" });
    }
  }

  // 3. Explanation Check
  if (!q.explanation || q.explanation.trim().length === 0) {
    issues.push({ field: "explanation", message: "Explanation is required.", severity: "ERROR" });
  } else {
    const trimmedExp = q.explanation.trim();
    if (trimmedExp.length < 10) {
      issues.push({ field: "explanation", message: "Explanation is too brief (< 10 chars).", severity: "WARNING" });
    }
    const genericExpRegex = /^(option\s+[a-d]\s+is\s+correct\.?)$/i;
    if (genericExpRegex.test(trimmedExp)) {
      issues.push({ field: "explanation", message: "Generic explanation ('Option X is correct') is not permitted. Explain the reasoning.", severity: "ERROR" });
    }
  }

  // 4. Difficulty Check
  const validDifficulties = ["EASY", "MEDIUM", "HARD"];
  if (!q.difficulty || !validDifficulties.includes(q.difficulty.toUpperCase())) {
    issues.push({ field: "difficulty", message: `Invalid difficulty: ${q.difficulty}. Must be EASY, MEDIUM, or HARD.`, severity: "ERROR" });
  }

  // 5. Source Type Check
  const validSourceTypes = ["PRACTICE", "VERIFIED_PYQ", "PYQ", "AI_CHALLENGE", "PREVIOUS_YEAR"];
  if (!q.sourceType || !validSourceTypes.includes(q.sourceType.toUpperCase())) {
    issues.push({ field: "sourceType", message: `Invalid sourceType: ${q.sourceType}. Must be PRACTICE, VERIFIED_PYQ, or AI_CHALLENGE.`, severity: "ERROR" });
  }

  // 6. PYQ Metadata Check
  if (q.sourceType === "VERIFIED_PYQ" || q.sourceType === "PYQ") {
    if (!q.pyqMetadata) {
      issues.push({ field: "pyqMetadata", message: "Verified PYQ questions must have pyqMetadata.", severity: "ERROR" });
    } else {
      if (!q.pyqMetadata.exam || q.pyqMetadata.exam.trim().length === 0) {
        issues.push({ field: "pyqMetadata.exam", message: "PYQ exam name is required.", severity: "ERROR" });
      }
      if (!q.pyqMetadata.year || q.pyqMetadata.year < 1990 || q.pyqMetadata.year > 2026) {
        issues.push({ field: "pyqMetadata.year", message: `Invalid PYQ year: ${q.pyqMetadata.year}.`, severity: "ERROR" });
      }
    }
  }

  // 7. Subject & Topic Slugs
  if (!q.subjectSlug || q.subjectSlug.trim().length === 0) {
    issues.push({ field: "subjectSlug", message: "Subject slug is required.", severity: "ERROR" });
  }
  if (!q.topicSlug || q.topicSlug.trim().length === 0) {
    issues.push({ field: "topicSlug", message: "Topic slug is required.", severity: "ERROR" });
  }

  const normalizedText = normalizeQuestionText(q.questionText || "");
  const contentHash = computeQuestionHash(normalizedText, q.options || [], q.sourceType || "PRACTICE");
  const hasErrors = issues.some((i) => i.severity === "ERROR");

  return {
    isValid: !hasErrors,
    contentHash,
    normalizedText,
    issues,
  };
}
