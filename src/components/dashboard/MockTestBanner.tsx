"use client";

import Link from "next/link";
import { Award, Clock, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

export default function MockTestBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 sm:p-7 border border-emerald-900/50 shadow-md">
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent_70%)] pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            Phase 5 Real Exam Simulation
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Full-Length Proctored Mock Tests
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Replicate actual test day pressure. Official TCS iON question palette, server-synced timer, negative marking penalties, and instant Mistake Vault sync.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-emerald-300/90 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SSC CGL Tier-1
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> KPSC KAS Prelims
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Campus & DSA Placement
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/mock-tests"
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] inline-flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>Launch Mock Test</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
