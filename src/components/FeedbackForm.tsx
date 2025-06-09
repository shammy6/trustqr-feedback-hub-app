
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    rating: "",
    feedback: "",
    wouldRecommend: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rating || !formData.feedback) {
      toast({
        title: "Please complete the form",
        description: "Rating and feedback are required",
        variant: "destructive"
      });
      return;
    }

    // Simulate form submission
    console.log("Feedback submitted:", formData);
    
    // Redirect logic based on rating
    const rating = parseInt(formData.rating);
    
    if (rating >= 4) {
      // Redirect to Google Reviews (in real app, this would be customizable per business)
      toast({
        title: "Thank you for your feedback!",
        description: "Redirecting you to leave a Google review...",
      });
      // In real app: window.location.href = "https://google.com/reviews/...";
    } else {
      // Show "We're Sorry" page
      setIsSubmitted(true);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setFormData({ ...formData, rating: (i + 1).toString() })}
        className={`text-2xl transition-colors ${
          i < rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-200"
        }`}
      >
        ⭐
      </button>
    ));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-2xl">😞</span>
            </div>
            <CardTitle className="text-xl text-red-600">We're Sorry!</CardTitle>
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
                className="min-h-[100px]"
              />
            </div>
            
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              Submit Additional Feedback
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>A manager will review your feedback and may contact you directly.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full trustqr-gradient flex items-center justify-center">
            <span className="text-white font-bold">T</span>
          </div>
          <CardTitle className="text-xl text-trustqr-navy">Share Your Experience</CardTitle>
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
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Would you recommend us to others?</Label>
              <RadioGroup 
                value={formData.wouldRecommend} 
                onValueChange={(value) => setFormData({ ...formData, wouldRecommend: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="recommend-yes" />
                  <Label htmlFor="recommend-yes">Yes, absolutely!</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maybe" id="recommend-maybe" />
                  <Label htmlFor="recommend-maybe">Maybe</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="recommend-no" />
                  <Label htmlFor="recommend-no">No, probably not</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              type="submit" 
              className="w-full trustqr-emerald-gradient text-white hover:opacity-90"
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
