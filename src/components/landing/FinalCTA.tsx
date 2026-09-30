import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 px-6 py-16 sm:px-12 sm:py-20 text-center text-white shadow-2xl shadow-emerald-700/20 overflow-hidden">
          {/* Subtle glowing ambient circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-emerald-100 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Begin Today With Zero Friction</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Your preparation starts here.
          </h2>

          <p className="mt-5 text-base sm:text-xl text-emerald-100/90 font-medium max-w-2xl mx-auto leading-relaxed">
            Join thousands of serious aspirants transforming random study hours into guaranteed test performance.
          </p>

          {/* CTA Button */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-3 px-9 py-4 text-base sm:text-lg font-bold text-emerald-950 bg-white hover:bg-emerald-50 rounded-2xl shadow-xl shadow-black/10 hover:shadow-2xl hover:scale-105 transition-all duration-200"
              id="final-cta-start-prep-btn"
            >
              <span>Start My Preparation</span>
              <ArrowRight className="w-5 h-5 text-emerald-700" />
            </Link>
          </div>

          {/* Bullet proofs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-emerald-100/90">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Free Diagnostic Readiness Check</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Personalized Study Plan</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>No Credit Card Required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
