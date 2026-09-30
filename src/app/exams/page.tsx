"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  Search,
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
  Building2,
  Landmark,
  Code2,
  CheckCircle2,
} from "lucide-react";

interface ExamCardData {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  organization: string | null;
  state: string | null;
  logo: string | null;
  active: boolean;
  subjectCount: number;
  questionCount: number;
  variants?: Array<{ id: string; name: string; slug: string }>;
}

export default function ExamsExplorerPage() {
  const [exams, setExams] = useState<ExamCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/exams")
      .then((res) => res.json())
      .then((data) => {
        if (data?.exams) {
          setExams(data.exams);
        }
      })
      .catch((err) => console.error("Error fetching exams:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesCategory =
        selectedCategory === "ALL" || exam.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        exam.name.toLowerCase().includes(q) ||
        (exam.organization && exam.organization.toLowerCase().includes(q)) ||
        (exam.description && exam.description.toLowerCase().includes(q)) ||
        (exam.state && exam.state.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [exams, selectedCategory, searchQuery]);

  const categories = [
    { id: "ALL", label: "All Exams", icon: Layers },
    { id: "GOVERNMENT", label: "Government Exams", icon: Landmark },
    { id: "STATE_GOVERNMENT", label: "State Government", icon: Building2 },
    { id: "PLACEMENT", label: "Placement Prep", icon: Code2 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBF9]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Structured Syllabus Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Choose Your Exam
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Find your path, choose your exam, and start preparing with purpose.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mt-8">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by exam name, commission, or state (e.g. SSC, KPSC, Placement)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                      : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-100" : "text-slate-400"}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-7 border border-slate-200/80 space-y-4"
              >
                <div className="flex justify-between">
                  <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
                  <div className="w-20 h-5 bg-slate-200 rounded-full" />
                </div>
                <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
                <div className="h-14 bg-slate-100 rounded-lg" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredExams.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 max-w-md mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
              🔍
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">No Exams Found</h3>
            <p className="text-xs text-slate-600 mt-1">
              No target examinations match your current query or category filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("ALL");
                setSearchQuery("");
              }}
              className="mt-5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Exam Cards Grid */}
        {!loading && filteredExams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch">
            {filteredExams.map((exam) => {
              const categoryBadge = {
                GOVERNMENT: "bg-emerald-50 text-emerald-800 border-emerald-200",
                STATE_GOVERNMENT: "bg-teal-50 text-teal-800 border-teal-200",
                PLACEMENT: "bg-amber-50 text-amber-900 border-amber-200",
              }[exam.category] || "bg-slate-50 text-slate-700 border-slate-200";

              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300 card-hover-lift flex flex-col justify-between group relative"
                  id={`exam-card-${exam.slug}`}
                >
                  <div>
                    {/* Top Icon & Category Badge */}
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-xs">
                        {exam.logo || "🏛️"}
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryBadge}`}
                      >
                        {exam.category.replace("_", " ")}
                      </span>
                    </div>

                    {/* Title & Organization */}
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {exam.name}
                    </h3>
                    {exam.organization && (
                      <p className="text-xs font-bold text-emerald-600 mt-0.5">
                        {exam.organization}
                        {exam.state ? ` · ${exam.state}` : ""}
                      </p>
                    )}

                    {/* Description */}
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {exam.description}
                    </p>

                    {/* Calculated Metrics */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-4 text-xs font-bold text-slate-600">
                      <div className="flex items-center gap-1.5 text-emerald-800">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{exam.subjectCount} Subjects</span>
                      </div>
                      <span>·</span>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exam.questionCount} Questions</span>
                      </div>
                    </div>

                    {/* Exam Variants tags if present */}
                    {exam.variants && exam.variants.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Includes:
                        </span>
                        {exam.variants.map((v) => (
                          <span
                            key={v.id}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700"
                          >
                            {v.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card CTA */}
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <Link
                      href={`/exams/${exam.slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-600 transition-all group-hover:shadow-md cursor-pointer"
                    >
                      <span>Start Preparing</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
