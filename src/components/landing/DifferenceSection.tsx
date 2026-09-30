import { Check, X, Sparkles, Brain, Cpu, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DifferenceSection() {
  const comparison = [
    {
      feature: "Study Guidance",
      traditional: "Passive reading from bulky 800-page textbooks without knowing weak points.",
      smart: "Dynamic daily recommendation: AI diagnoses exact error patterns and prescribes high-yield review.",
    },
    {
      feature: "Daily Planning",
      traditional: "Random syllabus jumping, overwhelming to-do lists, and study fatigue.",
      smart: "Today's Crack Plan: 3-4 bite-sized, time-boxed milestones tailored to your target exam.",
    },
    {
      feature: "Previous Year Questions",
      traditional: "Disorganized question PDFs without topic mapping, verified answers, or timing analytics.",
      smart: "Verified PYQ Vault with sub-topic tags, shortcut explanations, and accuracy tracking.",
    },
    {
      feature: "Exam Readiness Visibility",
      traditional: "Guesswork until the actual exam day results in negative surprises.",
      smart: "Live Preparation Readiness Gauge showing syllabus mastery and expected percentile.",
    },
  ];

  return (
    <section id="difference" className="py-20 md:py-28 bg-[#FAFBF9] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>The Career Crack Advantage</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Don&apos;t just prepare. <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              Prepare smarter.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Most aspirants waste hundreds of hours re-studying chapters they already know, while leaving crucial scoring topics untouched. Career Crack personalizes what you should study next.
          </p>
        </div>

        {/* Highlight Banner */}
        <div className="mb-14 p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl shadow-emerald-600/15 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-3">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-extrabold text-lg">Adaptive Weakness Engine</h4>
              <p className="mt-1 text-xs text-emerald-100">
                Instantly flags whether errors are conceptual, calculation slips, or time pressure.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-3">
                <Cpu className="w-6 h-6 text-amber-300" />
              </div>
              <h4 className="font-extrabold text-lg">Personalized Next Action</h4>
              <p className="mt-1 text-xs text-emerald-100">
                You never open the dashboard asking &ldquo;What should I study?&rdquo; The top action is ready.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-emerald-200" />
              </div>
              <h4 className="font-extrabold text-lg">High-Yield Retention</h4>
              <p className="mt-1 text-xs text-emerald-100">
                Spaced repetition prompts keep formulas, GK facts, and algorithms fresh in your memory.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Table / Cards */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 py-4 px-6">
            <div className="md:col-span-3">Dimension</div>
            <div className="md:col-span-4 text-slate-500 hidden md:block">Traditional Preparation</div>
            <div className="md:col-span-5 text-emerald-700 hidden md:block">Career Crack Smart Method</div>
          </div>

          <div className="divide-y divide-slate-100">
            {comparison.map((item) => (
              <div key={item.feature} className="grid grid-cols-1 md:grid-cols-12 p-6 gap-4 items-center hover:bg-slate-50/40 transition-colors">
                <div className="md:col-span-3">
                  <span className="font-extrabold text-base text-slate-900">{item.feature}</span>
                </div>

                <div className="md:col-span-4 flex items-start gap-2.5 text-sm text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <span className="md:hidden font-bold text-xs text-rose-600 block mb-1">Traditional:</span>
                    <span>{item.traditional}</span>
                  </div>
                </div>

                <div className="md:col-span-5 flex items-start gap-2.5 text-sm text-slate-800 font-medium bg-emerald-50/40 md:bg-transparent p-3 md:p-0 rounded-2xl">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <span className="md:hidden font-bold text-xs text-emerald-700 block mb-1">Career Crack:</span>
                    <span>{item.smart}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
