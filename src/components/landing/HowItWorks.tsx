import {
  Target,
  FileSearch,
  BookOpen,
  Edit3,
  Layers,
  Timer,
  BarChart2,
  TrendingUp,
  Award,
  ArrowRight,
} from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      step: "Goal",
      desc: "Select target exam and set realistic daily study hours.",
      icon: Target,
      color: "from-emerald-500 to-teal-600",
    },
    {
      num: "02",
      step: "Assess",
      desc: "Take a 15-min diagnostic check to map baseline readiness.",
      icon: FileSearch,
      color: "from-teal-500 to-emerald-600",
    },
    {
      num: "03",
      step: "Learn",
      desc: "High-yield concept summaries, key formulas & shortcuts.",
      icon: BookOpen,
      color: "from-emerald-600 to-teal-700",
    },
    {
      num: "04",
      step: "Practice",
      desc: "Topic-wise speed drills with stepwise breakdown.",
      icon: Edit3,
      color: "from-teal-600 to-emerald-700",
    },
    {
      num: "05",
      step: "PYQs",
      desc: "Verified previous year questions organized by weightage.",
      icon: Layers,
      color: "from-emerald-700 to-teal-800",
    },
    {
      num: "06",
      step: "Test",
      desc: "Full-length timed mock tests simulating the real exam UI.",
      icon: Timer,
      color: "from-teal-700 to-emerald-800",
    },
    {
      num: "07",
      step: "Analyze",
      desc: "Accuracy breakdown, speed-per-question, and negative marks audit.",
      icon: BarChart2,
      color: "from-amber-500 to-yellow-600",
    },
    {
      num: "08",
      step: "Improve",
      desc: "Smart re-test sets focusing strictly on your weak spots.",
      icon: TrendingUp,
      color: "from-emerald-600 to-teal-600",
    },
    {
      num: "09",
      step: "Crack",
      desc: "Walk into your exam center with peak confidence and win!",
      icon: Award,
      color: "from-emerald-500 to-emerald-700",
      highlight: true,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white border-y border-slate-200/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4">
            <span>The Proven 9-Stage Blueprint</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            How It Works
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            From your very first diagnostic question to cracking the selection list, every stage is structured for measurable progress.
          </p>

          {/* Stepper Pipeline Bar for Desktop */}
          <div className="mt-8 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hidden lg:flex items-center justify-between text-xs font-bold text-slate-700 shadow-inner">
            {steps.map((s, idx) => (
              <div key={s.step} className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-extrabold ${
                    s.highlight ? "bg-amber-500 shadow-xs" : "bg-emerald-600"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className={s.highlight ? "text-emerald-700 font-extrabold" : ""}>{s.step}</span>
                {idx < steps.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 9 Step Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className={`relative rounded-3xl p-6 border transition-all duration-200 ${
                  item.highlight
                    ? "bg-gradient-to-b from-emerald-50/80 to-white border-emerald-300 shadow-md ring-2 ring-emerald-500/20"
                    : "bg-white border-slate-200/80 hover:border-emerald-300 shadow-xs hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md shadow-emerald-600/15`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-300 font-mono">
                    {item.num}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {item.step}
                  </h3>
                  {item.highlight && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      Goal!
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
