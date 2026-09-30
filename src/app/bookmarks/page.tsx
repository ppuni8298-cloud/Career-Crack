"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  Bookmark,
  BookmarkCheck,
  Search,
  Filter,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Compass,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Layers,
  Zap,
} from "lucide-react";

interface QuestionOption {
  id: string;
  optionKey: string;
  optionText: string;
  order: number;
  isCorrect: boolean;
}

interface BookmarkedQuestion {
  id: string;
  questionText: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  sourceType: string;
  explanation: string | null;
  shortcut: string | null;
  commonMistake: string | null;
  concept: string | null;
  exam: { id: string; name: string; slug: string } | null;
  subject: { id: string; name: string; slug: string; icon: string | null };
  topic: { id: string; name: string; slug: string };
  options: QuestionOption[];
  pyqMetadata: { examYear: number; shift: string | null } | null;
  tags: Array<{ name: string; slug: string }>;
  bookmarkedAt: string;
}

export default function BookmarksPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<BookmarkedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [startingPractice, setStartingPractice] = useState(false);

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/bookmarks?limit=50");
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login?redirect=/bookmarks";
          return;
        }
        throw new Error("Failed to load bookmarks");
      }
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err: any) {
      console.error("Error loading bookmarks:", err);
      setError(err.message || "Could not load bookmarked questions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const toggleExplanation = (id: string) => {
    setExpandedExplanations((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRemoveBookmark = async (id: string) => {
    try {
      setRemovingId(id);
      const res = await fetch(`/api/questions/${id}/bookmark`, { method: "DELETE" });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        setToastMessage("Bookmark removed.");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch {
      setToastMessage("Failed to remove bookmark.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleStartDrill = async () => {
    try {
      setStartingPractice(true);
      // Create a practice drill using subject or default
      const res = await fetch("/api/practice/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty: "MIXED",
          sourceType: "ALL",
          questionCount: Math.min(10, Math.max(5, questions.length)),
          enableTimer: true,
          mode: "LEARNING",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const sessionId = data.sessionId || data.session?.id;
        router.push(`/practice/session/${sessionId}`);
      } else {
        router.push("/practice");
      }
    } catch {
      router.push("/practice");
    } finally {
      setStartingPractice(false);
    }
  };

  // Distinct subjects for filter
  const subjects = Array.from(new Set(questions.map((q) => q.subject?.name).filter(Boolean)));

  // Filtered list
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.concept && q.concept.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.topic?.name && q.topic.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject = selectedSubject === "ALL" || q.subject?.name === selectedSubject;
    const matchesDifficulty = selectedDifficulty === "ALL" || q.difficulty === selectedDifficulty;

    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-[#FAFBF9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-sm flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Hero Header */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Personal Saved Vault</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bookmarked Questions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Curated repository of challenging questions, tricky formulas, and key PYQs you have bookmarked during
              practice drills and mock tests.
            </p>
          </div>

          {questions.length > 0 && (
            <button
              onClick={handleStartDrill}
              disabled={startingPractice}
              id="practice-bookmarks-btn"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Zap className="w-4 h-4" />
              <span>{startingPractice ? "Launching Drill..." : "Practice Drill Now"}</span>
            </button>
          )}
        </section>

        {/* Filter & Search Bar */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in questions, topics, or concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="bookmark-search-input"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              id="bookmark-subject-filter"
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">All Subjects ({questions.length})</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              id="bookmark-difficulty-filter"
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </section>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-white rounded-3xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
            <p className="text-sm text-rose-600 font-bold mb-2">Error loading bookmarks</p>
            <p className="text-xs text-slate-500 mb-4">{error}</p>
            <button
              onClick={fetchBookmarks}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : filteredQuestions.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4">
              📌
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {questions.length === 0 ? "No bookmarked questions yet" : "No matching bookmarks"}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              {questions.length === 0
                ? "Whenever you encounter a tricky question during practice drills or mock tests, click the bookmark icon to save it here for targeted revision."
                : "Try adjusting your search query or subject filters to find your saved questions."}
            </p>
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm shadow-emerald-600/20"
            >
              <span>Explore Practice Bank</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          /* Question Cards List */
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
              const isExpanded = !!expandedExplanations[q.id];
              const diffBadgeColor =
                q.difficulty === "HARD"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : q.difficulty === "MEDIUM"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200";

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Badges and Actions Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                        {q.subject?.name}
                      </span>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/60">
                        {q.topic?.name}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${diffBadgeColor}`}>
                        {q.difficulty}
                      </span>
                      {q.pyqMetadata && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          PYQ {q.pyqMetadata.examYear}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemoveBookmark(q.id)}
                        disabled={removingId === q.id}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Remove from saved bookmarks"
                        id={`remove-bookmark-${q.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                    <span className="text-slate-400 font-bold mr-2">Q{idx + 1}.</span>
                    {q.questionText}
                  </div>

                  {/* MCQ Options with Correct Indicator */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((opt) => {
                      const isCorrect = opt.isCorrect;
                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                            isCorrect
                              ? "bg-emerald-50/70 border-emerald-300 font-bold text-emerald-950"
                              : "bg-slate-50/60 border-slate-200 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isCorrect ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                              }`}
                            >
                              {opt.optionKey}
                            </span>
                            <span>{opt.optionText}</span>
                          </div>
                          {isCorrect && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-800" />
                              Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Concept & Tags */}
                  {(q.concept || q.tags.length > 0) && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                      {q.concept && (
                        <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          Concept: <strong>{q.concept}</strong>
                        </span>
                      )}
                      {q.tags.map((t) => (
                        <span
                          key={t.slug}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-500"
                        >
                          #{t.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Explanation Toggle Drawer */}
                  <div className="pt-2">
                    <button
                      onClick={() => toggleExplanation(q.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                    >
                      <span>{isExpanded ? "Hide detailed explanation" : "View explanation & tricks"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-3 text-xs text-slate-700 animate-in fade-in-50 duration-200">
                        {q.explanation && (
                          <div>
                            <strong className="block text-emerald-950 font-bold mb-1">Detailed Explanation:</strong>
                            <p className="leading-relaxed whitespace-pre-line">{q.explanation}</p>
                          </div>
                        )}
                        {q.shortcut && (
                          <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-amber-950 font-bold">Speed Shortcut:</strong>
                              <p className="text-amber-900 mt-0.5">{q.shortcut}</p>
                            </div>
                          </div>
                        )}
                        {q.commonMistake && (
                          <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200/80 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-rose-950 font-bold">Common Aspirant Trap:</strong>
                              <p className="text-rose-900 mt-0.5">{q.commonMistake}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
