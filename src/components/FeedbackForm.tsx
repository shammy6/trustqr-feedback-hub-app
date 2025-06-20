
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./auth/AuthProvider";
import { analyzeSentiment } from "@/utils/sentimentAnalyzer";

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    rating: "",
    feedback: "",
    wouldRecommend: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rating || !formData.feedback) {
      toast({
        title: "Please complete the form",
        description: "Rating and feedback are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const rating = parseInt(formData.rating);
    
    // Analyze sentiment
    const sentimentResult = analyzeSentiment(formData.feedback);
    
    console.log("Feedback submitted:", {
      ...formData,
      rating,
      sentiment: sentimentResult,
      timestamp: new Date().toISOString(),
      businessId: user?.email
    });
    
    // Store in localStorage for AlertSystem to pick up (low ratings only)
    if (rating <= 3) {
      const existingAlerts = JSON.parse(localStorage.getItem('feedbackAlerts') || '[]');
      const newAlert = {
        id: Date.now().toString(),
        type: rating === 1 ? 'urgent' : 'low_rating',
        customerName: formData.customerName || 'Anonymous Customer',
        customerEmail: formData.customerEmail || 'No email provided',
        rating: rating,
        feedback: formData.feedback,
        timestamp: 'Just now',
        reviewDate: new Date().toISOString(),
        isRead: false,
        severity: rating === 1 ? 'high' : rating === 2 ? 'high' : 'medium',
        wouldRecommend: formData.wouldRecommend,
        sentiment: sentimentResult.sentiment,
        sentimentEmoji: sentimentResult.emoji,
        sentimentSummary: sentimentResult.summary,
        sentimentConfidence: sentimentResult.confidence
      };
      
      existingAlerts.unshift(newAlert);
      localStorage.setItem('feedbackAlerts', JSON.stringify(existingAlerts));
      
      // Trigger a custom event to notify AlertSystem immediately
      window.dispatchEvent(new CustomEvent('newFeedbackAlert', { detail: newAlert }));
    }
    
    setIsSubmitting(false);

    if (rating >= 4) {
      // Redirect to Google Reviews
      const reviewPageLink = user?.reviewPageLink;
      toast({
        title: "Thank you for your feedback!",
        description: "Redirecting you to leave a Google review...",
      });
      
      if (reviewPageLink) {
        setTimeout(() => {
          window.open(reviewPageLink, '_blank');
        }, 2000);
      } else {
        toast({
          title: "Review page not configured",
          description: "Please ask the business owner to set up the review page link in settings.",
          variant: "destructive"
        });
      }
    } else {
      // Show "We're Sorry" page for ratings 1-3
      setIsSubmitted(true);
    }
  };

  const handleAdditionalFeedbackSubmit = () => {
    toast({
      title: "Additional feedback submitted",
      description: "A manager will review your feedback and may contact you directly.",
    });
    
    // Store additional feedback
    console.log("Additional feedback submitted for low rating");
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setFormData({ ...formData, rating: (i + 1).toString() })}
        className={`text-2xl transition-all duration-200 transform hover:scale-110 ${
          i < rating ? "text-yellow-400" : "text-gray-500 hover:text-yellow-200"
        }`}
      >
        ⭐
      </button>
    ));
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md trustqr-card animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full trustqr-gradient flex items-center justify-center animate-pulse">
              <img 
                src="/lovable-uploads/0de82d5c-c0ee-4561-882e-764c460eea3f.png" 
                alt="TrustQR Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <h3 className="text-lg font-semibold mb-4">Processing your feedback...</h3>
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md trustqr-card animate-fade-in">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center animate-scale-in">
              <span className="text-2xl">😞</span>
            </div>
            <CardTitle className="text-xl text-red-400">We're Sorry!</CardTitle>
            <CardDescription>
              We sincerely apologize that we didn't meet your expectations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="additionalFeedback">
                Please tell us more about what went wrong:
              </Label>
              <Textarea
                id="additionalFeedback"
                placeholder="Your detailed feedback helps us improve..."
                className="min-h-[100px] bg-input border-border transition-all duration-200 focus:ring-2 focus:ring-accent"
              />
            </div>
            
            <Button 
              onClick={handleAdditionalFeedbackSubmit}
              className="w-full trustqr-emerald-gradient text-white hover:opacity-90 transition-all duration-200 hover:scale-105"
            >
              Submit Additional Feedback
            </Button>
            
            <div className="text-center text-sm text-muted-foreground animate-fade-in">
              <p>A manager will review your feedback and may contact you directly.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md trustqr-card animate-fade-in">
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full trustqr-gradient flex items-center justify-center animate-scale-in">
            <img 
              src="/lovable-uploads/0de82d5c-c0ee-4561-882e-764c460eea3f.png" 
              alt="TrustQR Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <CardTitle className="text-xl text-foreground">Share Your Experience</CardTitle>
          <CardDescription>
            Your feedback helps us serve you better
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="customerName">
                Your Name (Optional)
              </Label>
              <Input
                id="customerName"
                placeholder="Enter your name"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="bg-input border-border transition-all duration-200 focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">
                Your Email (Optional)
              </Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="Enter your email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="bg-input border-border transition-all duration-200 focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="space-y-3">
              <Label>How would you rate your experience?</Label>
              <div className="flex justify-center space-x-1">
                {renderStars(parseInt(formData.rating) || 0)}
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Click the stars to rate
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">
                Tell us about your experience
              </Label>
              <Textarea
                id="feedback"
                placeholder="What did you think about our service?"
                value={formData.feedback}
                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                className="min-h-[100px] bg-input border-border transition-all duration-200 focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Would you recommend us to others?</Label>
              <RadioGroup 
                value={formData.wouldRecommend} 
                onValueChange={(value) => setFormData({ ...formData, wouldRecommend: value })}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 transition-all duration-200 hover:bg-muted/30 p-2 rounded">
                  <RadioGroupItem value="yes" id="recommend-yes" />
                  <Label htmlFor="recommend-yes">Yes, absolutely!</Label>
                </div>
                <div className="flex items-center space-x-2 transition-all duration-200 hover:bg-muted/30 p-2 rounded">
                  <RadioGroupItem value="maybe" id="recommend-maybe" />
                  <Label htmlFor="recommend-maybe">Maybe</Label>
                </div>
                <div className="flex items-center space-x-2 transition-all duration-200 hover:bg-muted/30 p-2 rounded">
                  <RadioGroupItem value="no" id="recommend-no" />
                  <Label htmlFor="recommend-no">No, probably not</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              type="submit" 
              className="w-full trustqr-emerald-gradient text-white hover:opacity-90 transition-all duration-200 hover:scale-105"
              disabled={isSubmitting}
            >
              Submit Feedback
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackForm;
