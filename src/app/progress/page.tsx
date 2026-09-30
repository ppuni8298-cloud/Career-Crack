"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Target,
  ArrowRight,
  Search,
  BookOpen,
  HelpCircle,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";

interface TopicProgressItem {
  id: string;
  name: string;
  slug: string;
  subjectId: string;
  subjectName: string;
  subjectSlug: string;
  totalAvailableQuestions: number;
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  masteryStatus: "NOT_STARTED" | "PRACTICING" | "IMPROVING" | "STRONG";
  lastPracticedAt: string | null;
}

interface ProgressStats {
  totalTopics: number;
  strongCount: number;
  improvingCount: number;
  practicingCount: number;
  notStartedCount: number;
  masteryPercentage: number;
}

function ProgressContent() {
  const [topics, setTopics] = useState<TopicProgressItem[]>([]);
  const [stats, setStats] = useState<ProgressStats>({
    totalTopics: 0,
    strongCount: 0,
    improvingCount: 0,
    practicingCount: 0,
    notStartedCount: 0,
    masteryPercentage: 0,
  });
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchProgress = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedSubject !== "ALL") params.set("subject", selectedSubject);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/progress?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load progress data");

      const data = await res.json();
      setTopics(data.topics || []);
      setStats(
        data.stats || {
          totalTopics: 0,
          strongCount: 0,
          improvingCount: 0,
          practicingCount: 0,
          notStartedCount: 0,
          masteryPercentage: 0,
        }
      );
      if (data.subjects) setSubjects(data.subjects);
    } catch (err: any) {
      console.error("Error fetching progress:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedStatus, searchQuery]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "STRONG":
        return {
          label: "Strong",
          badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
          dotClass: "bg-emerald-500",
        };
      case "IMPROVING":
        return {
          label: "Improving",
          badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
          dotClass: "bg-teal-500",
        };
      case "PRACTICING":
        return {
          label: "Practicing",
          badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
          dotClass: "bg-amber-500",
        };
      default:
        return {
          label: "Not Started",
          badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
          dotClass: "bg-slate-400",
        };
    }
  };

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
          <span className="text-slate-900 font-bold">Topic Progress</span>
        </nav>

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>Syllabus Mastery Map</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Topic-wise Progress
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl font-medium leading-relaxed">
            Monitor questions attempted, real-time accuracy, and mastery indicators across every subject. Targeted topic drills help close conceptual gaps systematically.
          </p>

          {/* Transparent Disclaimer */}
          <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Mastery statuses reflect your recent performance on Career Crack practice questions and do not represent a guarantee of official exam outcomes.
            </span>
          </div>
        </div>

        {/* 4 Mastery Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-xs bg-emerald-50/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Strong Topics (≥80%)
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-700">{stats.strongCount}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-teal-200 shadow-xs bg-teal-50/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
              Improving (60-79%)
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-teal-700">{stats.improvingCount}</span>
              <TrendingUp className="w-4 h-4 text-teal-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-xs bg-amber-50/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Practicing (&lt;60%)
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-700">{stats.practicingCount}</span>
              <BarChart3 className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Not Started
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-800">{stats.notStartedCount}</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Subject Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedSubject("ALL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedSubject === "ALL"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                All Subjects
              </button>
              {subjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.slug)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedSubject === sub.slug
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>

            {/* Right: Status Dropdown & Search */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="STRONG">Strong</option>
                <option value="IMPROVING">Improving</option>
                <option value="PRACTICING">Practicing</option>
                <option value="NOT_STARTED">Not Started</option>
              </select>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-white rounded-3xl border border-slate-200/80" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
            <h3 className="font-extrabold text-slate-900 text-base">Failed to Load Progress</h3>
            <p className="text-xs text-slate-600 mt-1">{error}</p>
            <button
              onClick={fetchProgress}
              className="mt-4 px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && topics.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
            <h3 className="text-xl font-extrabold text-slate-900">No Topics Match Criteria</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Try adjusting your subject, status, or search filters.
            </p>
          </div>
        )}

        {!loading && !error && topics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topics.map((t) => {
              const statusInfo = getStatusBadge(t.masteryStatus);

              return (
                <div
                  key={t.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-all card-hover-lift"
                >
                  <div>
                    {/* Top Row: Subject & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                        {t.subjectName}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>

                    {/* Topic Name */}
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {t.name}
                    </h3>

                    {/* Accuracy Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-500">Accuracy</span>
                        <span className="text-slate-900">{t.accuracy}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            t.accuracy >= 80
                              ? "bg-emerald-500"
                              : t.accuracy >= 60
                              ? "bg-teal-500"
                              : t.accuracy > 0
                              ? "bg-amber-500"
                              : "bg-transparent"
                          }`}
                          style={{ width: `${t.accuracy}%` }}
                        />
                      </div>
                    </div>

                    {/* Question counts */}
                    <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mt-3">
                      <span>{t.questionsAttempted} Attempted</span>
                      <span className="text-emerald-700">{t.correctAnswers} Correct</span>
                      <span className="text-rose-700">{t.incorrectAnswers} Incorrect</span>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <Link
                      href={`/practice?topic=${t.slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-600 transition-all cursor-pointer"
                    >
                      <span>Drill Topic</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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

export default function ProgressPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFBF9]">
          <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <ProgressContent />
    </Suspense>
  );
}
