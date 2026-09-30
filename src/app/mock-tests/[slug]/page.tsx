"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Play,
  ArrowLeft,
  Shield,
  Layers,
  Award,
  Info,
  CheckSquare,
  Square,
  BarChart2,
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  sectionOrder: number;
  questionCount: number;
  marksPerQuestion: number;
  negativeMarks: number;
  durationSeconds?: number;
  instructions?: string;
  subject?: {
    id: string;
    name: string;
    icon?: string;
  };
}

interface MockTestDetails {
  id: string;
  title: string;
  slug: string;
  description: string;
  mockType: string;
  difficulty: string;
  totalQuestions: number;
  durationSeconds: number;
  durationMinutes: number;
  totalMarks: number;
  passingMarks?: number;
  negativeMarks: number;
  navigationRule: string;
  isOfficialPattern: boolean;
  disclaimer?: string;
  exam: {
    id: string;
    name: string;
    slug: string;
    category: string;
    organization?: string;
    logo?: string;
    state?: string;
  };
  sections: Section[];
  userAttempts?: any[];
  activeAttempt?: {
    id: string;
    startedAt: string;
    remainingSeconds: number;
  } | null;
}

export default function MockTestInstructionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  const [test, setTest] = useState<MockTestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [language, setLanguage] = useState<"ENGLISH" | "HINDI">("ENGLISH");

  useEffect(() => {
    fetchTestDetails();
  }, [slug]);

  const fetchTestDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/mock-tests/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setTest(data.mockTest);
      } else {
        router.push("/mock-tests");
      }
    } catch (err) {
      console.error("Failed to load test details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (!test || (!agreed && !test.activeAttempt)) return;

    try {
      setStarting(true);
      const res = await fetch(`/api/mock-tests/${test.id}/attempts`, {
        method: "POST",
      });

      if (res.status === 401) {
        router.push(`/login?redirect=/mock-tests/${slug}`);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        router.push(`/mock-tests/live/${data.attemptId}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to start exam session.");
      }
    } catch (err) {
      console.error("Start exam error:", err);
      alert("Network error initiating test attempt.");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center pt-20">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 text-sm font-medium">Loading Examination Instructions...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">Test Not Found</h2>
          <Link
            href="/mock-tests"
            className="mt-4 inline-flex items-center gap-2 text-emerald-600 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-24 pt-20">
      {/* Top Breadcrumb & Title */}
      <div className="bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/mock-tests"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Mock Tests
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  {test.exam.name}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Pattern: {test.navigationRule}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {test.title}
              </h1>
            </div>

            {test.activeAttempt ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 animate-pulse">
                  Attempt in progress
                </span>
                <button
                  onClick={handleStartExam}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-600/20 inline-flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Resume Test
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Instructions Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Summary Pill Bar */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs text-center">
              <div>
                <span className="text-xs text-slate-400 font-medium">Duration</span>
                <p className="text-base font-extrabold text-slate-800">{test.durationMinutes} Mins</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Questions</span>
                <p className="text-base font-extrabold text-slate-800">{test.totalQuestions}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Total Marks</span>
                <p className="text-base font-extrabold text-slate-800">{test.totalMarks}</p>
              </div>
              <div className="col-span-3 sm:col-span-1 border-t sm:border-t-0 pt-2 sm:pt-0 sm:border-l border-slate-100">
                <span className="text-xs text-slate-400 font-medium">Negative Mark</span>
                <p className="text-base font-extrabold text-rose-600">-{test.negativeMarks}</p>
              </div>
            </div>

            {/* General Instructions Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Info className="w-5 h-5 text-emerald-600" />
                General Examination Instructions
              </h2>

              <ul className="text-xs sm:text-sm text-slate-600 space-y-2.5 list-disc pl-5 leading-relaxed">
                <li>
                  Total duration of the examination is <strong>{test.durationMinutes} minutes</strong>.
                </li>
                <li>
                  The clock will be set at the server. A countdown timer in the top right corner of the screen will display the remaining time available to you.
                </li>
                <li>
                  When the timer reaches zero, the examination will <strong>automatically conclude and submit</strong>. You do not need to manually click submit if time runs out.
                </li>
                <li>
                  For each correct answer, you will be awarded <strong>the specified positive marks</strong> for that section.
                </li>
                <li>
                  For each incorrect answer, <strong>{test.negativeMarks} marks</strong> will be deducted as negative marking penalty. Unanswered questions attract <strong>0 marks</strong>.
                </li>
              </ul>
            </div>

            {/* Question Palette Symbols Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Layers className="w-5 h-5 text-emerald-600" />
                Question Palette Status Colors
              </h2>
              <p className="text-xs text-slate-500">
                The Question Palette on the right of your test screen will show the status of each question using one of the following symbols:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    01
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-800">Not Visited</span>
                    <p className="text-slate-500">You have not visited this question yet.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/60 border border-rose-200/60">
                  <div className="w-8 h-8 rounded-lg bg-rose-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    02
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-rose-950">Not Answered</span>
                    <p className="text-rose-700">You have visited but not answered.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    03
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-emerald-950">Answered</span>
                    <p className="text-emerald-700">You have selected and saved an answer.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50/60 border border-purple-200/60">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    04
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-purple-950">Marked for Review</span>
                    <p className="text-purple-700">Marked for review without answering.</p>
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/60">
                  <div className="relative w-8 h-8 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    05
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-white" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-indigo-950">Answered & Marked for Review</span>
                    <p className="text-indigo-700">
                      Answered and marked for review. This answer <strong>will be evaluated</strong> during final scoring.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Regulations & Anti-Cheat Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Shield className="w-5 h-5 text-amber-600" />
                Anti-Cheat & Browser Regulations
              </h2>
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs sm:text-sm text-amber-900 space-y-2">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Strict Proctored Simulation Rules:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-amber-800">
                  <li>
                    Switching browser tabs or minimizing the examination window is tracked and flagged by the engine.
                  </li>
                  <li>
                    Do not press browser back or refresh buttons while taking the test. Responses are saved to the server automatically as you choose them.
                  </li>
                  <li>
                    We recommend clicking the <strong>Fullscreen</strong> icon once the exam begins for an uninterrupted experience.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar: Section Breakdown & Start Action */}
          <div className="space-y-6">
            {/* Section Breakdown Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-slate-400">
                Sectional Pattern
              </h3>
              <div className="space-y-3">
                {test.sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {idx + 1}. {sec.title}
                      </span>
                      <span className="text-slate-400">
                        {sec.questionCount} Questions • +{sec.marksPerQuestion} / -{sec.negativeMarks} Marks
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
                      {sec.questionCount * sec.marksPerQuestion} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Undertaking & Start Button Box */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-200/80 shadow-sm space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                  Default Language / माध्यम
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="ENGLISH">English</option>
                  <option value="HINDI">Hindi (हिंदी)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 leading-snug">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>
                    I have read and understood all the instructions above. I declare that I will adhere to the examination rules and start with a fair mindset.
                  </span>
                </label>
              </div>

              <button
                onClick={handleStartExam}
                disabled={(!agreed && !test.activeAttempt) || starting}
                className={`w-full py-3.5 px-4 rounded-xl text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2 ${
                  agreed || test.activeAttempt
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:scale-[1.01]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                {starting ? (
                  <>Preparing Test Engine...</>
                ) : test.activeAttempt ? (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Resume Live Exam
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> I am ready to begin
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-400">
                Clicking will open the real-time exam simulator and activate the timer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
