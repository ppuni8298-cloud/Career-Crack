import Link from "next/link";
import { Landmark, Building2, Code2, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";

export default function ChooseYourPath() {
  const paths = [
    {
      id: "gov",
      title: "Government Exams",
      subtitle: "Central government competitive exams.",
      badge: "Central Services",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: Landmark,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      description:
        "Comprehensive syllabus coverage, concept breakdown, and speed drills for premier central recruitment tests.",
      exams: ["UPSC CSE (Prelims)", "SSC CGL & CHSL", "IBPS & SBI PO/Clerk", "Railways RRB NTPC", "Defence (CDS/NDA)"],
      features: ["Quantitative & Reasoning Mastery", "Static GK & General Science", "Speed Time Drills & Verified PYQ Vault"],
      href: "/signup?goal=GOVERNMENT",
    },
    {
      id: "state",
      title: "State Exams",
      subtitle: "State government competitive exams.",
      badge: "State PSC & Boards",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
      icon: Building2,
      iconBg: "bg-teal-50 text-teal-600 border-teal-100",
      description:
        "Curated preparation for state administrative services, police recruitment, group posts, and education examinations.",
      exams: ["State PSC (Group 1 & 2)", "Police SI & Constable", "State Revenue Inspector", "Teacher Eligibility (TET)", "Subordinate Boards"],
      features: ["State-Specific General Studies", "Regional Language Paper Basics", "Previous Pattern Trend Mapping"],
      href: "/signup?goal=STATE",
    },
    {
      id: "placements",
      title: "Placements",
      subtitle: "Aptitude, reasoning, coding, DSA and interviews.",
      badge: "Campus & Tech Roles",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
      icon: Code2,
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      description:
        "Everything needed to clear campus hiring drives, product company screening tests, and technical interviews.",
      exams: ["TCS / Infosys / Wipro NQT", "Product MNC Online Tests", "Data Structures & Algorithms", "Aptitude & Verbal", "System Design Basics"],
      features: ["Topic-Wise DSA Progression", "High-Frequency Aptitude Tricks", "Mock Online Assessment Simulator"],
      href: "/signup?goal=PLACEMENTS",
    },
  ];

  return (
    <section id="choose-path" className="py-20 md:py-28 bg-[#FAFBF9] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4">
            <span>Tailored Preparation Tracks</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Choose Your Path
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Whether your dream is a central prestigious service, state administrative role, or high-growth tech placement, we have structured the journey for you.
          </p>
        </div>

        {/* 3 Path Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {paths.map((path) => {
            const Icon = path.icon;
            return (
              <div
                key={path.id}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 card-hover-lift flex flex-col justify-between relative group"
              >
                <div>
                  {/* Top Badge and Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${path.iconBg} border flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${path.badgeColor}`}>
                      {path.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-2xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {path.title}
                  </h3>
                  <p className="mt-1.5 text-sm font-semibold text-emerald-600">
                    {path.subtitle}
                  </p>
                  <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                    {path.description}
                  </p>

                  {/* Exam Tags */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Target Exams
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {path.exams.map((exam) => (
                        <span
                          key={exam}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                        >
                          {exam}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Feature Bullets */}
                  <div className="mt-6 space-y-2.5">
                    {path.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <Link
                    href={path.href}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold text-slate-800 bg-slate-50 hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-600 transition-all duration-200 group-hover:shadow-md"
                  >
                    <span>Start Preparation</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
