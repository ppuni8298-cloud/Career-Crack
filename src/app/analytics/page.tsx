"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  HelpCircle,
  RefreshCw,
} from "lucide-react";

interface AnalyticsData {
  summary: {
    totalAnswered: number;
    correctCount: number;
    incorrectCount: number;
    overallAccuracy: number;
    avgSpeedSeconds: number;
    streakDays: number;
    longestStreak: number;
    totalXP: number;
    level: number;
    compositeReadiness: number;
  };
  readinessMethodology: {
    formula: string;
    factors: {
      accuracyScore: number;
      coverageScore: number;
      mockScore: number;
      revisionScore: number;
    };
  };
  subjectPerformance: Array<{
    name: string;
    totalQuestions: number;
    accuracyPct: number;
    status: "STRONG" | "DEVELOPING" | "NEEDS_IMPROVEMENT" | "NOT_STARTED";
  }>;
  topicBreakdown: Array<{
    topicId: string;
    topicName: string;
    subjectName: string;
    questionsAttempted: number;
    accuracyPct: number;
    masteryStatus: string;
  }>;
  recentSessionTrends: Array<{
    sessionIndex: number;
    title: string;
    accuracy: number;
    date: string;
  }>;
  errorPatterns: {
    totalMistakes: number;
    unresolvedMistakes: number;
    resolvedMistakes: number;
    repeatedMistakes: number;
  };
  mockHistory: Array<{
    id: string;
    title: string;
    score: number;
    totalMarks: number;
    accuracy: number;
    date: string;
  }>;
  consistencyData: Array<{
    date: string;
    minutes: number;
    level: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to load analytics", e);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
            <p className="text-sm font-medium text-slate-600">Compiling your performance telemetry...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const summary = data?.summary;
  const factors = data?.readinessMethodology?.factors;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Phase 10 Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Performance & Readiness Analytics
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Data-backed evaluation of your mastery, solving speed, error patterns, and syllabus readiness.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/crack-mode"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/20"
            >
              <Zap className="w-4 h-4" /> Adaptive Crack Drill
            </Link>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-all shadow-sm"
            >
              View Roadmap
            </Link>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Accuracy Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Overall Accuracy</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {summary?.overallAccuracy ?? 0}%
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                {summary?.correctCount ?? 0} / {summary?.totalAnswered ?? 0} Correct
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Across all practice sessions & drills</p>
          </div>

          {/* Speed Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-sky-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Solving Pace</span>
              <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {summary?.avgSpeedSeconds ?? 48}s
              </span>
              <span className="text-xs text-slate-500">avg / question</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Ideal target pace: &lt; 60 seconds</p>
          </div>

          {/* Composite Readiness */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-violet-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Composite Readiness</span>
              <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-violet-700">
                {summary?.compositeReadiness ?? 35}%
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                {(summary?.compositeReadiness || 0) >= 70 ? "On Track" : "Building"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Multi-factor exam readiness index</p>
          </div>

          {/* Consistency / Streak */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Consistency & Streak</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {summary?.streakDays ?? 1} Days
              </span>
              <span className="text-xs font-semibold text-amber-600">
                Best: {summary?.longestStreak ?? 1}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Level {summary?.level || 1} • {summary?.totalXP || 0} XP Earned</p>
          </div>
        </div>

        {/* Readiness Methodology Breakdown */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Transparent Readiness Index Methodology
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Formula: Accuracy (40%) + Syllabus Coverage (30%) + Mock Average (20%) + Revision Rate (10%)
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Non-Guarantee Metric
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Accuracy Component (40%)</span>
                <span>{factors?.accuracyScore ?? 0}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${factors?.accuracyScore ?? 0}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Syllabus Coverage (30%)</span>
                <span>{factors?.coverageScore ?? 0}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-600 h-full rounded-full transition-all"
                  style={{ width: `${factors?.coverageScore ?? 0}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Mock Performance (20%)</span>
                <span>{factors?.mockScore ?? 0}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-violet-600 h-full rounded-full transition-all"
                  style={{ width: `${factors?.mockScore ?? 0}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Revision Retention (10%)</span>
                <span>{factors?.revisionScore ?? 0}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all"
                  style={{ width: `${factors?.revisionScore ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Subject Mastery & Error Patterns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Subject Performance Breakdown */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Subject Performance & Syllabus Coverage
            </h3>

            {data?.subjectPerformance && data.subjectPerformance.length > 0 ? (
              <div className="space-y-4">
                {data.subjectPerformance.map((sub, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-semibold text-slate-900">{sub.name}</span>
                        <span className="text-xs text-slate-500 ml-2">
                          ({sub.totalQuestions} questions practiced)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            sub.status === "STRONG"
                              ? "bg-emerald-100 text-emerald-800"
                              : sub.status === "DEVELOPING"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {sub.status.replace("_", " ")}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{sub.accuracyPct}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sub.status === "STRONG"
                            ? "bg-emerald-500"
                            : sub.status === "DEVELOPING"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${sub.accuracyPct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm">Start practicing drills to see subject analytics.</p>
              </div>
            )}
          </div>

          {/* Mistake & Error Pattern Diagnostics */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Mistake Vault Diagnostics
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-900">Unresolved Mistakes</span>
                  <span className="text-base font-extrabold text-amber-700">
                    {data?.errorPatterns.unresolvedMistakes || 0}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-900">Resolved & Mastered</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    {data?.errorPatterns.resolvedMistakes || 0}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/70 flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-900">Repeated Error Clusters</span>
                  <span className="text-base font-extrabold text-rose-700">
                    {data?.errorPatterns.repeatedMistakes || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 mt-6">
              <Link
                href="/mistakes"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                Review Mistake Vault <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 14-Day Study Consistency Heatmap */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            14-Day Study Consistency Heatmap
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Active daily study volume logged through drills, full mocks, and revision sessions.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {data?.consistencyData?.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div
                  title={`${day.date}: ${day.minutes} mins`}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    day.level === 3
                      ? "bg-emerald-600 text-white shadow-sm"
                      : day.level === 2
                      ? "bg-emerald-400 text-white"
                      : day.level === 1
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {day.minutes > 0 ? `${day.minutes}m` : "-"}
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  {day.date.split("-").slice(1).join("/")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
