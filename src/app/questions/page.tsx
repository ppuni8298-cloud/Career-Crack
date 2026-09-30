"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  Search,
  Filter,
  Bookmark,
  Sparkles,
  Layers,
  Award,
  ChevronRight,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Cpu,
  Zap,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

interface QuestionOption {
  id: string;
  optionKey: string;
  optionText: string;
  isCorrect: boolean;
}

interface QuestionItem {
  id: string;
  questionText: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  sourceType: "PRACTICE" | "VERIFIED_PYQ" | "AI_CHALLENGE";
  explanation?: string;
  shortcut?: string;
  commonMistake?: string;
  concept?: string;
  subject?: { id: string; name: string; slug: string };
  topic?: { id: string; name: string; slug: string };
  exam?: { id: string; name: string; slug: string };
  pyqMetadata?: { exam: string; examYear: number; shift?: string };
  options: QuestionOption[];
  isBookmarked: boolean;
}

function QuestionExplorerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get("subject") || "ALL");
  const [selectedDiff, setSelectedDiff] = useState(searchParams.get("difficulty") || "ALL");
  const [selectedSource, setSelectedSource] = useState(searchParams.get("sourceType") || "ALL");
  const [revealedExplanations, setRevealedExplanations] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Lookup data
  const [subjectsList, setSubjectsList] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  // Fetch subjects for filter dropdown
  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await fetch("/api/subjects");
        if (res.ok) {
          const data = await res.json();
          setSubjectsList(data.subjects || []);
        }
      } catch (e) {
        console.error("Failed to fetch subjects", e);
      }
    }
    loadSubjects();
  }, []);

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(search ? { search } : {}),
        ...(selectedSubject !== "ALL" ? { subject: selectedSubject } : {}),
        ...(selectedDiff !== "ALL" ? { difficulty: selectedDiff } : {}),
        ...(selectedSource !== "ALL" ? { sourceType: selectedSource } : {}),
      });

      const res = await fetch(`/api/questions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        setTotalCount(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);

        const bookmarked = new Set<string>();
        data.questions?.forEach((q: QuestionItem) => {
          if (q.isBookmarked) bookmarked.add(q.id);
        });
        setBookmarkedIds(bookmarked);
      }
    } catch (e) {
      console.error("Failed to load questions", e);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedSubject, selectedDiff, selectedSource]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const toggleBookmark = async (questionId: string) => {
    try {
      const isCurrently = bookmarkedIds.has(questionId);
      const method = isCurrently ? "DELETE" : "POST";
      const res = await fetch("/api/bookmarks", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });

      if (res.ok) {
        setBookmarkedIds((prev) => {
          const updated = new Set(prev);
          if (isCurrently) updated.delete(questionId);
          else updated.add(questionId);
          return updated;
        });
      }
    } catch (e) {
      console.error("Bookmark toggle error:", e);
    }
  };

  const toggleExplanation = (id: string) => {
    setRevealedExplanations((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) updated.delete(id);
      else updated.add(id);
      return updated;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 mb-8 overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" /> 5,000+ Question Content Intelligence
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Question Bank Explorer
              </h1>
              <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
                Explore thousands of verified PYQs, algorithmic practice drills, and topic-mapped placement questions with step-by-step solutions and speed shortcuts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/practice"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-950/50"
              >
                <Zap className="w-4 h-4" /> Start Custom Practice
              </Link>
              <Link
                href="/crack-mode"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:border-slate-700 font-semibold text-sm transition-all"
              >
                Adaptive Crack Mode
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 mb-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by keywords, formulas, concepts..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Subject Select */}
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Subjects</option>
                {subjectsList.map((s) => (
                  <option key={s.id} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Select */}
            <div>
              <select
                value={selectedDiff}
                onChange={(e) => {
                  setSelectedDiff(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            {/* Source Type Select */}
            <div>
              <select
                value={selectedSource}
                onChange={(e) => {
                  setSelectedSource(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Sources</option>
                <option value="PRACTICE">Practice Questions</option>
                <option value="VERIFIED_PYQ">Verified PYQs</option>
                <option value="AI_CHALLENGE">AI Challenges</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <span>Showing {totalCount.toLocaleString()} matched questions</span>
            <span className="font-medium text-emerald-400">Page {page} of {totalPages}</span>
          </div>
        </div>

        {/* Question Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-3" />
            <p className="text-sm font-medium">Filtering 5,000+ question repository...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
            <HelpCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No questions matched your query</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting filters or searching with broader terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {questions.map((q) => {
              const isExplRevealed = revealedExplanations.has(q.id);
              const isSaved = bookmarkedIds.has(q.id);

              return (
                <div
                  key={q.id}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/90 transition-all flex flex-col justify-between shadow-sm"
                >
                  <div>
                    {/* Badge Row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {q.sourceType === "VERIFIED_PYQ" ? (
                          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
                            <FileCheck2 className="w-3 h-3" />
                            VERIFIED PYQ
                          </span>
                        ) : q.sourceType === "AI_CHALLENGE" ? (
                          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <Cpu className="w-3 h-3" />
                            AI CHALLENGE
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            PRACTICE
                          </span>
                        )}

                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            q.difficulty === "HARD"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : q.difficulty === "MEDIUM"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleBookmark(q.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isSaved
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                        title={isSaved ? "Remove bookmark" : "Save question"}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    {/* Meta info */}
                    <div className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-300">{q.subject?.name}</span>
                      <span>•</span>
                      <span>{q.topic?.name}</span>
                    </div>

                    {q.pyqMetadata && (
                      <div className="text-xs text-sky-400/90 font-medium mb-3">
                        {q.pyqMetadata.exam} ({q.pyqMetadata.examYear}) {q.pyqMetadata.shift && `• ${q.pyqMetadata.shift}`}
                      </div>
                    )}

                    {/* Question Text */}
                    <h3 className="text-sm sm:text-base font-semibold text-slate-100 mb-4 leading-snug">
                      {q.questionText}
                    </h3>

                    {/* Options list */}
                    <div className="space-y-2 mb-4">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
                            isExplRevealed && opt.isCorrect
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                              : "bg-slate-950/60 border-slate-800/80 text-slate-300"
                          }`}
                        >
                          <span>
                            <strong className="mr-1.5 text-slate-400">{opt.optionKey}.</strong>
                            {opt.optionText}
                          </span>
                          {isExplRevealed && opt.isCorrect && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Explanation toggle box */}
                    {isExplRevealed && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 mb-4">
                        {q.explanation && (
                          <div>
                            <span className="font-semibold text-emerald-400 block mb-1">Detailed Solution:</span>
                            <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                        {q.shortcut && (
                          <div className="pt-2 border-t border-slate-800/80 flex items-start gap-1.5 text-amber-300">
                            <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span><strong>Shortcut:</strong> {q.shortcut}</span>
                          </div>
                        )}
                        {q.commonMistake && (
                          <div className="pt-2 border-t border-slate-800/80 flex items-start gap-1.5 text-rose-300">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span><strong>Common Trap:</strong> {q.commonMistake}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/70 text-xs">
                    <button
                      onClick={() => toggleExplanation(q.id)}
                      className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      {isExplRevealed ? "Hide Solution" : "View Solution & Shortcut"}
                    </button>

                    <Link
                      href={`/practice?topic=${q.topic?.slug || ""}`}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 font-medium"
                    >
                      Practice Topic <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 border border-slate-800 p-4 text-xs text-slate-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-700 text-slate-200 font-medium"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-700 text-slate-200 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function QuestionExplorerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Question Bank...</div>}>
      <QuestionExplorerContent />
    </Suspense>
  );
}
