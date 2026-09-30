"use client";

import Link from "next/link";
import { Target, Calendar, Clock, Flame, ArrowUpRight, Award } from "lucide-react";

interface GoalBannerProps {
  profile: {
    goalCategory: string;
    targetExam: string;
    dailyStudyHours: string;
    targetExamDate?: string | null;
    readinessScore: number;
    streakDays: number;
  } | null;
  userName: string;
}

export default function GoalBanner({ profile, userName }: GoalBannerProps) {
  const targetExam = profile?.targetExam || "Competitive Exam";
  const category = profile?.goalCategory || "GOVERNMENT";
  const dailyHours = profile?.dailyStudyHours || "2-4 hours";
  const streak = profile?.streakDays || 1;

  // Format exam date if present
  let daysRemaining: number | null = null;
  if (profile?.targetExamDate) {
    const examTime = new Date(profile.targetExamDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((examTime - now) / (1000 * 60 * 60 * 24));
    if (diff > 0) daysRemaining = diff;
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
      {/* Soft emerald backdrop gradient */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-l from-emerald-50 via-teal-50/50 to-transparent rounded-bl-full pointer-events-none -z-0" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          {/* Top category & streak chips */}
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
              {category} TRACK
            </span>

            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{streak} Day Study Streak</span>
            </span>

            {daysRemaining !== null && (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{daysRemaining} Days To Target Exam</span>
              </span>
            )}
          </div>

          {/* Exam Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Targeting {targetExam}</span>
          </h1>

          <p className="mt-1.5 text-sm font-medium text-slate-600">
            Welcome, <span className="font-bold text-slate-800">{userName}</span>. Your personalized daily preparation path is synchronized.
          </p>
        </div>

        {/* Quick Goal Stats & Action */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Daily Target</div>
            <div className="text-sm font-black text-slate-800 flex items-center gap-1 justify-center mt-0.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{dailyHours}</span>
            </div>
          </div>

          <Link
            href="/practice"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all"
            id="dashboard-practice-btn"
          >
            <span>Practice Questions</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 shadow-2xs transition-all"
            id="change-goal-btn"
          >
            <span>Change Goal</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
