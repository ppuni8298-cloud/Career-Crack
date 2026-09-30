import { Sparkles, TrendingUp, Target, Heart } from "lucide-react";

export default function MotivationalSection() {
  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-b from-white via-emerald-50/40 to-white overflow-hidden border-y border-emerald-100/50">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-32 bg-amber-100/40 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>The Daily Mindset</span>
        </div>

        {/* Prominent Quote */}
        <blockquote className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
          &ldquo;You don&apos;t need to be the best today. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            You just need to be better than yesterday.&rdquo;
          </span>
        </blockquote>

        {/* Supporting Text */}
        <p className="mt-5 text-base sm:text-lg font-medium text-slate-600 max-w-xl mx-auto">
          Start with one question. Your journey begins here.
        </p>

        {/* 3 Micro Motivation Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-semibold text-slate-700">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>1% Compounding Habit</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Focus Over Fatigue</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Built For Aspirants</span>
          </div>
        </div>
      </div>
    </section>
  );
}
