
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import QRGenerator from "@/components/QRGenerator";
import FeedbackAnalysis from "@/components/FeedbackAnalysis";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("generator");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-trustqr-navy mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Generate QR codes and analyze customer feedback
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="generator" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              QR Generator
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              AI Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <QRGenerator />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <FeedbackAnalysis />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
