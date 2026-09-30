import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CAREER CRACK 🌱 | Crack Your Exam. Build Your Career.",
  description:
    "One smart platform for competitive exams, government jobs and placements. Master 5,000+ Questions, verified Previous Year Questions (PYQs), Mock Tests, and AI Learning.",
  keywords: [
    "Career Crack",
    "Competitive Exams",
    "UPSC CSE",
    "SSC CGL",
    "State PSC",
    "Placement Preparation",
    "DSA Practice",
    "PYQ",
  ],
  authors: [{ name: "Career Crack Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} scroll-smooth antialiased`}>
      <body className="min-h-screen bg-[#FAFBF9] text-slate-900 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
