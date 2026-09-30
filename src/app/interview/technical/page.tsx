"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import {
  Code2,
  Database,
  Cpu,
  Globe,
  Boxes,
  ArrowRight,
  BrainCircuit,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
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

export default function TechnicalInterviewPage() {
  const router = useRouter();

  // Setup state
  const [topic, setTopic] = useState("DSA");
  const [difficulty, setDifficulty] = useState("INTERMEDIATE");
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

  const topics = [
    { id: "DSA", name: "Data Structures & Algorithms", icon: Code2, desc: "Hash maps, Trees, Heaps, Dynamic Programming & Graphs" },
    { id: "DBMS", name: "Database Management Systems", icon: Database, desc: "ACID transactions, B-Tree indexes, Sharding & Normalization" },
    { id: "OS", name: "Operating Systems", icon: Cpu, desc: "Process scheduling, Virtual memory paging, Deadlocks & Threads" },
    { id: "NETWORKS", name: "Computer Networks", icon: Globe, desc: "TCP 3-way handshake, DNS resolution, HTTP/2 vs HTTP/3 & TLS" },
    { id: "OOP", name: "Object-Oriented Programming & Design", icon: Boxes, desc: "SOLID principles, Polymorphism & Design Patterns" },
  ];

  const handleStart = async () => {
    try {
      setStarting(true);
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewType: "TECHNICAL",
          topicOrRole: topic,
          difficulty,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSessionId(data.sessionId);
        setCurrentQuestion(data.firstQuestion.questionText);
        setCurrentTurnOrder(data.firstQuestion.order);
      } else {
        alert("Failed to initialize interview. Please try again.");
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
        alert("Failed to submit answer. Please try again.");
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
          /* Setup Configuration Screen */
          <div>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3 tracking-wide uppercase">
                <BrainCircuit className="w-3.5 h-3.5" />
                Technical Interview Round
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
                1-on-1 AI Technical Interview
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Experience simulated high-frequency technical questions. Answers are evaluated for conceptual clarity, edge cases, trade-offs, and communication structure with instant AI feedback.
              </p>
            </div>

            {/* Select Topic */}
            <div className="mb-8">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-3">
                1. Select Core Technical Subject
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topics.map((item) => {
                  const Icon = item.icon;
                  const isSelected = topic === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTopic(item.id)}
                      className={`p-4 rounded-2xl border text-left transition flex items-start gap-3.5 ${
                        isSelected
                          ? "bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                          : "bg-slate-900/60 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border ${isSelected ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400" : "bg-white/5 border-white/5 text-slate-400"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-0.5">{item.name}</h4>
                        <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Select Difficulty */}
            <div className="mb-10">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-3">
                2. Select Challenge Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["EASY", "INTERMEDIATE", "HARD"] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`py-3 px-4 rounded-2xl border text-center text-xs font-bold transition ${
                      difficulty === diff
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleStart}
                disabled={starting}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-indigo-500/20 flex items-center gap-2 transition transform active:scale-95 disabled:opacity-50"
              >
                {starting ? "Initializing Interviewer..." : "Begin Technical Interview"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Live Interview Interaction Screen */
          <div className="space-y-6">
            {/* Top Bar with Status */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {topic} Round &bull; Question {currentTurnOrder} of 3
                </span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                {difficulty}
              </span>
            </div>

            {/* AI Interviewer Question Box */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900/90 to-indigo-950/30 border border-indigo-500/30 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-xs uppercase font-bold tracking-wider text-indigo-400 block mb-1">
                    AI Technical Interviewer
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                    {currentQuestion}
                  </h2>
                </div>
              </div>
            </div>

            {/* Evaluation Drawer (shown after answering) */}
            {latestEvaluation && (
              <div className="rounded-3xl bg-slate-900/90 border border-emerald-500/30 p-6 sm:p-8 backdrop-blur-xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">AI Evaluation & Response Breakdown</h3>
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
                      <CheckCircle2 className="w-3.5 h-3.5" /> What You Did Well
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {latestEvaluation.strongPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Missing Elements / Edge Cases
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {latestEvaluation.missingPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 mb-6 text-xs text-slate-300">
                  <strong className="text-slate-400 block mb-0.5">Ideal Engineering Response Structure:</strong>
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

            {/* Answer Box (hidden once evaluated for current turn) */}
            {!latestEvaluation && (
              <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                  <span>Draft your response thoroughly (state definitions, trade-offs, and examples)</span>
                  <span>{userAnswer.split(/\s+/).filter(Boolean).length} words</span>
                </div>

                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Explain your approach, key principles, algorithmic time/space complexity, and practical considerations..."
                  rows={6}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition resize-none mb-4"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !userAnswer.trim()}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition"
                  >
                    {submitting ? "Analyzing Response..." : "Submit Answer"}
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
