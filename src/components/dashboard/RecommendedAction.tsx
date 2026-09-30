"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Clock, Target, CheckCircle2, Zap, X, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

interface RecommendedActionProps {
  examName: string;
  onCompleted?: () => void;
}

export default function RecommendedAction({ examName, onCompleted }: RecommendedActionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Diagnostic mini-set for testing the action
  const sampleQuestions = [
    {
      q: "What is the remainder when (7^84) is divided by 342?",
      options: ["1", "7", "49", "341"],
      correct: 0,
      explanation: "7^3 = 343 = 342 + 1. Therefore, (7^3)^28 = (342 + 1)^28 ≡ 1 (mod 342). Remainder is 1.",
    },
    {
      q: "In a code language, if 'EXAM' is coded as 45 and 'CRACK' is coded as 46, what is 'SUCCESS'?",
      options: ["89", "93", "97", "101"],
      correct: 0,
      explanation: "Sum of reverse alphabetical positions + word length: S(8)+U(6)+C(24)+C(24)+E(22)+S(8)+S(8) - 1 = 89.",
    },
    {
      q: "Which Article of the Indian Constitution guarantees the Right to Constitutional Remedies?",
      options: ["Article 21", "Article 19", "Article 32", "Article 44"],
      correct: 2,
      explanation: "Article 32 was termed the 'Heart and Soul of the Constitution' by Dr. B.R. Ambedkar.",
    },
  ];

  const handleSelectOption = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === sampleQuestions[currentQ].correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQ < sampleQuestions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#059669", "#10B981", "#F59E0B"],
      });
      if (onCompleted) onCompleted();
    }
  };

  const resetModal = () => {
    setModalOpen(false);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setQuizFinished(false);
    setScore(0);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-7 text-white shadow-lg shadow-emerald-700/15 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/20 text-emerald-100 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Recommended Next Action</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Diagnostic Drill: Number Systems & High-Frequency Shortcuts
            </h3>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
              Based on recent trends for {examName}, mastering modular arithmetic and unit digit tricks boosts score by an average of +6 marks.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-emerald-100">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-300" />
                <span>15 Minutes</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-300" />
                <span>High Weightage Topic</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-300" />
                <span>+4 Readiness Pts</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-extrabold text-sm text-slate-900 bg-white hover:bg-emerald-50 shadow-xl shadow-black/10 hover:scale-105 transition-all duration-200 shrink-0 cursor-pointer"
            id="start-recommended-action-btn"
          >
            <span>Start Action Now</span>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* Interactive Diagnostic Drill Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            {!quizFinished ? (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full">
                      Question {currentQ + 1} of {sampleQuestions.length}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base mt-1">Diagnostic Quick Check</h4>
                  </div>
                  <button
                    onClick={resetModal}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Question text */}
                <div className="text-base font-bold text-slate-900 mb-6 leading-relaxed">
                  {sampleQuestions[currentQ].q}
                </div>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {sampleQuestions[currentQ].options.map((opt, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === sampleQuestions[currentQ].correct;
                    let btnStyle = "border-slate-200 hover:border-emerald-300 hover:bg-slate-50";

                    if (selectedAnswer !== null) {
                      if (isCorrect) {
                        btnStyle = "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold";
                      } else if (isSelected) {
                        btnStyle = "border-rose-500 bg-rose-50 text-rose-900";
                      } else {
                        btnStyle = "border-slate-200 text-slate-400 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelectOption(idx)}
                        disabled={selectedAnswer !== null}
                        className={`w-full p-3.5 rounded-2xl border text-left text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {selectedAnswer !== null && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {selectedAnswer !== null && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 mb-6 text-xs text-emerald-950 animate-in fade-in">
                    <span className="font-bold block mb-1">Concept Explanation:</span>
                    <span>{sampleQuestions[currentQ].explanation}</span>
                  </div>
                )}

                {/* Next Question */}
                <div className="flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswer === null}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {currentQ < sampleQuestions.length - 1 ? "Next Question" : "Complete Drill"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  <Trophy className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Drill Completed!</h3>
                <p className="text-sm text-slate-600 mt-2">
                  You scored <span className="font-bold text-emerald-700">{score} out of {sampleQuestions.length}</span>.
                  Your diagnostic calibration has been saved!
                </p>

                <div className="mt-8">
                  <button
                    onClick={resetModal}
                    className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
