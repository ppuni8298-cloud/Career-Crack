"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  AlertTriangle,
  BookOpen,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface QuestionOptionData {
  id: string;
  optionKey: string;
  optionText: string;
  order: number;
  isCorrect: boolean;
}

export interface PYQMeta {
  exam: string;
  examYear: number;
  paper?: string | null;
  stage?: string | null;
  shift?: string | null;
  questionNumber?: number | null;
  sourceReference?: string | null;
  verificationStatus?: string;
  notes?: string | null;
}

export interface QuestionData {
  id: string;
  questionText: string;
  questionType: string;
  sourceType: string; // "PRACTICE" | "PYQ" | "AI_CHALLENGE"
  difficulty: string; // "EASY" | "MEDIUM" | "HARD"
  explanation?: string | null;
  shortcut?: string | null;
  commonMistake?: string | null;
  concept?: string | null;
  expectedTimeSeconds?: number;
  marks?: number;
  negativeMarks?: number;
  verified: boolean;
  exam?: { id: string; name: string; slug: string } | null;
  subject?: { id: string; name: string; slug: string; icon?: string | null } | null;
  topic?: { id: string; name: string; slug: string } | null;
  options: QuestionOptionData[];
  pyqMetadata?: PYQMeta | null;
  tags?: Array<{ name: string; slug: string }>;
  isBookmarked?: boolean;
}

interface QuestionCardProps {
  question: QuestionData;
  onBookmarkToggled?: (questionId: string, newState: boolean) => void;
  isAuthenticated?: boolean;
}

export default function QuestionCard({
  question,
  onBookmarkToggled,
  isAuthenticated = true,
}: QuestionCardProps) {
  const [selectedOptionKey, setSelectedOptionKey] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(Boolean(question.isBookmarked));
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSelectOption = (key: string) => {
    if (selectedOptionKey !== null) return; // Answer locked once picked
    setSelectedOptionKey(key);
    setIsAnswerRevealed(true);
  };

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setBookmarkLoading(true);
    const newState = !isBookmarked;

    try {
      const res = await fetch(`/api/questions/${question.id}/bookmark`, {
        method: newState ? "POST" : "DELETE",
      });

      if (res.ok) {
        setIsBookmarked(newState);
        if (onBookmarkToggled) {
          onBookmarkToggled(question.id, newState);
        }
      } else if (res.status === 401) {
        setShowAuthModal(true);
      }
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const difficultyBadge = {
    EASY: "bg-emerald-50 text-emerald-700 border-emerald-200",
    MEDIUM: "bg-amber-50 text-amber-800 border-amber-200",
    HARD: "bg-rose-50 text-rose-700 border-rose-200",
  }[question.difficulty] || "bg-slate-50 text-slate-700 border-slate-200";

  const sourceBadge = {
    PYQ: "bg-indigo-50 text-indigo-700 border-indigo-200",
    PRACTICE: "bg-teal-50 text-teal-700 border-teal-200",
    AI_CHALLENGE: "bg-purple-50 text-purple-700 border-purple-200",
  }[question.sourceType] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <div
      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
      id={`question-card-${question.id}`}
    >
      {/* Top Header: Metadata Badges & Bookmark Action */}
      <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {/* Exam Tag */}
          {question.exam && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold border border-slate-200">
              {question.exam.name}
            </span>
          )}

          {/* Subject Tag */}
          {question.subject && (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              {question.subject.name}
            </span>
          )}

          {/* Topic Tag */}
          {question.topic && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200">
              {question.topic.name}
            </span>
          )}

          {/* Difficulty Badge */}
          <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${difficultyBadge}`}>
            {question.difficulty}
          </span>

          {/* Source Badge */}
          <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${sourceBadge}`}>
            {question.sourceType === "PYQ" && <Award className="w-3 h-3 text-indigo-600" />}
            <span>{question.sourceType}</span>
          </span>
        </div>

        {/* Bookmark Toggle Button */}
        <button
          onClick={handleToggleBookmark}
          disabled={bookmarkLoading}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark question"}
          title={isBookmarked ? "Remove from bookmarks" : "Save question for revision"}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
            isBookmarked
              ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
              : "bg-slate-50 text-slate-400 border-slate-200 hover:text-amber-600 hover:bg-amber-50/70 hover:border-amber-200"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
        </button>
      </div>

      {/* PYQ Verified Meta Header if present */}
      {question.sourceType === "PYQ" && question.pyqMetadata && (
        <div className="mb-4 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-wrap items-center justify-between text-xs text-indigo-900 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="font-extrabold tracking-wide">
              Official Previous Year Question:
            </span>
            <span>
              {question.pyqMetadata.exam} {question.pyqMetadata.examYear}
              {question.pyqMetadata.stage ? ` · ${question.pyqMetadata.stage}` : ""}
              {question.pyqMetadata.shift ? ` · ${question.pyqMetadata.shift}` : ""}
            </span>
          </div>
          {question.pyqMetadata.sourceReference && (
            <span className="text-[11px] font-medium text-indigo-700/80 bg-white/70 px-2 py-0.5 rounded-md border border-indigo-200/60">
              {question.pyqMetadata.sourceReference}
            </span>
          )}
        </div>
      )}

      {/* Question Text */}
      <div className="text-slate-900 font-bold text-base sm:text-lg leading-relaxed whitespace-pre-line mb-5">
        {question.questionText}
      </div>

      {/* Options List */}
      <div className="space-y-2.5 mb-5">
        {question.options.map((opt) => {
          const isSelected = selectedOptionKey === opt.optionKey;
          const isCorrect = opt.isCorrect;

          let optionStyle =
            "border-slate-200 hover:border-emerald-300 hover:bg-slate-50/80 text-slate-700";
          let keyBadgeStyle = "bg-slate-100 text-slate-700 border-slate-200";

          if (isAnswerRevealed) {
            if (isCorrect) {
              optionStyle = "border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold shadow-xs";
              keyBadgeStyle = "bg-emerald-600 text-white border-emerald-600";
            } else if (isSelected && !isCorrect) {
              optionStyle = "border-rose-300 bg-rose-50/80 text-rose-950 line-through opacity-80";
              keyBadgeStyle = "bg-rose-500 text-white border-rose-500";
            } else {
              optionStyle = "border-slate-200 text-slate-400 opacity-60 bg-white";
              keyBadgeStyle = "bg-slate-100 text-slate-400 border-slate-200";
            }
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt.optionKey)}
              disabled={isAnswerRevealed}
              className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left text-sm sm:text-base transition-all flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-xl border flex items-center justify-center font-extrabold text-xs shrink-0 transition-colors ${keyBadgeStyle}`}
                >
                  {opt.optionKey}
                </span>
                <span className="leading-snug">{opt.optionText}</span>
              </div>

              {isAnswerRevealed && (
                <div className="shrink-0 pl-2">
                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Answer & Explanation Toggle Panel */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors py-1 cursor-pointer"
          >
            <span>{isAnswerRevealed ? "Hide Explanation" : "View Answer & Explanation"}</span>
            {isAnswerRevealed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            {question.expectedTimeSeconds && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{question.expectedTimeSeconds}s</span>
              </span>
            )}
            {question.marks !== undefined && (
              <span className="font-semibold text-emerald-700">
                +{question.marks} / -{question.negativeMarks} marks
              </span>
            )}
          </div>
        </div>

        {/* Expanded Explanation Card */}
        {isAnswerRevealed && (
          <div className="mt-4 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-3.5 text-xs sm:text-sm animate-in fade-in duration-200">
            {/* Correct Answer Header */}
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Correct Option:{" "}
                <span className="underline decoration-emerald-500 underline-offset-2">
                  Option {question.options.find((o) => o.isCorrect)?.optionKey} (
                  {question.options.find((o) => o.isCorrect)?.optionText})
                </span>
              </span>
            </div>

            {/* Concept Tested */}
            {question.concept && (
              <div className="p-3 rounded-xl bg-white border border-emerald-100 text-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Concept Tested</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{question.concept}</p>
              </div>
            )}

            {/* Detailed Explanation */}
            {question.explanation && (
              <div className="text-slate-800 leading-relaxed whitespace-pre-line">
                <span className="font-bold block text-slate-900 mb-1">Detailed Solution:</span>
                {question.explanation}
              </div>
            )}

            {/* Shortcut Trick if available */}
            {question.shortcut && (
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>Exam Shortcut / Speed Trick</span>
                </div>
                <p className="text-amber-900 leading-relaxed font-medium">{question.shortcut}</p>
              </div>
            )}

            {/* Common Mistake warning if available */}
            {question.commonMistake && (
              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-950">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Common Trap to Avoid</span>
                </div>
                <p className="text-rose-900 leading-relaxed font-medium">{question.commonMistake}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auth Prompt Modal if unauthenticated user tries to bookmark */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-3">
              <Bookmark className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">Save to Bookmarks</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Create a free Career Crack account or log in to bookmark questions and review them anytime from your revision dashboard.
            </p>
            <div className="mt-5 space-y-2">
              <Link
                href="/login?redirect=/practice"
                className="block w-full py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Log In
              </Link>
              <button
                onClick={() => setShowAuthModal(false)}
                className="block w-full py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
