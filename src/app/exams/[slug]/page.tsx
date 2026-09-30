"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Award,
  ArrowLeft,
  Play,
} from "lucide-react";
import PracticeSetupModal from "@/components/practice/PracticeSetupModal";

interface SubjectItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  order: number;
  topicCount: number;
  questionCount: number;
}

interface ExamDetailData {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  organization: string | null;
  state: string | null;
  logo: string | null;
  active: boolean;
  totalSubjects: number;
  totalQuestions: number;
  parentExam?: { id: string; name: string; slug: string } | null;
  variants?: Array<{ id: string; name: string; slug: string; description?: string | null }>;
  subjects: SubjectItem[];
}

export default function ExamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [data, setData] = useState<ExamDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d?.authenticated) setIsAuthenticated(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/exams/${slug}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Exam not found");
        }
        return res.json();
      })
      .then((json) => {
        if (json.exam) {
          setData(json.exam);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFBF9]">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 animate-pulse space-y-6">
          <div className="h-6 w-48 bg-slate-200 rounded-md" />
          <div className="h-64 bg-white rounded-3xl border border-slate-200/80" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-white rounded-3xl border border-slate-200/80" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFBF9]">
        <Navbar />
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-32 pb-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-2xl font-black text-slate-900">Exam Not Found</h2>
          <p className="text-sm text-slate-600 mt-2">
            We couldn't find the examination track you were looking for. It may have been renamed or moved.
          </p>
          <div className="mt-6">
            <Link
              href="/exams"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Exams</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryBadge = {
    GOVERNMENT: "bg-emerald-50 text-emerald-800 border-emerald-200",
    STATE_GOVERNMENT: "bg-teal-50 text-teal-800 border-teal-200",
    PLACEMENT: "bg-amber-50 text-amber-900 border-amber-200",
  }[data.category] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBF9]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link href="/" className="hover:text-emerald-700 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/exams" className="hover:text-emerald-700 transition-colors">
            Exams
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">{data.name}</span>
        </nav>

        {/* Exam Hero Banner */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm relative overflow-hidden mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-3xl shadow-xs">
                  {data.logo || "🏛️"}
                </div>
                <div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryBadge}`}
                  >
                    {data.category.replace("_", " ")}
                  </span>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mt-1">
                    {data.name}
                  </h1>
                </div>
              </div>

              {data.organization && (
                <p className="text-xs sm:text-sm font-bold text-emerald-700">
                  {data.organization}
                  {data.state ? ` · ${data.state}` : ""}
                </p>
              )}

              <p className="text-sm text-slate-600 leading-relaxed pt-1">
                {data.description}
              </p>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-bold text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>{data.totalSubjects} Syllabus Subjects</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{data.totalQuestions} Questions Available</span>
                </div>
              </div>
            </div>

            {/* Quick Practice CTA */}
            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
              <button
                onClick={() => setSetupModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all text-center cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Practice Drill</span>
              </button>

              <Link
                href={`/practice?exam=${data.slug}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all text-center"
              >
                <span>Browse Question Bank</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Exam Variants if any */}
          {data.variants && data.variants.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Exam Variants & Tiers:
              </div>
              <div className="flex flex-wrap gap-2">
                {data.variants.map((v) => (
                  <Link
                    key={v.id}
                    href={`/exams/${v.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-xs font-semibold text-slate-800 transition-colors"
                  >
                    <span>{v.name}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Subjects & Topics Breakdown Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Exam Subjects & Syllabus Breakdown
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                Choose a subject to practice specific topics or solve questions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.subjects.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 card-hover-lift flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base border border-emerald-100 group-hover:scale-105 transition-transform">
                      📖
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {sub.topicCount} Topics
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {sub.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {sub.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 text-xs font-bold text-slate-500">
                    <span className="text-emerald-800">
                      {sub.questionCount} Questions Available
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  <Link
                    href={`/practice?exam=${data.slug}&subject=${sub.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-600 transition-all cursor-pointer"
                  >
                    <span>Practice {sub.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Practice Setup Modal */}
        <PracticeSetupModal
          isOpen={setupModalOpen}
          onClose={() => setSetupModalOpen(false)}
          defaultExamId={data.id}
          isAuthenticated={isAuthenticated}
        />
      </main>

      <Footer />
    </div>
  );
}
