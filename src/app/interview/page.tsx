"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import {
  Code2,
  Briefcase,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  Zap,
  Target,
  ChevronRight,
  TrendingUp,
  Cpu,
  Database,
  BrainCircuit,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";

interface InterviewRecord {
  id: string;
  interviewType: string;
  topicOrRole: string;
  difficulty: string;
  score: number | null;
  status: string;
  feedback: string | null;
  createdAt: string;
}

export default function InterviewHubPage() {
  const [recentInterviews, setRecentInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/placements")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.recentInterviews) {
          setRecentInterviews(data.recentInterviews);
        }
      })
      .catch((err) => console.error("Failed to load interview history:", err))
      .finally(() => setLoading(false));
  }, []);

  const modes = [
    {
      title: "Technical Interview Simulator",
      description: "Rigorous deep-dives in DSA, DBMS, Operating Systems, Computer Networks, and OOP with step-by-step AI feedback on technical correctness and communication.",
      href: "/interview/technical",
      icon: Code2,
      badge: "Core Technical",
      color: "from-blue-600 to-indigo-600",
      accent: "text-blue-500",
      bgLight: "bg-blue-50/70 border-blue-200/60",
      topics: ["DSA (Arrays, Trees, Graphs)", "DBMS & SQL Normalization", "OS & Multithreading", "Computer Networks (TCP/IP, HTTP)"],
    },
    {
      title: "Project-Based Interview",
      description: "Enter your real-world projects and defend your architecture, trade-offs, scaling decisions, and tough engineering roadblocks before an AI interviewer.",
      href: "/interview/project",
      icon: Layers,
      badge: "Architecture & Systems",
      color: "from-emerald-600 to-teal-600",
      accent: "text-emerald-500",
      bgLight: "bg-emerald-50/70 border-emerald-200/60",
      topics: ["Architectural Justification", "Performance Bottlenecks", "Scalability & Concurrency", "System Trade-offs"],
    },
    {
      title: "Resume-Grounded Interview",
      description: "Paste or parse your resume bullets. The simulator grills you strictly on your documented skills, claimed achievements, and tech stack proficiencies.",
      href: "/interview/resume",
      icon: FileText,
      badge: "Resume Verification",
      color: "from-purple-600 to-violet-600",
      accent: "text-purple-500",
      bgLight: "bg-purple-50/70 border-purple-200/60",
      topics: ["Claimed Tech Stacks", "Internship & Work Experience", "Impact & Metric Defense", "Cross-Domain Competencies"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBF9] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Phase 8 • AI Interview Ecosystem</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Interview Simulator & Evaluation Hub
            </h1>
            <p className="text-base text-slate-600 max-w-2xl">
              Practice real-time interactive technical, project architecture, and resume-grounded interview rounds with instant rubric evaluation and follow-up probing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/placements"
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-slate-500" />
              Placement Hub
            </Link>
            <Link
              href="/roadmap?track=PLACEMENT"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center gap-2"
            >
              <span>Placement Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 3 Core Interview Tracks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.title}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mode.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {mode.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                    {mode.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {mode.description}
                  </p>

                  <div className="space-y-1.5 mb-6">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Key Topics Evaluated
                    </div>
                    {mode.topics.map((t) => (
                      <div key={t} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={mode.href}
                  className={`w-full py-3 rounded-2xl bg-gradient-to-r ${mode.color} text-white text-xs font-bold shadow-md shadow-emerald-500/10 hover:opacity-95 transition-all flex items-center justify-center gap-2`}
                >
                  <span>Start Simulation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Recent Interview Rounds & Performance */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Your Recent Interview Rounds</h2>
              <p className="text-xs text-slate-500 mt-1">
                Completed simulations, scores, and detailed rubric feedback
              </p>
            </div>
            <Link
              href="/placements"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View Placements Hub</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentInterviews.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">No interview sessions recorded yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                Take your first simulated technical, project, or resume interview round to generate detailed diagnostic reports and feedback.
              </p>
              <Link
                href="/interview/technical"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm transition-all"
              >
                <span>Start Technical Round</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentInterviews.map((iv) => (
                <div key={iv.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {iv.interviewType} Interview • {iv.topicOrRole}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {iv.difficulty || "INTERMEDIATE"}
                      </span>
                    </div>
                    {iv.feedback && (
                      <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                        {iv.feedback}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {new Date(iv.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {iv.score !== null ? (
                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-medium">Score</div>
                        <div className="text-base font-black text-emerald-600">
                          {iv.score}%
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                        In Progress
                      </span>
                    )}

                    <Link
                      href={`/interview/report/${iv.id}`}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5"
                    >
                      <span>Report</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
