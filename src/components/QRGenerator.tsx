import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Download, RotateCcw } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from './auth/AuthProvider';

const QRGenerator = () => {
  const { userProfile } = useAuth();
  const [businessName, setBusinessName] = useState(userProfile?.business_name || '');
  const [feedbackType, setFeedbackType] = useState('general');
  const [qrData, setQrData] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);

  const handleGenerateQR = async () => {
    if (!businessName || !feedbackType) return;
    
    // Use the business_uuid from userProfile for the new UUID-based system
    const businessUuid = userProfile?.business_uuid;
    
    if (businessUuid) {
      // New UUID-based QR code format
      const feedbackUrl = `https://trustqr.app/feedback/${businessUuid}`;
      setQrData(feedbackUrl);
      console.log('Generated UUID-based QR code:', feedbackUrl);
    } else {
      // Fallback to old format for backwards compatibility
      const feedbackUrl = `https://trustqr.app/feedback/${btoa(businessName)}_${feedbackType}`;
      setQrData(feedbackUrl);
      console.log('Generated legacy QR code (no UUID available):', feedbackUrl);
    }
    
    setQrGenerated(true);
  };

  const handleReset = () => {
    setQrGenerated(false);
    setQrData('');
    setFeedbackType('general');
  };

  const downloadPDF = async () => {
    if (!qrData) return;
    
    try {
      const element = document.getElementById('qr-container');
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 150;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 30, 30, imgWidth, imgHeight);
      pdf.save(`${businessName}-qr-code.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
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
            <div className="flex flex-col items-center space-y-4 w-full">
              <div id="qr-container" className="p-4 bg-white rounded-md shadow inline-block">
                <QRCodeCanvas
                  value={qrData}
                  size={256}
                  level="M"
                  includeMargin={true}
                  className="max-w-full h-auto"
                />
              </div>
              
              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">
                  QR Code for: <span className="font-semibold">{businessName}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Type: {feedbackType.charAt(0).toUpperCase() + feedbackType.slice(1)} Feedback
                </p>
                {userProfile?.business_uuid && (
                  <p className="text-xs text-green-600 font-medium">
                    ✓ UUID-based (Improved reliability)
                  </p>
                )}
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="qrLink">QR Code Link</Label>
                <Input
                  id="qrLink"
                  value={qrData}
                  readOnly
                  className="w-full break-all p-2 rounded bg-white text-gray-800 border-border text-xs sm:text-sm"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-2 w-full">
                <Button
                  onClick={downloadPDF}
                  className="w-full trustqr-emerald-gradient text-white hover:opacity-90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full border-border"
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
