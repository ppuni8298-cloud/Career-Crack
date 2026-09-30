"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Bot,
  Brain,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Zap,
  Target,
  ChevronRight,
} from "lucide-react";

export default function AICoachWidget() {
  const router = useRouter();
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/coach/briefing")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setBriefing(data);
      })
      .catch((err) => console.error("AICoachWidget load error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-32 bg-slate-100 rounded-3xl animate-pulse border border-slate-200/60" />
    );
  }

  if (!briefing) return null;

  const { nextBestAction, dailyPlan, profile, weaknesses } = briefing;
  const topTask = dailyPlan?.[0];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-5 sm:p-6 border border-emerald-500/30 shadow-lg">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left: Coach avatar and strategic insight */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-2xl">
              🤖
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-400/20">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                CrackCoach AI Insight
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Target: {profile?.targetExam || "Exam"}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white">
              {topTask?.title || nextBestAction?.title || "Daily Preparation Strategy Active"}
            </h3>

            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              {topTask?.why || nextBestAction?.reason || "Targeted practice on high-yield questions."}
            </p>
          </div>
        </div>

        {/* Right: Actions & Hub link */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 self-end md:self-center">
          <Link
            href="/coach"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5"
          >
            <Brain className="w-3.5 h-3.5 text-emerald-400" />
            AI Coach Hub
          </Link>

          <button
            onClick={() => {
              if (nextBestAction?.actionHref) {
                router.push(nextBestAction.actionHref);
              } else {
                router.push("/coach");
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{nextBestAction?.actionText || "Start Daily Action"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
