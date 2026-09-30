"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import NextBestAction from "@/components/common/NextBestAction";
import {
  Gauge,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Flame,
  Target,
  BookOpen,
  RotateCcw,
  Sparkles,
  BarChart3,
  Layers,
  Activity,
  Zap,
} from "lucide-react";

interface ComponentScore {
  name: string;
  score: number;
  weight: number;
  description: string;
  status: "OPTIMAL" | "ADEQUATE" | "NEEDS_ATTENTION";
}

interface HoldingBackItem {
  id: string;
  title: string;
  explanation: string;
  impact: string;
  severity: "CRITICAL" | "MODERATE" | "LOW";
  fixUrl: string;
  fixLabel: string;
  metric: string;
}

interface ReadinessData {
  readiness: {
    compositeScore: number;
    previousScore: number;
    scoreDelta: number;
    trendSummary: string;
    components: {
      coverage: ComponentScore;
      accuracy: ComponentScore;
      consistency: ComponentScore;
      mockPerformance: ComponentScore;
      mistakeHealth: ComponentScore;
      revisionHealth: ComponentScore;
    };
  };
  topicMasterySummary: {
    total: number;
    mastered: number;
    strong: number;
    developing: number;
    learning: number;
    needsRevision: number;
    new: number;
  };
  nextBestAction: any;
  holdingBack: HoldingBackItem[];
}

export default function ReadinessPage() {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/readiness");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load readiness data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-32 pb-16 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 text-sm font-medium">Calculating multi-factor readiness telemetry...</p>
        </div>
      </div>
    );
  }

  const readiness = data?.readiness;
  const score = readiness?.compositeScore ?? 0;
  const components = readiness?.components;

  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-emerald-400";
    if (val >= 60) return "text-teal-400";
    if (val >= 40) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreRing = (val: number) => {
    if (val >= 80) return "stroke-emerald-500";
    if (val >= 60) return "stroke-teal-500";
    if (val >= 40) return "stroke-amber-500";
    return "stroke-red-500";
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3 tracking-wide uppercase">
            <Gauge className="w-3.5 h-3.5" />
            Empirical Readiness Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Exam & Placement Readiness Analysis
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
            A comprehensive, multi-pillar audit of your actual exam capability. Weighted across syllabus coverage, validated accuracy, study consistency, mock stamina, mistake resolution, and retention decay.
          </p>
        </div>

        {/* Global Next Best Action Banner */}
        <div className="mb-8">
          <NextBestAction />
        </div>

        {/* Primary Hero Readiness Score + Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          {/* Main Composite Score Card */}
          <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-emerald-950/30 border border-white/10 p-8 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Composite Readiness</span>
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
                  Target: 85+ for High Probability
                </span>
              </div>

              <div className="flex items-center gap-6 my-4">
                {/* Circular Gauge */}
                <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-slate-800"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className={`${getScoreRing(score)} transition-all duration-1000 ease-out`}
                      strokeWidth="10"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * score) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className={`text-4xl font-black tracking-tight ${getScoreColor(score)}`}>
                      {score}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">/ 100</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {readiness && readiness.scoreDelta >= 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{readiness.scoreDelta} pts
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                        <TrendingDown className="w-3.5 h-3.5" />
                        {readiness?.scoreDelta} pts
                      </span>
                    )}
                    <span className="text-xs text-slate-400">vs last 7 days</span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">
                    {score >= 80 ? "Exam Ready" : score >= 60 ? "Competitive Zone" : score >= 40 ? "Developing Baseline" : "Early Preparation"}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {readiness?.trendSummary}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Syllabus covered: <strong className="text-white">{components?.coverage.score ?? 0}%</strong></span>
              <Link href="/crack-mode" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                Boost Score <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Topic Mastery Distribution Summary */}
          <div className="lg:col-span-7 rounded-3xl bg-slate-900/60 border border-white/10 p-8 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Syllabus Topic Mastery Breakdown</h3>
                </div>
                <span className="text-xs text-slate-400">
                  {data?.topicMasterySummary.total ?? 0} Total Topics In Scope
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Mastery is dynamically evaluated across 6 states based on question volume (&ge;8), sustained accuracy (&ge;80%), multiple practice sessions, and absence of unresolved mistakes.
              </p>

              {/* Progress Stack Bar */}
              {data && data.topicMasterySummary.total > 0 && (
                <div className="w-full h-4 rounded-full bg-slate-800 overflow-hidden flex mb-6 border border-white/5">
                  <div
                    style={{ width: `${(data.topicMasterySummary.mastered / data.topicMasterySummary.total) * 100}%` }}
                    className="bg-emerald-500 h-full transition-all"
                    title={`Mastered: ${data.topicMasterySummary.mastered}`}
                  />
                  <div
                    style={{ width: `${(data.topicMasterySummary.strong / data.topicMasterySummary.total) * 100}%` }}
                    className="bg-teal-400 h-full transition-all"
                    title={`Strong: ${data.topicMasterySummary.strong}`}
                  />
                  <div
                    style={{ width: `${(data.topicMasterySummary.developing / data.topicMasterySummary.total) * 100}%` }}
                    className="bg-blue-400 h-full transition-all"
                    title={`Developing: ${data.topicMasterySummary.developing}`}
                  />
                  <div
                    style={{ width: `${(data.topicMasterySummary.learning / data.topicMasterySummary.total) * 100}%` }}
                    className="bg-amber-400 h-full transition-all"
                    title={`Learning: ${data.topicMasterySummary.learning}`}
                  />
                  <div
                    style={{ width: `${(data.topicMasterySummary.needsRevision / data.topicMasterySummary.total) * 100}%` }}
                    className="bg-red-400 h-full transition-all"
                    title={`Needs Revision: ${data.topicMasterySummary.needsRevision}`}
                  />
                  <div
                    style={{ width: `${(data.topicMasterySummary.new / data.topicMasterySummary.total) * 100}%` }}
                    className="bg-slate-700 h-full transition-all"
                    title={`New: ${data.topicMasterySummary.new}`}
                  />
                </div>
              )}

              {/* Grid of states */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Mastered</span>
                    <span className="text-lg font-bold text-white">{data?.topicMasterySummary.mastered ?? 0}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-teal-400" />
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Strong</span>
                    <span className="text-lg font-bold text-white">{data?.topicMasterySummary.strong ?? 0}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-400" />
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Developing</span>
                    <span className="text-lg font-bold text-white">{data?.topicMasterySummary.developing ?? 0}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Learning</span>
                    <span className="text-lg font-bold text-white">{data?.topicMasterySummary.learning ?? 0}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Needs Revision</span>
                    <span className="text-lg font-bold text-red-300">{data?.topicMasterySummary.needsRevision ?? 0}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-slate-600" />
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Unexplored / New</span>
                    <span className="text-lg font-bold text-slate-300">{data?.topicMasterySummary.new ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 mt-4">
              <span>View full curriculum sequence in roadmap</span>
              <Link href="/roadmap" className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1">
                Open Roadmap <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 6 Empirical Component Cards */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Score Component Weighting & Health</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {components &&
              Object.entries(components).map(([key, comp]) => (
                <div
                  key={key}
                  className="rounded-2xl bg-slate-900/60 border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 transition backdrop-blur-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {comp.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          comp.status === "OPTIMAL"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : comp.status === "ADEQUATE"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {comp.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mb-2">
                      <span className={`text-3xl font-extrabold ${getScoreColor(comp.score)}`}>
                        {comp.score}%
                      </span>
                      <span className="text-xs text-slate-500 font-medium">Weight: {comp.weight * 100}%</span>
                    </div>

                    {/* Score Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
                      <div
                        style={{ width: `${comp.score}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          comp.score >= 75 ? "bg-emerald-500" : comp.score >= 50 ? "bg-amber-400" : "bg-red-500"
                        }`}
                      />
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {comp.description}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Diagnostic: "What is holding me back?" */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Diagnostic: What Is Holding You Back?</h2>
            </div>
            <span className="text-xs text-slate-400">
              {data?.holdingBack.length ?? 0} active bottlenecks detected
            </span>
          </div>

          {data && data.holdingBack.length === 0 ? (
            <div className="rounded-3xl bg-emerald-950/20 border border-emerald-500/30 p-8 text-center max-w-2xl mx-auto">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Zero Critical Bottlenecks Detected</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your preparation trajectory is exceptionally balanced across all dimensions. Continue with full-length mocks to sharpen time management.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data?.holdingBack.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-6 flex flex-col justify-between transition backdrop-blur-sm ${
                    item.severity === "CRITICAL"
                      ? "bg-red-950/20 border-red-500/30 hover:border-red-500/50"
                      : item.severity === "MODERATE"
                      ? "bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50"
                      : "bg-slate-900/60 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          item.severity === "CRITICAL"
                            ? "bg-red-500/20 text-red-300 border-red-500/30"
                            : item.severity === "MODERATE"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-slate-800 text-slate-300 border-white/10"
                        }`}
                      >
                        {item.severity} Severity
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-300">
                        {item.metric}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                      {item.explanation}
                    </p>

                    <div className="text-xs text-slate-400 bg-black/40 rounded-xl p-3 mb-4 border border-white/5">
                      <strong className="text-amber-300 block mb-0.5">Impact on Exam:</strong>
                      {item.impact}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-end">
                    <Link
                      href={item.fixUrl}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                        item.severity === "CRITICAL"
                          ? "bg-red-500 hover:bg-red-400 text-slate-950 shadow-lg shadow-red-500/20"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                    >
                      {item.fixLabel} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
