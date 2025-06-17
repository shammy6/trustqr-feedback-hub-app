
import { useState } from "react";
import Header from "@/components/Header";
import QRGenerator from "@/components/QRGenerator";
import FeedbackAnalysis from "@/components/FeedbackAnalysis";
import Analytics from "@/components/Analytics";
import AlertSystem from "@/components/AlertSystem";
import Settings from "@/components/Settings";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("generator");

  const renderContent = () => {
    switch (activeTab) {
      case "generator":
        return <QRGenerator />;
      case "analysis":
        return <FeedbackAnalysis />;
      case "analytics":
        return <Analytics />;
      case "alerts":
        return <AlertSystem />;
      case "settings":
        return <Settings />;
      default:
        return <QRGenerator />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-6 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
