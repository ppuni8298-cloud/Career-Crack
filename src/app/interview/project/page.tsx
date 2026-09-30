"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import {
  Layers,
  ArrowRight,
  BrainCircuit,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  ShieldAlert,
  Server,
} from "lucide-react";

interface TurnEvaluation {
  score: number;
  strongPoints: string[];
  missingPoints: string[];
  suggestedStructure: string;
  followUpQuestion: string;
  feedback: string;
}

export default function ProjectInterviewPage() {
  const router = useRouter();

  // Setup state
  const [projectName, setProjectName] = useState("");
  const [techStack, setTechStack] = useState("");
  const [architecture, setArchitecture] = useState("");
  const [challenges, setChallenges] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  // Turn state
  const [currentTurnOrder, setCurrentTurnOrder] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [latestEvaluation, setLatestEvaluation] = useState<TurnEvaluation | null>(null);
  const [nextQData, setNextQData] = useState<{ questionText: string; order: number } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      setStarting(true);
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewType: "PROJECT",
          projectContext: {
            name: projectName.trim(),
            techStack: techStack.trim() || "Full Stack",
            architecture: architecture.trim() || "Client-Server Architecture",
            challenges: challenges.trim() || "Performance & concurrency",
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSessionId(data.sessionId);
        setCurrentQuestion(data.firstQuestion.questionText);
        setCurrentTurnOrder(data.firstQuestion.order);
      } else {
        alert("Failed to initialize project interview.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || !sessionId) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/interview/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: userAnswer }),
      });

      if (res.ok) {
        const data = await res.json();
        setLatestEvaluation(data.evaluation);
        setIsCompleted(data.isCompleted);
        if (data.nextQuestion) {
          setNextQData(data.nextQuestion);
        }
      } else {
        alert("Failed to submit answer.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedNext = () => {
    if (isCompleted && sessionId) {
      router.push(`/interview/report/${sessionId}`);
    } else if (nextQData) {
      setCurrentQuestion(nextQData.questionText);
      setCurrentTurnOrder(nextQData.order);
      setUserAnswer("");
      setLatestEvaluation(null);
      setNextQData(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {!sessionId ? (
          <div>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold mb-3 tracking-wide uppercase">
                <Layers className="w-3.5 h-3.5" />
                Project Deep-Dive & Architecture Defense
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
                Project Defense Interview Round
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Interviewers frequently test whether you actually built your resume projects. Provide your project details to simulate rigorous architectural questioning, trade-off defenses, and scalability inquiries.
              </p>
            </div>

            <form onSubmit={handleStart} className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 sm:p-8 backdrop-blur-xl space-y-5">
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-300 font-bold block mb-2">
                  Project Title / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Task Scheduler / E-Commerce Microservices / AI Study Platform"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-300 font-bold block mb-2">
                  Technology Stack
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, Node.js, PostgreSQL, Redis, Docker, AWS S3"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-300 font-bold block mb-2">
                  Architecture Overview & Core Purpose
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe the data flow, main components, authentication, and core database entities..."
                  value={architecture}
                  onChange={(e) => setArchitecture(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition resize-none"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-300 font-bold block mb-2">
                  Key Technical Challenges & Bottlenecks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Handling race conditions during concurrent bookings, database query latency, real-time sync..."
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={starting || !projectName.trim()}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/20 flex items-center gap-2 transition disabled:opacity-50"
                >
                  {starting ? "Generating Architectural Questions..." : "Begin Project Defense"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Bar with Status */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Project: {projectName} &bull; Question {currentTurnOrder} of 3
                </span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                Defense Round
              </span>
            </div>

            {/* AI Question Box */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900/90 to-teal-950/30 border border-teal-500/30 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 flex-shrink-0">
                  <Server className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-xs uppercase font-bold tracking-wider text-teal-400 block mb-1">
                    System Design & Project Reviewer
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                    {currentQuestion}
                  </h2>
                </div>
              </div>
            </div>

            {/* Evaluation Drawer */}
            {latestEvaluation && (
              <div className="rounded-3xl bg-slate-900/90 border border-teal-500/30 p-6 sm:p-8 backdrop-blur-xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-400" />
                    <h3 className="text-base font-bold text-white">Architectural Evaluation</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Score:</span>
                    <span className="text-xl font-extrabold text-teal-400">{latestEvaluation.score}%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  {latestEvaluation.feedback}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {latestEvaluation.strongPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Areas to Defend Better
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {latestEvaluation.missingPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 mb-6 text-xs text-slate-300">
                  <strong className="text-slate-400 block mb-0.5">Recommended Explanation Structure:</strong>
                  {latestEvaluation.suggestedStructure}
                </div>

                <button
                  onClick={handleProceedNext}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-teal-500/10"
                >
                  {isCompleted ? "Complete Round & View Session Report" : "Next Question"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {!latestEvaluation && (
              <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                  <span>Defend your design choices, trade-offs, and scalability guarantees</span>
                  <span>{userAnswer.split(/\s+/).filter(Boolean).length} words</span>
                </div>

                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Explain why you chose this design, how you addressed edge cases, handled failure modes, and what metrics proved its effectiveness..."
                  rows={6}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60 transition resize-none mb-4"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !userAnswer.trim()}
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
                  >
                    {submitting ? "Analyzing Defense..." : "Submit Answer"}
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
