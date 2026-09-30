import { Suspense } from "react";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#FAFBF9] flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl -z-10" />

      <Suspense fallback={<div className="p-8 text-slate-500">Loading onboarding...</div>}>
        <OnboardingWizard />
      </Suspense>
    </div>
  );
}
