"use client";

import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Flame,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface PerformanceSummaryProps {
  summary: {
    questionsAttempted: number;
    overallAccuracy: number;
    sessionsCompleted: number;
    studyTimeMinutes: number;
    currentStreak: number;
    longestStreak: number;
    topicsCount: number;
    mistakesPending: number;
  };
}

export default function PerformanceSummary({ summary }: PerformanceSummaryProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Performance Summary</h3>
            <p className="text-[11px] text-slate-500">Live verified data from your practice activity</p>
          </div>
        </div>

        <Link
          href="/progress"
          className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
        >
          <span>View Progress</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Questions Attempted */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Questions Attempted
          </span>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {summary.questionsAttempted}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Real practice questions</span>
        </div>

        {/* Overall Accuracy */}
        <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            Overall Accuracy
          </span>
          <div className="mt-1 text-2xl font-black text-emerald-700">
            {summary.overallAccuracy}%
          </div>
          <span className="text-[10px] text-emerald-800 font-medium">Across all sessions</span>
        </div>

        {/* Sessions Completed */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Drills Completed
          </span>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {summary.sessionsCompleted}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            {formatTime(summary.studyTimeMinutes)} total study time
          </span>
        </div>

        {/* Mistakes Pending */}
        <Link
          href="/mistakes"
          className={`p-4 rounded-2xl border transition-all cursor-pointer block hover:scale-[1.01] ${
            summary.mistakesPending > 0
              ? "bg-rose-50/50 border-rose-200 hover:bg-rose-50"
              : "bg-slate-50 border-slate-200/70 hover:bg-slate-100/60"
          }`}
        >
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              summary.mistakesPending > 0 ? "text-rose-700" : "text-slate-400"
            }`}
          >
            Mistakes in Vault
          </span>
          <div
            className={`mt-1 text-2xl font-black ${
              summary.mistakesPending > 0 ? "text-rose-700" : "text-slate-900"
            }`}
          >
            {summary.mistakesPending}
          </div>
          <span
            className={`text-[10px] font-medium ${
              summary.mistakesPending > 0 ? "text-rose-700" : "text-slate-500"
            }`}
          >
            {summary.mistakesPending > 0 ? "Click to review →" : "All clear"}
          </span>
        </Link>
      </div>
    </div>
  );
}
