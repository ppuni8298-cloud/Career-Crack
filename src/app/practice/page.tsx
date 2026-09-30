"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import QuestionCard, { QuestionData } from "@/components/practice/QuestionCard";
import QuestionFilterSheet, { FilterState } from "@/components/practice/QuestionFilterSheet";
import PracticeSetupModal from "@/components/practice/PracticeSetupModal";
import {
  Search,
  Filter,
  Layers,
  Sparkles,
  BookOpen,
  Award,
  Bookmark,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Flame,
  Play,
} from "lucide-react";

function PracticeContent() {
  const searchParams = useSearchParams();

  // Initial filter state from URL or defaults
  const initialExam = searchParams.get("exam") || "ALL";
  const initialSubject = searchParams.get("subject") || "ALL";
  const initialTopic = searchParams.get("topic") || "ALL";
  const initialDiff = searchParams.get("difficulty") || "ALL";
  const initialSource = searchParams.get("sourceType") || "ALL";

  const [filters, setFilters] = useState<FilterState>({
    exam: initialExam,
    subject: initialSubject,
    topic: initialTopic,
    difficulty: initialDiff,
    sourceType: initialSource,
    bookmarked: false,
    search: "",
  });

  const [quickFilter, setQuickFilter] = useState<string>("ALL");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  // Check auth session
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch questions whenever filters or page changes
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.exam && filters.exam !== "ALL") params.set("exam", filters.exam);
      if (filters.subject && filters.subject !== "ALL") params.set("subject", filters.subject);
      if (filters.topic && filters.topic !== "ALL") params.set("topic", filters.topic);
      if (filters.difficulty && filters.difficulty !== "ALL") params.set("difficulty", filters.difficulty);
      if (filters.sourceType && filters.sourceType !== "ALL") params.set("sourceType", filters.sourceType);
      if (filters.bookmarked) params.set("bookmarked", "true");
      if (filters.search && filters.search.trim() !== "") params.set("search", filters.search.trim());

      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());

      const res = await fetch(`/api/questions?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load questions");
      }

      const data = await res.json();
      setQuestions(data.questions || []);
      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages || 1,
        }));
      }
    } catch (err: any) {
      console.error("Error fetching questions:", err);
      setError(err.message || "Something went wrong while loading questions.");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleQuickFilterSelect = (type: string) => {
    setQuickFilter(type);
    setPagination((p) => ({ ...p, page: 1 }));

    switch (type) {
      case "ALL":
        setFilters((prev) => ({
          ...prev,
          difficulty: "ALL",
          sourceType: "ALL",
          bookmarked: false,
        }));
        break;
      case "PRACTICE":
        setFilters((prev) => ({
          ...prev,
          sourceType: "PRACTICE",
          bookmarked: false,
        }));
        break;
      case "PYQ":
        setFilters((prev) => ({
          ...prev,
          sourceType: "PYQ",
          bookmarked: false,
        }));
        break;
      case "HARD":
        setFilters((prev) => ({
          ...prev,
          difficulty: "HARD",
          bookmarked: false,
        }));
        break;
      case "BOOKMARKS":
        setFilters((prev) => ({
          ...prev,
          bookmarked: true,
        }));
        break;
    }
  };

  const handleBookmarkToggled = (questionId: string, newState: boolean) => {
    // If we're filtering by bookmarked only and user unbookmarks, remove it from view
    if (filters.bookmarked && !newState) {
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    }
  };

  const activeFilterCount =
    (filters.exam !== "ALL" ? 1 : 0) +
    (filters.subject !== "ALL" ? 1 : 0) +
    (filters.topic !== "ALL" ? 1 : 0) +
    (filters.difficulty !== "ALL" ? 1 : 0) +
    (filters.sourceType !== "ALL" ? 1 : 0) +
    (filters.bookmarked ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBF9]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Interactive Question Bank</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Practice Questions
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium max-w-2xl">
                Sharpen your problem-solving speed with topic-wise drills, concept breakdowns, shortcuts, and verified Previous Year Questions.
              </p>
            </div>

            <button
              onClick={() => setSetupModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all cursor-pointer shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Interactive Drill</span>
            </button>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-200/80">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Quick Filter:
            </span>

            {[
              { id: "ALL", label: "All Questions", icon: Layers },
              { id: "PRACTICE", label: "Practice Drills", icon: BookOpen },
              { id: "PYQ", label: "Verified PYQs", icon: Award },
              { id: "HARD", label: "Difficult / High Stakes", icon: Flame },
              { id: "BOOKMARKS", label: "Saved for Later", icon: Bookmark },
            ].map((pill) => {
              const Icon = pill.icon;
              const isSelected = quickFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => handleQuickFilterSelect(pill.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-100" : "text-slate-400"}`} />
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Mobile Filter Bar */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions by concept, keyword, formula, or exam..."
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }));
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs transition-colors"
            />
          </div>

          {/* Mobile Filter Trigger Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold text-sm shadow-xs hover:border-emerald-300 cursor-pointer shrink-0"
          >
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Main 2-Column Layout */}
        <div className="flex items-start gap-8">
          {/* Desktop Filter Sidebar */}
          <QuestionFilterSheet
            filters={filters}
            onChange={(newFilters) => {
              setFilters(newFilters);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            isOpenMobile={mobileFilterOpen}
            onCloseMobile={() => setMobileFilterOpen(false)}
            isAuthenticated={isAuthenticated}
          />

          {/* Right Column: Question Bank Stream */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Real Stats Bar */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-2">
              <span>
                Showing {questions.length} of {pagination.total} Available Questions
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setFilters({
                      exam: "ALL",
                      subject: "ALL",
                      topic: "ALL",
                      difficulty: "ALL",
                      sourceType: "ALL",
                      bookmarked: false,
                      search: "",
                    });
                    setQuickFilter("ALL");
                  }}
                  className="text-emerald-700 hover:underline cursor-pointer"
                >
                  Clear all filters ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Loading Skeletons */}
            {loading && (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-3xl p-7 border border-slate-200/80 space-y-4"
                  >
                    <div className="flex gap-2">
                      <div className="h-5 w-20 bg-slate-200 rounded-md" />
                      <div className="h-5 w-24 bg-slate-200 rounded-md" />
                    </div>
                    <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
                    <div className="space-y-2 pt-2">
                      <div className="h-12 bg-slate-100 rounded-2xl" />
                      <div className="h-12 bg-slate-100 rounded-2xl" />
                      <div className="h-12 bg-slate-100 rounded-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error Message */}
            {!loading && error && (
              <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center">
                <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
                <h3 className="font-extrabold text-slate-900 text-base">Failed to Load Questions</h3>
                <p className="text-xs text-slate-600 mt-1">{error}</p>
                <button
                  onClick={fetchQuestions}
                  className="mt-4 px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && questions.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  🌱
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">No Questions Found</h3>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                  {filters.bookmarked
                    ? "You haven't bookmarked any questions matching these filters yet. Click the bookmark icon on questions to save them for revision."
                    : "No questions match the current combination of filters. Try changing or clearing your filters."}
                </p>
                <button
                  onClick={() => {
                    setFilters({
                      exam: "ALL",
                      subject: "ALL",
                      topic: "ALL",
                      difficulty: "ALL",
                      sourceType: "ALL",
                      bookmarked: false,
                      search: "",
                    });
                    setQuickFilter("ALL");
                  }}
                  className="mt-6 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Questions Stream */}
            {!loading && !error && questions.length > 0 && (
              <div className="space-y-6">
                {questions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    onBookmarkToggled={handleBookmarkToggled}
                    isAuthenticated={isAuthenticated}
                  />
                ))}

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <button
                      onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                      disabled={pagination.page <= 1}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <span className="text-xs font-bold text-slate-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setPagination((p) => ({
                          ...p,
                          page: Math.min(pagination.totalPages, p.page + 1),
                        }))
                      }
                      disabled={pagination.page >= pagination.totalPages}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Practice Setup Modal */}
        <PracticeSetupModal
          isOpen={setupModalOpen}
          onClose={() => setSetupModalOpen(false)}
          defaultExamId={filters.exam !== "ALL" ? filters.exam : undefined}
          defaultSubjectId={filters.subject !== "ALL" ? filters.subject : undefined}
          isAuthenticated={isAuthenticated}
        />
      </main>

      <Footer />
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFBF9]">
          <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
