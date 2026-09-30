"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  Clock,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  Layers,
  ChevronRight,
  ShieldAlert,
  Flame,
  BarChart3,
  BookOpen,
} from "lucide-react";

interface SectionInfo {
  id: string;
  title: string;
  questionCount: number;
  marksPerQuestion: number;
  negativeMarks: number;
  subject?: {
    id: string;
    name: string;
    icon?: string;
  };
}

interface MockTest {
  id: string;
  title: string;
  slug: string;
  description: string;
  mockType: string;
  difficulty: string;
  totalQuestions: number;
  durationSeconds: number;
  durationMinutes: number;
  totalMarks: number;
  passingMarks?: number;
  negativeMarks: number;
  navigationRule: string;
  isOfficialPattern: boolean;
  disclaimer?: string;
  exam: {
    id: string;
    name: string;
    slug: string;
    category: string;
    organization?: string;
    logo?: string;
    state?: string;
  };
  sections: SectionInfo[];
  userStats?: {
    totalAttempts: number;
    bestScore: number | null;
    latestScore: number | null;
    latestAccuracy: number | null;
    hasActiveAttempt: boolean;
    activeAttemptId: string | null;
  } | null;
}

export default function MockTestsCatalogPage() {
  const router = useRouter();
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [startingTestId, setStartingTestId] = useState<string | null>(null);

  useEffect(() => {
    fetchMockTests();
  }, [selectedCategory]);

  const fetchMockTests = async () => {
    try {
      setLoading(true);
      let url = `/api/mock-tests?`;
      if (selectedCategory !== "ALL") {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMockTests(data.mockTests || []);
      }
    } catch (err) {
      console.error("Failed to load mock tests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAttempt = async (testId: string, slug: string) => {
    try {
      setStartingTestId(testId);
      const res = await fetch(`/api/mock-tests/${testId}/attempts`, {
        method: "POST",
      });

      if (res.status === 401) {
        router.push(`/login?redirect=/mock-tests/${slug}`);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        router.push(`/mock-tests/live/${data.attemptId}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to initialize test attempt.");
      }
    } catch (err) {
      console.error("Start attempt error:", err);
      alert("Network error starting mock test. Please try again.");
    } finally {
      setStartingTestId(null);
    }
  };

  // Find if there is any active in-progress attempt across all tests
  const activeTest = mockTests.find((t) => t.userStats?.hasActiveAttempt);

  const filteredTests = mockTests.filter((test) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      test.title.toLowerCase().includes(q) ||
      test.exam.name.toLowerCase().includes(q) ||
      test.description.toLowerCase().includes(q) ||
      test.sections.some((s) => s.title.toLowerCase().includes(q))
    );
  });

  const categories = [
    { key: "ALL", label: "All Tests" },
    { key: "GOVERNMENT", label: "Central Govt (SSC/UPSC/IBPS)" },
    { key: "STATE_GOVERNMENT", label: "State Govt (KPSC KAS)" },
    { key: "PLACEMENT", label: "Campus & Tech Placement" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-24 pt-20">
      {/* Top Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#05966908_1px,transparent_1px),linear-gradient(to_bottom,#05966908_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Exam Simulation Engine • Phase 5
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                Full-Length <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Mock Tests</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Experience high-stakes test day conditions. Authentic sectional timing, negative marking, official TCS iON style question palettes, and instantaneous Mistake Vault synchronization.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <div className="p-3 rounded-xl bg-white/5 text-center">
                <div className="text-2xl font-black text-emerald-400">4</div>
                <div className="text-xs text-slate-300 mt-0.5">Live Mocks</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 text-center">
                <div className="text-2xl font-black text-teal-400">65+</div>
                <div className="text-xs text-slate-300 mt-0.5">Exam PYQ Questions</div>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-white/5 text-center">
                <div className="text-2xl font-black text-amber-400">100%</div>
                <div className="text-xs text-slate-300 mt-0.5">Exact Marking Schemes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Active Attempt Notification Banner */}
        {activeTest && activeTest.userStats?.activeAttemptId && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm shadow-sm animate-pulse">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2">
                  <span>In-Progress Exam Detected!</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                    Live Session
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-amber-800">
                  You have an active timer running for <strong>{activeTest.title}</strong>. Resume now before time runs out!
                </p>
              </div>
            </div>

            <Link
              href={`/mock-tests/live/${activeTest.userStats.activeAttemptId}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-md shadow-amber-600/30 transition-all hover:scale-[1.02] shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              Resume Exam
            </Link>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === cat.key
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px] sm:min-w-[320px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by exam, section or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm animate-pulse space-y-4"
              >
                <div className="h-6 bg-slate-200 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <div className="h-14 bg-slate-100 rounded-xl" />
                  <div className="h-14 bg-slate-100 rounded-xl" />
                  <div className="h-14 bg-slate-100 rounded-xl" />
                  <div className="h-14 bg-slate-100 rounded-xl" />
                </div>
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Mock Tests Found</h3>
            <p className="text-sm text-slate-500 mb-6">
              Try adjusting your search keywords or selecting a different category filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("ALL");
                setSearchQuery("");
              }}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTests.map((test) => {
              const hasPastAttempts =
                test.userStats && test.userStats.totalAttempts > 0;
              const isStarting = startingTestId === test.id;

              return (
                <div
                  key={test.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-emerald-300"
                >
                  {/* Top Bar with Badges */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg shadow-sm">
                          {test.exam.logo || "📝"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                              {test.exam.name}
                            </span>
                            {test.isOfficialPattern && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Official Pattern
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mt-1">
                            {test.title}
                          </h3>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          test.difficulty === "HARD"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : test.difficulty === "MEDIUM"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {test.difficulty}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {test.description}
                    </p>

                    {/* Test Spec Grid */}
                    <div className="grid grid-cols-4 gap-2 py-3 px-3 rounded-xl bg-slate-50 border border-slate-100 text-center mb-4">
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Questions</div>
                        <div className="text-sm sm:text-base font-extrabold text-slate-800">
                          {test.totalQuestions}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Duration</div>
                        <div className="text-sm sm:text-base font-extrabold text-slate-800">
                          {test.durationMinutes}m
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Total Marks</div>
                        <div className="text-sm sm:text-base font-extrabold text-slate-800">
                          {test.totalMarks}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Penalty</div>
                        <div className="text-sm sm:text-base font-extrabold text-rose-600">
                          -{test.negativeMarks}
                        </div>
                      </div>
                    </div>

                    {/* Section Chips */}
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> Sections Included ({test.sections.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {test.sections.map((s) => (
                          <span
                            key={s.id}
                            className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium shadow-2xs"
                          >
                            {s.title} ({s.questionCount}Q)
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Past Attempt Stats if available */}
                    {hasPastAttempts && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-emerald-600" />
                          <span>
                            Best Score:{" "}
                            <strong className="text-emerald-700">
                              {test.userStats?.bestScore} / {test.totalMarks}
                            </strong>
                          </span>
                        </div>
                        <span className="text-slate-400">
                          Attempts: {test.userStats?.totalAttempts}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                      href={`/mock-tests/${test.slug}`}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-white hover:border-slate-300 transition-colors inline-flex items-center gap-1.5"
                    >
                      <BookOpen className="w-4 h-4 text-slate-500" />
                      View Pattern & Rules
                    </Link>

                    {test.userStats?.hasActiveAttempt ? (
                      <Link
                        href={`/mock-tests/live/${test.userStats.activeAttemptId}`}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:scale-[1.02] inline-flex items-center gap-1.5"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        Resume Test
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleStartAttempt(test.id, test.slug)}
                        disabled={isStarting}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02] inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isStarting ? (
                          <>Preparing Environment...</>
                        ) : hasPastAttempts ? (
                          <>
                            <RotateCcw className="w-4 h-4" /> Retake Simulation
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-white" /> Start Mock Test
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Feature Highlights Banner */}
        <div className="mt-16 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Standardized Protocol
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              How the Career Crack Mock Engine Replicates Real Test Day
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Designed according to TCS iON, NTA, and State Commission guidelines to ensure zero surprises on actual examination morning.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold mb-3 shadow-sm">
                ⏱
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Server-Synced Clock</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Persistent countdown timer unaffected by page refreshes. Automatic submission upon timer expiry.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-100">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold mb-3 shadow-sm">
                🎯
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Official Question Palette</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full 5-color status states: Answered, Not Answered, Not Visited, Marked for Review, and Review + Answered.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold mb-3 shadow-sm">
                🛡
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Anti-Cheat Safeguards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Active tab-switch detection, fullscreen recommendation, and zero answer leakage before final submission.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold mb-3 shadow-sm">
                💡
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Mistake Vault Auto-Sync</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Wrong questions automatically enter your personal Mistake Vault for spaced-repetition revision and correction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
