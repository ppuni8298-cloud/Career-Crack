"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, Trophy, Compass, ShieldCheck } from "lucide-react";
import Hero3DCanvas from "./Hero3DCanvas";

export default function Hero() {
  const highlights = [
    "5,000+ Questions",
    "Previous Year Questions",
    "Mock Tests",
    "AI Learning",
    "Personalized Preparation",
  ];

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-warm-canvas">
      {/* Decorative subtle background accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-emerald-100/40 via-teal-100/20 to-amber-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Top Pill / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-xs mb-6">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Next-Gen Preparation Platform</span>
              <span className="text-emerald-300">|</span>
              <span className="text-amber-700 font-bold flex items-center gap-1">
                ★ 4.9 Rating
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Crack Your Exam. <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                Build Your Career.
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-5 text-lg sm:text-xl text-slate-600 font-medium max-w-2xl leading-relaxed">
              One smart platform for competitive exams, government jobs and placements.
            </p>

            {/* Feature highlights */}
            <div className="mt-7 py-3 px-4 rounded-2xl bg-white/80 border border-emerald-100/80 shadow-xs backdrop-blur-xs flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm font-semibold text-slate-700">
              {highlights.map((item, index) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                  {index < highlights.length - 1 && (
                    <span className="text-slate-300 ml-2 hidden sm:inline">·</span>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 text-base font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:-translate-y-0.5 transition-all duration-200"
                id="hero-start-prep-btn"
              >
                <span>Start My Preparation</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="#choose-path"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-2xl shadow-xs transition-all duration-200"
                id="hero-explore-exams-btn"
              >
                <Compass className="w-5 h-5 text-emerald-600" />
                <span>Explore Exams</span>
              </Link>
            </div>

            {/* Social Trust Strip */}
            <div className="mt-8 pt-6 border-t border-slate-200/60 flex items-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Syllabus & Blueprint</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Zero Distraction Interface</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Educational Illustration */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <Hero3DCanvas />
          </div>
        </div>
      </div>
    </section>
  );
}
