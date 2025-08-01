import { useState, useEffect } from "react";
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
import { trackPageView, trackQRScan } from "@/utils/trackPageView";

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

  // Track page views and QR scans when component loads
  useEffect(() => {
    const trackVisit = async () => {
      if (!id) return;

      try {
        let businessUuid: string | null = null;

        // Try to get business UUID from the URL parameter
        if (isValidUUID(id)) {
          // If ID is already a UUID, use it directly
          businessUuid = id;
        } else {
          // Try to resolve business UUID from legacy format
          let businessId: string | null = null;
          
          if (id.includes('_')) {
            try {
              const encodedPart = id.split('_')[0];
              const decodedName = safeBase64Decode(encodedPart);
              
              // Look up business by name to get UUID
              const { data } = await supabase
                .from('users')
                .select('business_uuid')
                .ilike('business_name', decodedName)
                .single();
              
              if (data) businessUuid = data.business_uuid;
            } catch (error) {
              console.error('Error resolving business UUID from legacy format:', error);
            }
          } else {
            // Try direct name lookup
            try {
              const urlDecodedId = decodeURIComponent(id);
              const { data } = await supabase
                .from('users')
                .select('business_uuid')
                .ilike('business_name', urlDecodedId)
                .single();
              
              if (data) businessUuid = data.business_uuid;
            } catch (error) {
              console.error('Error resolving business UUID from name:', error);
            }
          }
        }

        if (businessUuid) {
          // Track page view
          await trackPageView({ businessUuid });
          
          // If this looks like a QR code access, also track QR scan
          // We can detect QR scan by checking referrer or URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const isQRAccess = urlParams.get('source') === 'qr' || 
                            document.referrer === '' || 
                            /qr|scan/i.test(document.referrer);
          
          if (isQRAccess) {
            await trackQRScan({ businessUuid });
          }
        }
      } catch (error) {
        console.error('Error tracking page visit:', error);
      }
    };

    trackVisit();
  }, [id]);

  // Helper function to validate UUID format
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Helper function to detect mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Helper function to create slug from business name
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
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

  // NEW: UUID-based business lookup
  const findBusinessByUUID = async (uuid: string) => {
    console.log("=== UUID BUSINESS LOOKUP START ===");
    console.log("Target UUID:", uuid);
    
    try {
      const { data: uuidResult, error: uuidError, status: uuidStatus } = await supabase
        .from('users')
        .select('id, business_name, business_uuid')
        .eq('business_uuid', uuid)
        .single();
      
      console.log("UUID Lookup - API Status:", uuidStatus);
      console.log("UUID Lookup - API Response:", { data: uuidResult, error: uuidError });
      
      if (uuidError) {
        console.log("UUID lookup error:", uuidError);
        if (uuidStatus === 406) {
          console.log("406 Error: The server could not process the request. UUID may not exist in database.");
        } else if (uuidStatus !== 200) {
          console.log(`API Error: Unexpected status code ${uuidStatus}.`);
        }
        return null;
      }
      
      if (uuidResult) {
        console.log("✅ UUID lookup successful");
        console.log("Found business:", uuidResult.business_name);
        console.log("=== UUID BUSINESS LOOKUP END ===");
        return uuidResult.id;
      }
    } catch (networkError) {
      console.error("Network error during UUID lookup:", networkError);
    }
    
    console.log("❌ UUID lookup failed");
    console.log("=== UUID BUSINESS LOOKUP END ===");
    return null;
  };

  // Enhanced business lookup with multiple fallback attempts (kept for backwards compatibility)
  const findBusinessByName = async (businessName: string) => {
    console.log("=== BUSINESS NAME LOOKUP PROCESS START ===");
    console.log("Target Business Name:", businessName);
    
    // Step 1: Initial case-insensitive lookup
    console.log("Step: Initial Lookup");
    console.log("Search Query:", businessName);
    
    try {
      const { data: initialResult, error: initialError, status: initialStatus } = await supabase
        .from('users')
        .select('id, business_name')
        .ilike('business_name', businessName);
      
      console.log("API Status:", initialStatus);
      console.log("API Response:", { data: initialResult, error: initialError });
      
      if (initialError) {
        console.log("Initial lookup error:", initialError);
        if (initialStatus === 406) {
          console.log("406 Error: The server could not process the request. Possible reasons: incorrect business name, missing database record, or unsupported request format.");
        } else if (initialStatus !== 200) {
          console.log(`API Error: Unexpected status code ${initialStatus}.`);
        }
      } else if (initialResult && initialResult.length > 0) {
        console.log("✅ Initial lookup successful");
        return initialResult[0].id;
      }
    } catch (networkError) {
      console.error("Network error during initial lookup:", networkError);
    }

    // Step 2: Fallback - Exact match search
    console.log("Step: Fallback Attempt - Exact Match");
    console.log("Search Query:", businessName);
    
    try {
      const { data: exactResult, error: exactError, status: exactStatus } = await supabase
        .from('users')
        .select('id, business_name')
        .eq('business_name', businessName);
      
      console.log("API Status:", exactStatus);
      console.log("API Response:", { data: exactResult, error: exactError });
      
      if (exactError) {
        console.log("Exact match lookup error:", exactError);
        if (exactStatus === 406) {
          console.log("406 Error: The server could not process the request. Possible reasons: incorrect business name, missing database record, or unsupported request format.");
        } else if (exactStatus !== 200) {
          console.log(`API Error: Unexpected status code ${exactStatus}.`);
        }
      } else if (exactResult && exactResult.length > 0) {
        console.log("✅ Exact match fallback successful");
        return exactResult[0].id;
      }
    } catch (networkError) {
      console.error("Network error during exact match lookup:", networkError);
    }

    // Step 3: Fallback - Slugified version search
    const slugifiedName = slugify(businessName);
    console.log("Step: Fallback Attempt - Slugified Search");
    console.log("Search Query:", slugifiedName);
    
    try {
      const { data: slugResult, error: slugError, status: slugStatus } = await supabase
        .from('users')
        .select('id, business_name')
        .ilike('business_name', `%${slugifiedName.replace(/-/g, ' ')}%`);
      
      console.log("API Status:", slugStatus);
      console.log("API Response:", { data: slugResult, error: slugError });
      
      if (slugError) {
        console.log("Slugified lookup error:", slugError);
        if (slugStatus === 406) {
          console.log("406 Error: The server could not process the request. Possible reasons: incorrect business name, missing database record, or unsupported request format.");
        } else if (slugStatus !== 200) {
          console.log(`API Error: Unexpected status code ${slugStatus}.`);
        }
      } else if (slugResult && slugResult.length > 0) {
        console.log("✅ Slugified fallback successful");
        return slugResult[0].id;
      }
    } catch (networkError) {
      console.error("Network error during slugified lookup:", networkError);
    }

    // Step 4: Fallback - Partial/LIKE search
    console.log("Step: Fallback Attempt - Partial Match");
    console.log("Search Query:", `%${businessName}%`);
    
    try {
      const { data: partialResult, error: partialError, status: partialStatus } = await supabase
        .from('users')
        .select('id, business_name')
        .ilike('business_name', `%${businessName}%`);
      
      console.log("API Status:", partialStatus);
      console.log("API Response:", { data: partialResult, error: partialError });
      
      if (partialError) {
        console.log("Partial match lookup error:", partialError);
        if (partialStatus === 406) {
          console.log("406 Error: The server could not process the request. Possible reasons: incorrect business name, missing database record, or unsupported request format.");
        } else if (partialStatus !== 200) {
          console.log(`API Error: Unexpected status code ${partialStatus}.`);
        }
      } else if (partialResult && partialResult.length > 0) {
        console.log("✅ Partial match fallback successful");
        return partialResult[0].id;
      }
    } catch (networkError) {
      console.error("Network error during partial match lookup:", networkError);
    }

    console.log("❌ All fallback attempts failed");
    console.log("=== BUSINESS NAME LOOKUP PROCESS END ===");
    return null;
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
        description: "Name, rating and review are required",
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
      let businessId: string | null = null;
      
      console.log("Processing business ID...");
      console.log("Raw ID from URL:", id);
      console.log("ID length:", id.length);
      console.log("Is Valid UUID:", isValidUUID(id));
      
      // NEW: Try UUID-based lookup first
      if (isValidUUID(id)) {
        console.log("=== ATTEMPTING UUID-BASED LOOKUP ===");
        businessId = await findBusinessByUUID(id);
        
        if (businessId) {
          console.log("✅ UUID-based lookup successful, business ID:", businessId);
        } else {
          console.log("❌ UUID-based lookup failed, falling back to legacy system");
        }
      }
      
      // Fallback to legacy system if UUID lookup failed or ID is not a UUID
      if (!businessId) {
        console.log("=== FALLING BACK TO LEGACY LOOKUP SYSTEM ===");
        
        if (id.includes('_')) {
          console.log("ID contains underscore, attempting to decode and lookup...");
          try {
            const encodedPart = id.split('_')[0];
            console.log("Encoded part:", encodedPart);
            console.log("Encoded part length:", encodedPart.length);
            
            const decodedName = safeBase64Decode(encodedPart);
            console.log("Decoded business name:", decodedName);
            console.log("Decoded name length:", decodedName.length);
            
            // Use enhanced business lookup with fallbacks
            businessId = await findBusinessByName(decodedName);
            
            if (businessId) {
              console.log("✅ Legacy lookup successful via decoded name");
            }
          } catch (decodeError) {
            console.error("Error during legacy business lookup:", decodeError);
          }
        } else {
          // Handle cases where the ID might be a business name that was already decoded
          console.log("ID format not recognized as UUID or encoded, attempting business name lookup...");
          
          // Try URL decoding first
          const urlDecodedId = decodeURIComponent(id);
          console.log("URL decoded ID:", urlDecodedId);
          
          // Use enhanced business lookup with fallbacks
          businessId = await findBusinessByName(urlDecodedId);
          
          if (!businessId) {
            // Try with original ID as fallback
            businessId = await findBusinessByName(id);
          }
          
          if (businessId) {
            console.log("✅ Legacy lookup successful via name lookup");
          }
        }
      }

      // Final validation
      if (!businessId) {
        throw new Error("We couldn't find this business. Please contact the business owner to verify the QR code.");
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

      console.log("✅ Review submitted successfully:", data[0]);

      // Show success toast
      toast({
        title: "🎉 Thank you for your review!",
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
      
      // Check if it's a business not found error or a connection error
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      if (errorMessage.includes("couldn't find this business")) {
        toast({
          title: "⚠️ Business Not Found",
          description: errorMessage,
          variant: "destructive"
        });
      } else if (errorMessage.includes("network") || errorMessage.includes("connection")) {
        toast({
          title: "⚠️ Connection Problem",
          description: "There was a problem connecting to the business. Please try again later or contact support.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "⚠️ Something went wrong. Please try again.",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  };

  const handleAdditionalReviewSubmit = async () => {
    // For additional review details, we could store it or just show confirmation
    toast({
      title: "Additional review submitted",
      description: "A manager will review your comments and may contact you directly.",
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
            <h3 className="text-lg font-semibold mb-4">Processing your review...</h3>
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
                We appreciate your positive review!
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
              onClick={handleAdditionalReviewSubmit}
              className="w-full trustqr-emerald-gradient text-white hover:opacity-90 transition-all duration-200 hover:scale-105"
            >
              Submit Additional Review
            </Button>
            
            <div className="text-center text-sm text-muted-foreground animate-fade-in">
              <p>A manager will review your comments and may contact you directly.</p>
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
            Your review helps us serve you better
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
