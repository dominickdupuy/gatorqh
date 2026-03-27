import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { ScheduleSection } from "./components/ScheduleSection";
import { TracksSection } from "./components/TracksSection";
import { FAQSection } from "./components/FAQSection";
import { SponsorsSection } from "./components/SponsorsSection";
import { Footer } from "./components/Footer";
import { RegisterPage } from "./components/RegisterPage";
import { SmoothScroll } from "./components/SmoothScroll";
import { useState } from "react";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "register">("home");

  if (currentPage === "register") {
    return (
      <>
        <SmoothScroll />
        <Navbar onNavigate={setCurrentPage} />
        <RegisterPage />
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <SmoothScroll />
      <Navbar onNavigate={setCurrentPage} />
      <HeroSection onNavigate={setCurrentPage} />
      <div id="about">
        <AboutSection />
      </div>
      <div id="schedule">
        <ScheduleSection />
      </div>
      <div id="tracks">
        <TracksSection />
      </div>
      <div id="faq">
        <FAQSection />
      </div>
      <div id="sponsors">
        <SponsorsSection />
      </div>
      <Footer />
    </div>
  );
}