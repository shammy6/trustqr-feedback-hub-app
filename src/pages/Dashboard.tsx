
import { useState } from "react";
import Header from "@/components/Header";
import Home from "@/components/Home";
import AlertSystem from "@/components/AlertSystem";
import Settings from "@/components/Settings";
import IntroAnimation from "@/components/IntroAnimation";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showIntro, setShowIntro] = useState(() => {
    const hasSeenIntro = sessionStorage.getItem('hasSeenTrustQRIntro');
    return !hasSeenIntro;
  });

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('hasSeenTrustQRIntro', 'true');
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
      case "generator":
      case "analysis":
      case "analytics":
        return <Home />;
      case "alerts":
        return <AlertSystem />;
      case "settings":
        return <Settings />;
      default:
        return <Home />;
    }
  };

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 sm:px-6 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
