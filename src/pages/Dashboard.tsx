
import { useState } from "react";
import Header from "@/components/Header";
import Home from "@/components/Home";
import AlertSystem from "@/components/AlertSystem";
import Settings from "@/components/Settings";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");

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
