import Navbar from "@/components/common/Navbar";
import Hero from "@/components/landing/Hero";
import MotivationalSection from "@/components/landing/MotivationalSection";
import ChooseYourPath from "@/components/landing/ChooseYourPath";
import HowItWorks from "@/components/landing/HowItWorks";
import DifferenceSection from "@/components/landing/DifferenceSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/common/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBF9]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <MotivationalSection />
        <ChooseYourPath />
        <HowItWorks />
        <DifferenceSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
