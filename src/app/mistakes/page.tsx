"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import MistakePracticeModal from "@/components/mistakes/MistakePracticeModal";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
  Bookmark,
  Search,
  ChevronRight,
  ChevronLeft,
  Filter,
  Play,
  Lightbulb,
  Zap,
  Target,
  ArrowRight,
  Layers,
} from "lucide-react";

interface MistakeItem {
  id: string;
  questionId: string;
  selectedOptionKey: string | null;
  correctOptionKey: string;
  reviewStatus: "UNRESOLVED" | "REVIEWED" | "RESOLVED";
  timesIncorrect: number;
  lastAttemptedAt: string;
  resolvedAt: string | null;
  question: {
    id: string;
    questionText: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    marks: number;
    negativeMarks: number;
    explanation: string | null;
    concept: string | null;
    shortcut: string | null;
    commonMistake: string | null;
    exam?: { name: string; slug: string } | null;
    subject?: { name: string; slug: string } | null;
    topic?: { id: string; name: string; slug: string } | null;
    options: Array<{
      id: string;
      optionKey: string;
      optionText: string;
      isCorrect: boolean;
    }>;
    tags: string[];
    isBookmarked: boolean;
  };
}

interface MistakeStats {
  total: number;
  unresolved: number;
  reviewed: number;
  resolved: number;
}

function MistakesContent() {
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [stats, setStats] = useState<MistakeStats>({
    total: 0,
    unresolved: 0,
    reviewed: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Practice Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [bookmarkingId, setBookmarkingId] = useState<string | null>(null);

  const fetchMistakes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (difficultyFilter !== "ALL") params.set("difficulty", difficultyFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("page", page.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/mistakes?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load mistakes from vault");
      }

      const data = await res.json();
      setMistakes(data.mistakes || []);
      setStats(data.stats || { total: 0, unresolved: 0, reviewed: 0, resolved: 0 });
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error("Error fetching mistakes:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, difficultyFilter, searchQuery, page]);

  useEffect(() => {
    fetchMistakes();
  }, [fetchMistakes]);

  // Toggle review status
  const handleToggleStatus = async (mistakeId: string, currentStatus: string) => {
    if (updatingId) return;
    setUpdatingId(mistakeId);

    const nextStatus =
      currentStatus === "UNRESOLVED"
        ? "REVIEWED"
        : currentStatus === "REVIEWED"
        ? "RESOLVED"
        : "UNRESOLVED";

    try {
      const res = await fetch(`/api/mistakes/${mistakeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewStatus: nextStatus }),
      });

      if (res.ok) {
        setMistakes((prev) =>
          prev.map((m) => (m.id === mistakeId ? { ...m, reviewStatus: nextStatus as any } : m))
        );
        // Refresh counts
        setStats((prev) => {
          const delta = { ...prev };
          if (currentStatus === "UNRESOLVED") delta.unresolved--;
          if (currentStatus === "REVIEWED") delta.reviewed--;
          if (currentStatus === "RESOLVED") delta.resolved--;

          if (nextStatus === "UNRESOLVED") delta.unresolved++;
          if (nextStatus === "REVIEWED") delta.reviewed++;
          if (nextStatus === "RESOLVED") delta.resolved++;
          return delta;
        });
      }
    } catch (err) {
      console.error("Failed to update mistake status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Toggle bookmark
  const handleToggleBookmark = async (questionId: string, currentBookmarked: boolean) => {
    if (bookmarkingId) return;
    setBookmarkingId(questionId);

    try {
      const res = await fetch(`/api/questions/${questionId}/bookmark`, {
        method: currentBookmarked ? "DELETE" : "POST",
      });

      if (res.ok) {
        setMistakes((prev) =>
          prev.map((m) =>
            m.questionId === questionId
              ? { ...m, question: { ...m.question, isBookmarked: !currentBookmarked } }
              : m
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    } finally {
      setBookmarkingId(null);
    }
  };

  // Distinct topics for modal
  const topicMap: Record<string, { id: string; name: string; count: number }> = {};
  mistakes.forEach((m) => {
    if (m.question.topic) {
      const tid = m.question.topic.id;
      if (!topicMap[tid]) topicMap[tid] = { id: tid, name: m.question.topic.name, count: 0 };
      topicMap[tid].count++;
    }
  });
  const availableTopics = Object.values(topicMap);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBF9]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-emerald-700 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Mistake Vault</span>
        </nav>

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold uppercase tracking-wider mb-3">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Smart Revision Notebook</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Mistake Vault
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl font-medium leading-relaxed">
                Every incorrect attempt is preserved here. Review the verified rationale, identify trap patterns, and launch targeted drills until you master every question.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={stats.total === 0}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Practice My Mistakes</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Recorded
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">{stats.total}</span>
              <BookOpen className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-200 shadow-xs bg-rose-50/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Needs Review
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-rose-700">{stats.unresolved}</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-xs bg-amber-50/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              In Review
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-700">{stats.reviewed}</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-xs bg-emerald-50/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Resolved / Mastered
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-700">{stats.resolved}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "ALL", label: "All Mistakes", count: stats.total },
                { id: "UNRESOLVED", label: "Unresolved", count: stats.unresolved },
                { id: "REVIEWED", label: "Reviewed", count: stats.reviewed },
                { id: "RESOLVED", label: "Resolved", count: stats.resolved },
              ].map((tab) => {
                const isSelected = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStatusFilter(tab.id);
                      setPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Search & Difficulty Filter */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search mistakes by keyword..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={difficultyFilter}
                onChange={(e) => {
                  setDifficultyFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mistakes List Stream */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white rounded-3xl border border-slate-200/80" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
            <h3 className="font-extrabold text-slate-900 text-base">Failed to Load Mistakes</h3>
            <p className="text-xs text-slate-600 mt-1">{error}</p>
            <button
              onClick={fetchMistakes}
              className="mt-4 px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && mistakes.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              🎉
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Your Mistake Vault is Clear</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              {statusFilter !== "ALL"
                ? `No questions currently match the "${statusFilter}" status filter.`
                : "You have zero unresolved mistakes recorded! Keep challenging yourself with new practice sessions and PYQs."}
            </p>
            <Link
              href="/practice"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
            >
              <span>Explore Practice Bank</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {!loading && !error && mistakes.length > 0 && (
          <div className="space-y-6">
            {mistakes.map((m, idx) => {
              const q = m.question;
              const isUnresolved = m.reviewStatus === "UNRESOLVED";
              const isReviewed = m.reviewStatus === "REVIEWED";
              const isResolved = m.reviewStatus === "RESOLVED";

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5"
                >
                  {/* Card Header Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center text-xs font-black">
                        #{idx + 1 + (page - 1) * 10}
                      </span>

                      {/* Status Button Toggle */}
                      <button
                        onClick={() => handleToggleStatus(m.id, m.reviewStatus)}
                        disabled={updatingId === m.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          isUnresolved
                            ? "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                            : isReviewed
                            ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                        }`}
                        title="Click to advance review state"
                      >
                        {isUnresolved && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                        {isReviewed && <Sparkles className="w-3.5 h-3.5 text-amber-600" />}
                        {isResolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        <span>
                          {isUnresolved
                            ? "Unresolved (Click to Review)"
                            : isReviewed
                            ? "In Review (Click to Resolve)"
                            : "Resolved ✓"}
                        </span>
                      </button>

                      {/* Attempts pill */}
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        {m.timesIncorrect}x Incorrect
                      </span>

                      {q.topic && (
                        <span className="text-xs font-semibold text-slate-500">· {q.topic.name}</span>
                      )}
                    </div>

                    {/* Bookmark action */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleBookmark(q.id, q.isBookmarked)}
                        disabled={bookmarkingId === q.id}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          q.isBookmarked
                            ? "bg-amber-50 border-amber-200 text-amber-600"
                            : "bg-white border-slate-200 text-slate-400 hover:text-slate-700"
                        }`}
                        title={q.isBookmarked ? "Bookmarked" : "Bookmark for Revision"}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${q.isBookmarked ? "fill-amber-500 text-amber-500" : ""}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                    {q.questionText}
                  </div>

                  {/* Options Comparison */}
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const isUserChoice = m.selectedOptionKey === opt.optionKey;
                      const isCorrectOption = opt.isCorrect;

                      let style = "bg-white border-slate-200 text-slate-700";
                      let badge = null;

                      if (isCorrectOption) {
                        style = "bg-emerald-50/70 border-emerald-500 text-emerald-950 font-bold shadow-xs";
                        badge = (
                          <span className="text-[11px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Correct Option ✓
                          </span>
                        );
                      } else if (isUserChoice) {
                        style = "bg-rose-50/70 border-rose-500 text-rose-950 font-bold shadow-xs";
                        badge = (
                          <span className="text-[11px] font-black uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                            Your Previous Answer ✗
                          </span>
                        );
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${style}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                              {opt.optionKey}
                            </span>
                            <span className="text-xs sm:text-sm leading-relaxed">{opt.optionText}</span>
                          </div>

                          {badge && <div className="shrink-0">{badge}</div>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Verified Solution & Concept Analysis */}
                  <div className="pt-2 space-y-3">
                    {q.explanation && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                            Verified Explanation
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.concept && (
                        <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80">
                          <div className="flex items-center gap-1.5 text-teal-900 font-bold text-xs mb-1">
                            <Target className="w-3.5 h-3.5 text-teal-700" />
                            <span>Core Concept</span>
                          </div>
                          <p className="text-xs text-teal-950 leading-relaxed font-medium">
                            {q.concept}
                          </p>
                        </div>
                      )}

                      {q.shortcut && (
                        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-1">
                            <Zap className="w-3.5 h-3.5 text-amber-600" />
                            <span>Shortcut Trick</span>
                          </div>
                          <p className="text-xs text-amber-950 leading-relaxed font-medium">
                            {q.shortcut}
                          </p>
                        </div>
                      )}
                    </div>

                    {q.commonMistake && (
                      <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/70">
                        <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Pitfall / Trap to Avoid</span>
                        </div>
                        <p className="text-xs text-rose-950 leading-relaxed font-medium">
                          {q.commonMistake}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-xs font-bold text-slate-600">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mistake Practice Modal */}
        <MistakePracticeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          availableTopics={availableTopics}
          totalMistakes={stats.total}
          unresolvedCount={stats.unresolved}
        />
      </main>

      <Footer />
    </div>
  );
}

export default function MistakesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFBF9]">
          <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <MistakesContent />
    </Suspense>
  );
}
