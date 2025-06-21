import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import QRCodeDisplay from "./QRCodeDisplay";
import { QrCode, Sparkles } from "lucide-react";
import { useAuth } from "./auth/AuthProvider";

const QRGenerator = () => {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [feedbackType, setFeedbackType] = useState("");
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrData, setQrData] = useState("");

  const handleGenerateQR = () => {
    if (!businessName || !feedbackType) return;
    
    // Generate unique QR data (in a real app, this would be a proper URL)
    const qrUrl = `https://trustqr.app/feedback/${businessName.toLowerCase().replace(/\s+/g, '-')}-${feedbackType}-${Date.now()}`;
    setQrData(qrUrl);
    setQrGenerated(true);
  };

  const handleReset = () => {
    setQrGenerated(false);
    setQrData("");
    setFeedbackType("");
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent" />
          QR Code Generator
        </h2>
        <p className="text-muted-foreground">
          Create a QR code for your customers to easily leave feedback
        </p>
      </div>

      <Card className="border-2 border-dashed border-accent/30 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full trustqr-emerald-gradient flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-xl text-foreground">Generate Your QR Code</CardTitle>
          <CardDescription>
            Create a QR code for your customers to easily leave feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!qrGenerated ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-sm font-medium">
                  Business Name
                </Label>
                <Input
                  id="businessName"
                  placeholder="e.g., Joe's Coffee Shop"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-12 bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedbackType" className="text-sm font-medium">
                  Select Feedback Type
                </Label>
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger className="h-12 bg-input border-border">
                    <SelectValue placeholder="Choose feedback type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="general">General Feedback</SelectItem>
                    <SelectItem value="post-visit">Post-Visit Experience</SelectItem>
                    <SelectItem value="complaint">Complaint & Issues</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerateQR}
                disabled={!businessName || !feedbackType}
                className="w-full h-12 trustqr-emerald-gradient text-white font-medium hover:opacity-90 transition-opacity"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Generate QR Code
              </Button>
            </>
          ) : (
            <div className="space-y-6">
              <QRCodeDisplay qrData={qrData} businessName={businessName} />
              
              <div className="flex gap-3">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 h-11 border-border"
                >
                  Generate New QR
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const handleGenerateQR = () => {
  if (!businessName || !feedbackType) return;
  
  // Generate unique QR data (in a real app, this would be a proper URL)
  const qrUrl = `https://trustqr.app/feedback/${businessName.toLowerCase().replace(/\s+/g, '-')}-${feedbackType}-${Date.now()}`;
  setQrData(qrUrl);
  setQrGenerated(true);
};

const handleReset = () => {
  setQrGenerated(false);
  setQrData("");
  setFeedbackType("");
};

export default QRGenerator;
