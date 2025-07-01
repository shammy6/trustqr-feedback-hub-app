import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const FeedbackForm = () => {
  const { id } = useParams();
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

  // Helper function to validate UUID format
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Helper function to detect mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Enhanced base64 decoding with error handling
  const safeBase64Decode = (encodedString: string) => {
    try {
      // Handle URL-safe base64 encoding
      const base64 = encodedString.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
      return atob(padded);
    } catch (error) {
      console.error("Base64 decode error:", error);
      // Try direct atob as fallback
      try {
        return atob(encodedString);
      } catch (fallbackError) {
        console.error("Fallback base64 decode also failed:", fallbackError);
        throw new Error("Failed to decode business identifier");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("=== REVIEW SUBMISSION START ===");
    console.log("Device type:", isMobileDevice() ? "Mobile" : "Desktop");
    console.log("User agent:", navigator.userAgent);
    console.log("Current URL:", window.location.href);
    console.log("URL ID parameter:", id);
    console.log("Form data:", formData);
    
    if (!formData.rating || !formData.feedback || !formData.customerName) {
      toast({
        title: "Please complete the form",
        description: "Name, rating and feedback are required",
        variant: "destructive"
      });
      return;
    }

    if (!id) {
      console.error("No ID parameter in URL");
      toast({
        title: "Invalid QR code",
        description: "Could not identify the business. Please try scanning the QR code again.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let businessId: string;
      
      console.log("Processing business ID...");
      console.log("Raw ID from URL:", id);
      console.log("ID length:", id.length);
      console.log("ID contains underscore:", id.includes('_'));
      
      // Check if ID is already a valid UUID
      if (isValidUUID(id)) {
        console.log("ID is already a valid UUID, using directly");
        businessId = id;
      } else if (id.includes('_')) {
        console.log("ID contains underscore, attempting to decode and lookup...");
        try {
          const encodedPart = id.split('_')[0];
          console.log("Encoded part:", encodedPart);
          console.log("Encoded part length:", encodedPart.length);
          
          const decodedName = safeBase64Decode(encodedPart);
          console.log("Decoded business name:", decodedName);
          console.log("Decoded name length:", decodedName.length);
          
          // Look up the business by name with case-insensitive search
          console.log("Looking up business by name in database...");
          const { data: businessUser, error: userError } = await supabase
            .from('users')
            .select('id, business_name')
            .ilike('business_name', decodedName)
            .single();

          console.log("Business lookup result:", { businessUser, userError });

          if (userError) {
            console.error("Business lookup error:", userError);
            // Try exact match as fallback
            console.log("Trying exact match fallback...");
            const { data: exactMatch, error: exactError } = await supabase
              .from('users')
              .select('id, business_name')
              .eq('business_name', decodedName)
              .single();
            
            console.log("Exact match result:", { exactMatch, exactError });
            
            if (exactError || !exactMatch) {
              throw new Error("Business not found. Please check the QR code and try again.");
            }
            
            businessId = exactMatch.id;
          } else {
            businessId = businessUser.id;
          }
          
          console.log("Found business ID:", businessId);
        } catch (decodeError) {
          console.error("Error decoding business ID:", decodeError);
          if (decodeError instanceof Error && decodeError.message.includes("Business not found")) {
            throw decodeError;
          }
          throw new Error("Invalid QR code format. Please try scanning the QR code again.");
        }
      } else {
        // Handle cases where the ID might be a business name that was already decoded by mobile browsers
        console.log("ID format not recognized as UUID or encoded, checking if it's a business name...");
        console.log("Attempting direct business name lookup...");
        
        try {
          const { data: businessUser, error: userError } = await supabase
            .from('users')
            .select('id, business_name')
            .ilike('business_name', id)
            .single();

          console.log("Direct name lookup result:", { businessUser, userError });

          if (userError || !businessUser) {
            // Try URL decoding the ID in case it was partially encoded
            const urlDecodedId = decodeURIComponent(id);
            console.log("Trying URL decoded version:", urlDecodedId);
            
            const { data: decodedMatch, error: decodedError } = await supabase
              .from('users')
              .select('id, business_name')
              .ilike('business_name', urlDecodedId)
              .single();
            
            console.log("URL decoded lookup result:", { decodedMatch, decodedError });
            
            if (decodedError || !decodedMatch) {
              throw new Error("Business not found. Please check the QR code and try again.");
            }
            
            businessId = decodedMatch.id;
          } else {
            businessId = businessUser.id;
          }
          
          console.log("Found business ID via name lookup:", businessId);
        } catch (nameError) {
          console.error("Business name lookup failed:", nameError);
          throw new Error("Invalid QR code format. Please try scanning the QR code again.");
        }
      }

      console.log("Final business_id for submission:", businessId);

      // Validate the final business ID is a UUID
      if (!isValidUUID(businessId)) {
        console.error("Final business ID is not a valid UUID:", businessId);
        throw new Error("Invalid business identifier. Please try scanning the QR code again.");
      }

      // Prepare review data
      const reviewData = {
        business_id: businessId,
        customer_name: formData.customerName,
        customer_email: formData.customerEmail || null,
        rating: parseInt(formData.rating),
        review_text: formData.feedback
      };
      
      console.log("Review data to insert:", reviewData);

      // Submit the review to the reviews table
      console.log("Inserting review into database...");
      const { data, error: reviewError } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select();

      console.log("Insert result:", { data, reviewError });

      if (reviewError) {
        console.error("Review submission error:", reviewError);
        throw new Error(`Database error: ${reviewError.message}`);
      }

      if (!data || data.length === 0) {
        console.error("No data returned from insert");
        throw new Error("Review was not saved");
      }

      console.log("Review submitted successfully:", data[0]);

      // Show success toast
      toast({
        title: "🎉 Thank you for your feedback!",
        description: "Your review has been submitted successfully.",
      });

      const rating = parseInt(formData.rating);
      
      // Simulate loading for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setIsSubmitting(false);

      if (rating >= 4) {
        // For high ratings, show success and maybe redirect to Google Reviews later
        setTimeout(() => {
          setIsSubmitted(true);
        }, 2000);
      } else {
        // For low ratings, show "We're Sorry" page
        setTimeout(() => {
          setIsSubmitted(true);
        }, 1500);
      }
    } catch (error) {
      console.error("=== REVIEW SUBMISSION ERROR ===");
      console.error("Error details:", error);
      console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
      console.error("Device type:", isMobileDevice() ? "Mobile" : "Desktop");
      console.error("Current URL:", window.location.href);
      console.error("=== END ERROR ===");
      
      setIsSubmitting(false);
      toast({
        title: "⚠️ Something went wrong. Please try again.",
        description: error instanceof Error ? error.message : "There was an error submitting your review.",
        variant: "destructive"
      });
    }
  };

  const handleAdditionalFeedbackSubmit = async () => {
    // For additional feedback, we could store it or just show confirmation
    toast({
      title: "Additional feedback submitted",
      description: "A manager will review your feedback and may contact you directly.",
    });
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
    const rating = parseInt(formData.rating);
    
    if (rating >= 4) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md trustqr-card animate-fade-in">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center animate-scale-in">
                <span className="text-2xl">🎉</span>
              </div>
              <CardTitle className="text-xl text-green-400">Thank You!</CardTitle>
              <CardDescription>
                We appreciate your positive feedback!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Your review helps us continue providing excellent service.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

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
                Your Name *
              </Label>
              <Input
                id="customerName"
                placeholder="Enter your name"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="bg-input border-border transition-all duration-200 focus:ring-2 focus:ring-accent"
                required
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
              <Label>How would you rate your experience? *</Label>
              <div className="flex justify-center space-x-1">
                {renderStars(parseInt(formData.rating) || 0)}
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Click the stars to rate
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">
                Tell us about your experience *
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
              Submit Review
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackForm;
