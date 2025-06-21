
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Download, RotateCcw } from 'lucide-react';
import QRCode from 'qrcode';
import { useAuth } from './auth/AuthProvider';

const QRGenerator = () => {
  const { userProfile } = useAuth();
  const [businessName, setBusinessName] = useState(userProfile?.business_name || '');
  const [feedbackType, setFeedbackType] = useState('general');
  const [qrData, setQrData] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);

  const handleGenerateQR = async () => {
    if (!businessName || !feedbackType) return;
    
    const feedbackUrl = `${window.location.origin}/feedback/${btoa(businessName)}_${feedbackType}`;
    setQrData(feedbackUrl);
    setQrGenerated(true);
  };

  const handleReset = () => {
    setQrGenerated(false);
    setQrData('');
    setFeedbackType('general');
  };

  const downloadQR = async () => {
    if (!qrData) return;
    
    try {
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, qrData, {
        width: 300,
        margin: 2,
      });
      
      const link = document.createElement('a');
      link.download = `${businessName}-qr-code.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="trustqr-card">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full trustqr-gradient flex items-center justify-center">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-foreground">QR Code Generator</CardTitle>
          <CardDescription>Create custom QR codes for collecting feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!qrGenerated ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="Enter your business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedbackType">Feedback Type</Label>
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Feedback</SelectItem>
                    <SelectItem value="service">Service Quality</SelectItem>
                    <SelectItem value="product">Product Quality</SelectItem>
                    <SelectItem value="experience">Overall Experience</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerateQR}
                disabled={!businessName || !feedbackType}
                className="w-full trustqr-emerald-gradient text-white hover:opacity-90"
              >
                Generate QR Code
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-white p-6 rounded-lg inline-block">
                <canvas
                  ref={(canvas) => {
                    if (canvas && qrData) {
                      QRCode.toCanvas(canvas, qrData, {
                        width: 250,
                        margin: 2,
                      });
                    }
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  QR Code for: <span className="font-semibold">{businessName}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Type: {feedbackType.charAt(0).toUpperCase() + feedbackType.slice(1)} Feedback
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={downloadQR}
                  className="trustqr-emerald-gradient text-white hover:opacity-90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-border"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Generate New
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRGenerator;
