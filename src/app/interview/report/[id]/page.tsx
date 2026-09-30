"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Briefcase,
  Share2,
  HelpCircle,
  Zap,
} from "lucide-react";

interface Turn {
  id: string;
  order: number;
  questionText: string;
  questionType: string;
  userAnswer: string;
  evaluation: {
    score: number;
    strongPoints: string[];
    missingPoints: string[];
    suggestedStructure: string;
    followUpQuestion: string;
    feedback: string;
  } | null;
  followUpQuestion: string | null;
}

interface InterviewReportData {
  session: {
    id: string;
    interviewType: string;
    topicOrRole: string;
    difficulty: string;
    status: string;
    score: number | null;
    strongPoints: string[];
    missingPoints: string[];
    feedback: string | null;
    questionsAsked: number;
    createdAt: string;
    projectContext?: any;
  };
  turns: Turn[];
}

export default function InterviewReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<InterviewReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTurn, setExpandedTurn] = useState<number | null>(1);

  useEffect(() => {
    async function loadReport() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/interview/${id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load interview report:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-32 pb-16 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Compiling holistic interview assessment...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white">
        <Navbar />
        <div className="max-w-md mx-auto px-4 pt-32 pb-16 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Report Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">Could not load details for this interview session.</p>
          <Link href="/placements" className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold">
            Back to Placement Hub
          </Link>
        </div>
      </div>
    );
  }

  const { session, turns } = data;
  const score = session.score ?? 0;

  const getVerdict = (s: number) => {
    if (s >= 80) return { label: "High Confidence Recommendation (Hire)", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" };
    if (s >= 60) return { label: "Promising (Borderline / Second Round)", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" };
    return { label: "Needs Concrete Conceptual Strengthening", color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10" };
  };

  const verdict = getVerdict(score);

  return (
    <div className="min-h-screen bg-[#090D16] text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link href="/placements" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition">
            &larr; Placement Hub
          </Link>
          <span className="text-xs text-slate-500">
            Conducted on {new Date(session.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Hero Scorecard */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/80 to-indigo-950/40 border border-white/10 p-8 sm:p-10 mb-8 backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold mb-2">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                {session.interviewType} ROUND &bull; {session.topicOrRole}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Interview Performance Scorecard
              </h1>
            </div>

            {/* Score Ring / Pill */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium block">Overall Score</span>
                <span className={`text-4xl sm:text-5xl font-black ${verdict.color}`}>
                  {score}%
                </span>
              </div>
            </div>
          </div>

          {/* Verdict Banner */}
          <div className={`mt-6 p-4 rounded-2xl border ${verdict.bg} ${verdict.border} flex items-center justify-between`}>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                Evaluator Recommendation
              </span>
              <span className={`text-sm font-bold ${verdict.color}`}>
                {verdict.label}
              </span>
            </div>
            <Award className={`w-6 h-6 ${verdict.color}`} />
          </div>

          {/* Qualitative Feedback */}
          {session.feedback && (
            <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed bg-black/30 p-4 rounded-2xl border border-white/5">
              <strong className="text-slate-400 block mb-1">Executive Summary:</strong>
              {session.feedback}
            </p>
          )}

          {/* Aggregated Strengths vs Missing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4" /> Strong Attributes Demonstrated
              </span>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                {session.strongPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-4 h-4" /> Primary Gaps & Improvement Areas
              </span>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                {session.missingPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Turn-by-Turn Accordion */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            Turn-by-Turn Question Evaluation ({turns.length} Questions)
          </h2>

          <div className="space-y-4">
            {turns.map((turn) => {
              const isExpanded = expandedTurn === turn.order;
              const evalData = turn.evaluation;

              return (
                <div
                  key={turn.id}
                  className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden backdrop-blur-sm transition"
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => setExpandedTurn(isExpanded ? null : turn.order)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-white/10 text-slate-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {turn.order}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          {turn.questionType}
                        </span>
                        <h3 className="text-sm font-bold text-white leading-snug">
                          {turn.questionText}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {evalData && (
                        <span className="text-sm font-extrabold text-indigo-400">
                          {evalData.score}%
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Accordion Body */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-white/10 space-y-4">
                      {/* Candidate Answer */}
                      <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Your Submitted Answer
                        </span>
                        <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {turn.userAnswer || "(No answer recorded)"}
                        </p>
                      </div>

                      {evalData && (
                        <>
                          {/* Turn Feedback */}
                          <p className="text-xs text-slate-300 leading-relaxed bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-500/20">
                            <strong className="text-indigo-400 block mb-0.5">Interviewer Evaluation:</strong>
                            {evalData.feedback}
                          </p>

                          {/* Strengths & Missing in Turn */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="bg-emerald-950/10 border border-emerald-500/20 p-3 rounded-xl">
                              <span className="font-bold text-emerald-400 block mb-1">Covered Concepts</span>
                              <ul className="space-y-1 list-disc list-inside text-slate-300">
                                {evalData.strongPoints.map((p, i) => (
                                  <li key={i}>{p}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-amber-950/10 border border-amber-500/20 p-3 rounded-xl">
                              <span className="font-bold text-amber-400 block mb-1">Missed Elements</span>
                              <ul className="space-y-1 list-disc list-inside text-slate-300">
                                {evalData.missingPoints.map((p, i) => (
                                  <li key={i}>{p}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Suggested Structure */}
                          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-xs text-slate-300">
                            <strong className="text-slate-400 block mb-0.5">Optimal Engineering Framework:</strong>
                            {evalData.suggestedStructure}
                          </div>

                          {/* Follow-up question preview */}
                          {evalData.followUpQuestion && (
                            <div className="bg-purple-950/20 border border-purple-500/20 p-3 rounded-xl text-xs text-purple-200">
                              <strong className="text-purple-400 block mb-0.5">Expected Follow-Up Probe:</strong>
                              {evalData.followUpQuestion}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-white/10">
          <div>
            <h4 className="text-sm font-bold text-white mb-0.5">Ready to strengthen your answers?</h4>
            <p className="text-xs text-slate-400">Launch an adaptive practice drill focused on your missed concepts.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/crack-mode"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/10"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              Practice in Crack Mode
            </Link>

            <Link
              href="/placements"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
            >
              Placement Hub
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
