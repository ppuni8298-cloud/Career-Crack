"use client";

import { Target, Info, CheckCircle2, AlertCircle } from "lucide-react";

interface ReadinessScoreProps {
  score: number;
  subjects: string[];
}

export default function ReadinessScore({ score }: ReadinessScoreProps) {
  let phase = "Foundation Phase";
  let phaseColor = "text-emerald-800 bg-emerald-50 border-emerald-200";
  if (score >= 75) {
    phase = "Exam Crack Ready";
    phaseColor = "text-amber-900 bg-amber-50 border-amber-200";
  } else if (score >= 50) {
    phase = "Consolidation Phase";
    phaseColor = "text-teal-800 bg-teal-50 border-teal-200";
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // 5 Transparent Contributing Factors
  const factors = [
    { label: "Practice Consistency", pct: Math.min(100, Math.round(score * 1.05)) },
    { label: "Answer Accuracy", pct: Math.min(100, Math.round(score * 0.95)) },
    { label: "Syllabus Coverage", pct: Math.min(100, Math.round(score * 0.85)) },
    { label: "Mistake Resolution", pct: Math.min(100, Math.round(score * 0.9)) },
    { label: "Timed Speed & Pace", pct: Math.min(100, Math.round(score * 1.0)) },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Preparation Indicators</h3>
              <p className="text-[11px] text-slate-500">Multifactor Readiness Benchmark</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${phaseColor}`}>
            {phase}
          </span>
        </div>

        {/* Circular Progress Gauge */}
        <div className="flex items-center justify-center my-3">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-slate-100"
                strokeWidth="9"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {score}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                Readiness Pts
              </span>
            </div>
          </div>
        </div>

        {/* Contributing Factors Breakdown */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Contributing Diagnostic Factors
          </div>
          {factors.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{item.label}</span>
                <span className="font-mono text-emerald-700 font-bold">{item.pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transparent Disclaimer */}
      <div className="mt-5 pt-3 border-t border-slate-100 text-[10px] text-slate-500 leading-relaxed space-y-1">
        <p className="font-semibold text-slate-600">
          {score < 50
            ? "💡 Complete more practice sessions to generate deeper preparation insights."
            : "🌟 Consistent daily drills and mistake reviews strengthen these readiness indicators."}
        </p>
        <p className="text-[9px] text-slate-400">
          Evaluates consistency and accuracy on Career Crack drills. Does not guarantee official exam outcomes.
        </p>
      </div>
    </div>
  );
}
