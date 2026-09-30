"use client";

import Link from "next/link";
import { BookOpen, Compass, Target, ArrowRight, Sparkles, Layers } from "lucide-react";

interface ContinueLearningProps {
  continueData: {
    recentExam: { name: string; slug: string } | null;
    recentSubject: { name: string; slug: string } | null;
    weakTopic: { name: string; slug: string } | null;
    recommendedNextSession: {
      title: string;
      actionHref: string;
      badge: string;
    };
  };
}

export default function ContinueLearning({ continueData }: ContinueLearningProps) {
  const { recentExam, recentSubject, weakTopic, recommendedNextSession } = continueData;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Continue Learning</h3>
            <p className="text-[11px] text-slate-500">Pick up where you left off</p>
          </div>
        </div>

        <Link
          href="/practice"
          className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
        >
          <span>Practice Bank</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Target / Recent Exam */}
        {recentExam && (
          <Link
            href={`/exams/${recentExam.slug}`}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                <span>Target Exam</span>
                <span className="text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
              <div className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {recentExam.name}
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-3">View Syllabus & Tiers</span>
          </Link>
        )}

        {/* Card 2: Subject / Weak Topic */}
        {weakTopic ? (
          <Link
            href={`/practice?topic=${weakTopic.slug}`}
            className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 hover:border-amber-300 hover:bg-amber-50/70 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-1">
                <span>Priority Revision</span>
                <span className="text-amber-700 group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
              <div className="text-sm font-extrabold text-slate-900 group-hover:text-amber-900 transition-colors">
                {weakTopic.name}
              </div>
            </div>
            <span className="text-[11px] text-amber-800 font-medium mt-3">Targeted Topic Drill</span>
          </Link>
        ) : recentSubject ? (
          <Link
            href={`/practice?subject=${recentSubject.slug}`}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                <span>Core Subject</span>
                <span className="text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
              <div className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {recentSubject.name}
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-3">Solve Practice Questions</span>
          </Link>
        ) : null}

        {/* Card 3: Recommended Next Drill */}
        <Link
          href={recommendedNextSession.actionHref}
          className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50/50 border border-emerald-200/80 hover:border-emerald-300 hover:shadow-xs transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
              <span>{recommendedNextSession.badge}</span>
              <span className="text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>
            <div className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
              {recommendedNextSession.title}
            </div>
          </div>
          <span className="text-[11px] text-emerald-800 font-medium mt-3">Launch Session Now</span>
        </Link>
      </div>
    </div>
  );
}
