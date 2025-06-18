
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRGenerator from "./QRGenerator";
import FeedbackAnalysis from "./FeedbackAnalysis";
import Analytics from "./Analytics";
import { QrCode, Brain, BarChart3 } from "lucide-react";

const Home = () => {
  const [activeHomeTab, setActiveHomeTab] = useState("qr-generator");

  return (
    <div className="space-y-6">
      <Tabs value={activeHomeTab} onValueChange={setActiveHomeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="qr-generator" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">QR Generator</span>
            <span className="sm:hidden">QR</span>
          </TabsTrigger>
          <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">AI Analysis</span>
            <span className="sm:hidden">AI</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qr-generator" className="space-y-6">
          <QRGenerator />
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-6">
          <FeedbackAnalysis />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Analytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Home;
