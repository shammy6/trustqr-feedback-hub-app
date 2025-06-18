
import QRGenerator from "./QRGenerator";
import FeedbackAnalysis from "./FeedbackAnalysis";
import Analytics from "./Analytics";

interface HomeProps {
  activeTab: string;
}

const Home = ({ activeTab }: HomeProps) => {
  const renderContent = () => {
    switch (activeTab) {
      case "generator":
        return <QRGenerator />;
      case "analysis":
        return <FeedbackAnalysis />;
      case "analytics":
        return <Analytics />;
      default:
        return <QRGenerator />;
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};

export default Home;
