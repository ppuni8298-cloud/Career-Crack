"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Landmark,
  Building2,
  Code2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  Check,
  Target,
  SkipForward,
} from "lucide-react";

export default function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialGoal = searchParams.get("goal") || "";

  // Wizard state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form selections
  const [goalCategory, setGoalCategory] = useState<string>(initialGoal || "GOVERNMENT");
  const [targetExam, setTargetExam] = useState<string>("SSC CGL (Tier 1 & 2)");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "Quantitative Aptitude",
    "Logical Reasoning",
    "General Awareness",
  ]);
  const [dailyStudyHours, setDailyStudyHours] = useState<string>("2-4 hours");
  const [examDate, setExamDate] = useState<string>("");

  // Goal options
  const goalOptions = [
    {
      id: "GOVERNMENT",
      title: "Government Exams",
      desc: "Central government competitive exams (UPSC, SSC, Banking, Railways, Defence).",
      icon: Landmark,
      color: "emerald",
      badge: "Central Services",
      defaultExam: "SSC CGL (Tier 1 & 2)",
      exams: [
        "SSC CGL (Tier 1 & 2)",
        "UPSC Civil Services (Prelims)",
        "IBPS Bank PO / Clerk",
        "Railways RRB NTPC",
        "SBI PO / Clerk",
        "Defence (CDS & NDA)",
      ],
      suggestedSubjects: [
        "Quantitative Aptitude",
        "Logical Reasoning",
        "General Awareness",
        "English Comprehension",
        "Static General Knowledge",
      ],
    },
    {
      id: "STATE",
      title: "State Exams",
      desc: "State government competitive exams (State PSCs, Police, Group 1/2/4, Teaching).",
      icon: Building2,
      color: "teal",
      badge: "State PSC & Boards",
      defaultExam: "State PSC (General Studies)",
      exams: [
        "State PSC (General Studies)",
        "State Police Sub-Inspector",
        "State Revenue Inspector",
        "Group II & IV Services",
        "Teacher Eligibility Test (TET)",
      ],
      suggestedSubjects: [
        "General Studies & History",
        "State Polity & Geography",
        "Quantitative Aptitude",
        "Mental Ability & Reasoning",
        "Language Paper",
      ],
    },
    {
      id: "PLACEMENTS",
      title: "Placements",
      desc: "Aptitude, reasoning, coding, DSA and technical interviews for college & tech roles.",
      icon: Code2,
      color: "amber",
      badge: "Campus & Tech Roles",
      defaultExam: "Software Campus Placements",
      exams: [
        "Software Campus Placements",
        "TCS / Infosys / Wipro NQT",
        "Product MNC Coding & DSA",
        "Aptitude Screening Round",
        "Data Structures & Algorithms",
      ],
      suggestedSubjects: [
        "Data Structures & Algorithms",
        "Quantitative Aptitude",
        "Logical & Verbal Reasoning",
        "Operating Systems & DBMS",
        "System Design Basics",
      ],
    },
    {
      id: "MULTIPLE",
      title: "Multiple Goals",
      desc: "Balancing government exams with placement drives or multiple target papers.",
      icon: Sparkles,
      color: "emerald",
      badge: "Combined Track",
      defaultExam: "Government + Campus Placements",
      exams: [
        "Government + Campus Placements",
        "SSC + Banking Combined",
        "UPSC + State PSC Dual Track",
        "Tech Placement + GATE CS",
      ],
      suggestedSubjects: [
        "Quantitative Aptitude",
        "Logical Reasoning",
        "General Awareness",
        "Data Structures & Algorithms",
        "English Communication",
      ],
    },
  ];

  const currentGoalConfig = goalOptions.find((g) => g.id === goalCategory) || goalOptions[0];

  const handleGoalSelect = (id: string) => {
    setGoalCategory(id);
    const selected = goalOptions.find((g) => g.id === id);
    if (selected) {
      setTargetExam(selected.defaultExam);
      setSelectedSubjects(selected.suggestedSubjects.slice(0, 4));
    }
  };

  const toggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleComplete = async (skipDate = false) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalCategory,
          targetExam,
          targetSubjects: selectedSubjects,
          dailyStudyHours,
          targetExamDate: skipDate ? null : examDate || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save onboarding selections");
      }

      // Trigger celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#059669", "#10B981", "#F59E0B", "#34D399"],
      });

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-2xl shadow-emerald-500/5 my-8">
      {/* Step Stepper Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Step {step} of 2
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {step === 1 ? "What are you preparing for?" : "Customize your study blueprint"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
              step >= 1 ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
            }`}
          >
            1
          </div>
          <div className="w-8 h-0.5 bg-slate-200" />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
              step >= 2 ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
            }`}
          >
            2
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* STEP 1: What are you preparing for? */}
      {step === 1 && (
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Select your primary preparation track. You can adjust this anytime later.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goalOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = goalCategory === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleGoalSelect(opt.id)}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/40 shadow-md shadow-emerald-500/10"
                      : "border-slate-200 hover:border-emerald-200 bg-white hover:bg-slate-50/50"
                  }`}
                  id={`goal-option-${opt.id.toLowerCase()}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">{opt.title}</h3>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed font-normal">
                      {opt.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 cursor-pointer"
              id="onboarding-next-step-btn"
            >
              <span>Continue to Customization</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Exam, Subjects, Study Time, Optional Exam Date */}
      {step === 2 && (
        <div className="space-y-6">
          {/* 1. Target Exam */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Your Target Exam
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentGoalConfig.exams.map((exam) => (
                <button
                  type="button"
                  key={exam}
                  onClick={() => setTargetExam(exam)}
                  className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    targetExam === exam
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs"
                      : "border-slate-200 text-slate-700 hover:border-emerald-200"
                  }`}
                >
                  <span>{exam}</span>
                  {targetExam === exam && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Subjects */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Subjects To Focus On
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Select multiple</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentGoalConfig.suggestedSubjects.map((sub) => {
                const isChecked = selectedSubjects.includes(sub);
                return (
                  <button
                    type="button"
                    key={sub}
                    onClick={() => toggleSubject(sub)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center gap-2.5 cursor-pointer ${
                      isChecked
                        ? "border-emerald-500 bg-emerald-50/70 text-emerald-900"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center ${
                        isChecked ? "bg-emerald-600 text-white" : "border border-slate-300"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Daily Study Time */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Daily Study Time Commitment
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["1-2 hours", "2-4 hours", "4-6 hours", "6+ hours"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setDailyStudyHours(t)}
                  className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                    dailyStudyHours === t
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Clock className="w-4 h-4 mx-auto mb-1 text-slate-400" />
                  <span>{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Optional Exam Date */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Target Exam Date (Optional)</span>
              </label>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                Optional
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              If your notification date is out, we will calibrate your countdown and pacing.
            </p>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full sm:w-64 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              id="exam-date-input"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleComplete(true)}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                id="onboarding-skip-date-btn"
              >
                <SkipForward className="w-4 h-4" />
                <span>Skip Date & Finish</span>
              </button>

              <button
                type="button"
                onClick={() => handleComplete(false)}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 cursor-pointer"
                id="onboarding-finish-btn"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter My Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
