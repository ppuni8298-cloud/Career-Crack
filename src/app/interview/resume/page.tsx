"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import {
  FileText,
  ArrowRight,
  BrainCircuit,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Award,
} from "lucide-react";

interface TurnEvaluation {
  score: number;
  strongPoints: string[];
  missingPoints: string[];
  suggestedStructure: string;
  followUpQuestion: string;
  feedback: string;
}

export default function ResumeInterviewPage() {
  const router = useRouter();

  // Setup state
  const [resumeText, setResumeText] = useState("");
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

  const sampleResume = `Skills: TypeScript, Next.js, Python, PostgreSQL, Redis, Docker, AWS
Experience: Software Engineering Intern at TechCorp. Built real-time notification engine with Redis Pub/Sub and WebSockets, reducing notification latency by 45%. Implemented database connection pooling in PostgreSQL handling 2,000 requests/second.
Projects: E-Commerce Microservice API with Stripe webhook reconciliation and idempotent order processing.`;

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    try {
      setStarting(true);
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewType: "RESUME",
          resumeText: resumeText.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSessionId(data.sessionId);
        const initialQ = data.currentQuestion || data.firstQuestion;
        setCurrentQuestion(initialQ?.questionText || "");
        setCurrentTurnOrder(initialQ?.order || 1);
      } else {
        alert("Failed to initialize resume interview.");
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3 tracking-wide uppercase">
                <FileText className="w-3.5 h-3.5" />
                Resume & Experience Scrutiny Round
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
                Resume-Derived Interview Simulator
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Paste your resume text, skills list, or experience bullets. The AI interviewer tests the veracity of your claimed skills, probes metrics in your work history, and flags exaggerations.
              </p>
            </div>

            <form onSubmit={handleStart} className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 sm:p-8 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider text-slate-300 font-bold block">
                  Paste Resume Content / Project & Experience Summary *
                </label>
                <button
                  type="button"
                  onClick={() => setResumeText(sampleResume)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Load Sample Profile
                </button>
              </div>

              <textarea
                rows={9}
                required
                placeholder="Paste your technical skills, work experience bullet points, or project descriptions here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none font-mono text-xs leading-relaxed"
              />

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={starting || !resumeText.trim()}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition disabled:opacity-50"
                >
                  {starting ? "Extracting Claims & Keywords..." : "Scan & Start Resume Interview"}
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
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Resume Cross-Examination &bull; Question {currentTurnOrder} of 3
                </span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Claim Verification
              </span>
            </div>

            {/* AI Question Box */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900/90 to-emerald-950/30 border border-emerald-500/30 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 block mb-1">
                    Senior Hiring Manager
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                    {currentQuestion}
                  </h2>
                </div>
              </div>
            </div>

            {/* Evaluation Drawer */}
            {latestEvaluation && (
              <div className="rounded-3xl bg-slate-900/90 border border-emerald-500/30 p-6 sm:p-8 backdrop-blur-xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">Claim Verification & Clarity Analysis</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Score:</span>
                    <span className="text-xl font-extrabold text-emerald-400">{latestEvaluation.score}%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  {latestEvaluation.feedback}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Substantiated Points
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {latestEvaluation.strongPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Vague or Unsubstantiated Areas
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {latestEvaluation.missingPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 mb-6 text-xs text-slate-300">
                  <strong className="text-slate-400 block mb-0.5">Recommended STAR Method Structure:</strong>
                  {latestEvaluation.suggestedStructure}
                </div>

                <button
                  onClick={handleProceedNext}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/10"
                >
                  {isCompleted ? "Complete Round & View Session Report" : "Next Question"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {!latestEvaluation && (
              <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                  <span>Explain the situation, actions you specifically owned, and verifiable results</span>
                  <span>{userAnswer.split(/\s+/).filter(Boolean).length} words</span>
                </div>

                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Detail your specific contribution, what architectural choices you made, how you validated outcomes, and what difficulties you overcame..."
                  rows={6}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition resize-none mb-4"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !userAnswer.trim()}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
                  >
                    {submitting ? "Evaluating Experience..." : "Submit Answer"}
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
