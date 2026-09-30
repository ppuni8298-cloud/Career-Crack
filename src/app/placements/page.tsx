"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import {
  Briefcase,
  Code2,
  Database,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Award,
  FileText,
  UserCheck,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  ExternalLink,
  Zap,
} from "lucide-react";

interface SubjectSummary {
  id: string;
  name: string;
  slug: string;
  topicsCount: number;
  questionsCount: number;
}

interface PlacementData {
  placementReadiness: {
    aptitude: { accuracy: number; attempted: number; status: string };
    dsa: { accuracy: number; attempted: number; status: string };
    coreCs: { accuracy: number; attempted: number; status: string };
    interview: { completedCount: number; averageScore: number | null; status: string };
  };
  curriculum: {
    aptitude: SubjectSummary[];
    technical: SubjectSummary[];
  };
  recentInterviews: Array<{
    id: string;
    interviewType: string;
    topicOrRole: string;
    score: number | null;
    status: string;
    createdAt: string;
  }>;
}

export default function PlacementsPage() {
  const [data, setData] = useState<PlacementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/placements");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "STRONG":
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">Strong Readiness</span>;
      case "DEVELOPING":
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">Developing</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10 text-[10px] font-bold">Needs Practice</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/40 via-blue-950/20 to-slate-900 border border-indigo-500/20 p-8 sm:p-10 mb-10 backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3 tracking-wide uppercase">
              <Briefcase className="w-3.5 h-3.5" />
              Software Engineering & Campus Placements
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              Placement Preparation Ecosystem
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Target campus recruitment and product engineering interviews. Master the 4 key gates: Online Assessment (Aptitude & DSA), Core Computer Science rounds, and 1-on-1 AI technical & resume interviews.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Aptitude Gate</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-white">{data?.placementReadiness.aptitude.accuracy ?? 0}%</span>
                <span className="text-xs text-slate-400">acc ({data?.placementReadiness.aptitude.attempted ?? 0} Qs)</span>
              </div>
            </div>

            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">DSA & Algorithms</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-teal-400">{data?.placementReadiness.dsa.accuracy ?? 0}%</span>
                <span className="text-xs text-slate-400">acc ({data?.placementReadiness.dsa.attempted ?? 0} Qs)</span>
              </div>
            </div>

            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Core CS Concepts</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-indigo-400">{data?.placementReadiness.coreCs.accuracy ?? 0}%</span>
                <span className="text-xs text-slate-400">acc ({data?.placementReadiness.coreCs.attempted ?? 0} Qs)</span>
              </div>
            </div>

            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">AI Mock Interviews</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-emerald-400">
                  {data?.placementReadiness.interview.averageScore !== null ? `${data?.placementReadiness.interview.averageScore}%` : "—"}
                </span>
                <span className="text-xs text-slate-400">({data?.placementReadiness.interview.completedCount ?? 0} done)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1-on-1 Interview Simulations Banner Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-indigo-400" />
                AI Interview Simulator
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time multi-turn rounds with targeted follow-up probing, structure evaluation, and session scorecards.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Technical Mock */}
            <div className="group rounded-3xl bg-slate-900/60 border border-white/10 hover:border-indigo-500/40 p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 backdrop-blur-sm">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition">
                  <Code2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Technical Interview Round</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Select Data Structures, Algorithms, DBMS, Operating Systems, Computer Networks, or OOP. Experience dynamic follow-up questions tailored to your answers.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-6 text-[10px] text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">DSA</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">DBMS</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">OS</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">Networks</span>
                </div>
              </div>

              <Link
                href="/interview/technical"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                Launch Technical Round <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Project Deep-Dive */}
            <div className="group rounded-3xl bg-slate-900/60 border border-white/10 hover:border-teal-500/40 p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-teal-500/5 backdrop-blur-sm">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Project Deep-Dive Round</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Input your project title, architecture, tech stack, and challenges. The AI asks real architectural trade-off questions, edge-case inquiries, and scalability challenges.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-6 text-[10px] text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">Architecture</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">Trade-offs</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">Scalability</span>
                </div>
              </div>

              <Link
                href="/interview/project"
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                Start Project Defense <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Resume-Derived Round */}
            <div className="group rounded-3xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/5 backdrop-blur-sm">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Resume & Experience Round</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Paste your resume text or key bullet points. The AI interviewer scrutinizes your claims, tools, internships, and quantitative results just like a senior engineering manager.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-6 text-[10px] text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">Claim Verification</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">Behavioral STAR</span>
                </div>
              </div>

              <Link
                href="/interview/resume"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                Scan Resume & Drill <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Interview History */}
        {data && data.recentInterviews.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Recent AI Mock Interview Scorecards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.recentInterviews.map((interview) => (
                <Link
                  key={interview.id}
                  href={`/interview/report/${interview.id}`}
                  className="rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 p-4 transition flex items-center justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {interview.interviewType}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                      {interview.topicOrRole}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-right">
                    {interview.score !== null ? (
                      <span className="text-xl font-black text-emerald-400">
                        {interview.score}%
                      </span>
                    ) : (
                      <span className="text-xs text-amber-400 font-semibold">In Progress</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-500 ml-auto group-hover:text-white transition mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Placement Curriculum Topics */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-400" />
              Verified Placement Question Banks & Core Subjects
            </h2>
            <Link href="/crack-mode" className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1">
              Adaptive Practice <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aptitude Bank */}
            <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                Online Assessment (OA) Aptitude
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Quantitative aptitude, data interpretation, and analytical reasoning required by hiring platforms.
              </p>
              <div className="space-y-2">
                {data?.curriculum.aptitude.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div>
                      <span className="text-sm font-semibold text-white block">{sub.name}</span>
                      <span className="text-[11px] text-slate-400">{sub.topicsCount} syllabus topics &bull; {sub.questionsCount} questions</span>
                    </div>
                    <Link
                      href={`/crack-mode?subjectId=${sub.id}`}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      Drill
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Core CS Bank */}
            <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                Core CS & Technical Foundations
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                DBMS transactions, indexing, OS scheduling, memory paging, networking protocols, and OOP design.
              </p>
              <div className="space-y-2">
                {data?.curriculum.technical.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div>
                      <span className="text-sm font-semibold text-white block">{sub.name}</span>
                      <span className="text-[11px] text-slate-400">{sub.topicsCount} syllabus topics &bull; {sub.questionsCount} questions</span>
                    </div>
                    <Link
                      href={`/crack-mode?subjectId=${sub.id}`}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Zap className="w-3 h-3 text-teal-400" />
                      Drill
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
