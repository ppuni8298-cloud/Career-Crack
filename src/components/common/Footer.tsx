import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xl shadow-md shadow-emerald-500/20">
                🌱
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  CAREER CRACK
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">
                  Crack Your Exam. Build Your Career.
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The premier personalized learning platform for central government competitive exams, state PSC tests, and software engineering placements.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Exam Blueprint</span>
              </span>
            </div>
          </div>

          {/* Col 1: Government Exams */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Government Exams
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link href="/#choose-path" className="hover:text-emerald-400 transition-colors">UPSC Civil Services</Link></li>
              <li><Link href="/#choose-path" className="hover:text-emerald-400 transition-colors">SSC CGL & CHSL</Link></li>
              <li><Link href="/#choose-path" className="hover:text-emerald-400 transition-colors">IBPS Bank PO & Clerk</Link></li>
              <li><Link href="/#choose-path" className="hover:text-emerald-400 transition-colors">Railways RRB NTPC</Link></li>
              <li><Link href="/#choose-path" className="hover:text-emerald-400 transition-colors">Defence (CDS & AFCAT)</Link></li>
            </ul>
          </div>

          {/* Col 2: Placements */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Placements & Tech
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link href="/#choose-path" className="hover:text-emerald-400 transition-colors">Campus Aptitude & Reasoning</Link></li>
              <li><Link href="/#choose-path" className="hover:text-emerald-400 transition-colors">Data Structures & Algorithms</Link></li>
              <li><Link href="/#choose-path" className="hover:text-emerald-400 transition-colors">TCS & Infosys NQT Prep</Link></li>
              <li><Link href="/#choose-path" className="hover:text-emerald-400 transition-colors">Core CS Fundamentals</Link></li>
              <li><Link href="/#choose-path" className="hover:text-emerald-400 transition-colors">Mock Tech Interviews</Link></li>
            </ul>
          </div>

          {/* Col 3: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Student Login</Link></li>
              <li><Link href="/signup" className="hover:text-emerald-400 transition-colors">Create Free Account</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</Link></li>
              <li><Link href="/#difference" className="hover:text-emerald-400 transition-colors">Smart Personalization</Link></li>
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Student Dashboard</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Career Crack. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-slate-300 transition-colors">Honor Code</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
