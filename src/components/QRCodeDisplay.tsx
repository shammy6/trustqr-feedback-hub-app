
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeDisplayProps {
  qrData: string;
  businessName: string;
}

const QRCodeDisplay = ({ qrData, businessName }: QRCodeDisplayProps) => {
  const [qrImageUrl, setQrImageUrl] = useState("");
  const { toast } = useToast();

  // Generate QR code using a free API service
  const generateQRImage = () => {
    const size = 200;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrData)}`;
    setQrImageUrl(qrUrl);
  };

  // Generate QR code on component mount
  useState(() => {
    generateQRImage();
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      toast({
        title: "Copied!",
        description: "QR code link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `${businessName}-review-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Downloaded!",
      description: "QR code image saved to your downloads",
    });
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="text-lg text-trustqr-navy">Your QR Code is Ready!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-xl shadow-lg border-2 border-accent/20">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`}
              alt="Generated QR Code"
              className="w-48 h-48"
              onLoad={() => setQrImageUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`)}
            />
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">QR Code Link:</p>
          <p className="text-xs font-mono bg-white p-2 rounded border break-all">{qrData}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleCopy}
            variant="outline"
            className="h-11 flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy Link
          </Button>
          <Button
            onClick={handleDownload}
            className="h-11 flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Print this QR code and place it where customers can easily scan it</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
