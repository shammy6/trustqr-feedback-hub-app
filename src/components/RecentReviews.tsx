import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, Send, CheckCircle, Mail, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useFollowUpSystem } from '@/hooks/useFollowUpSystem';

const RecentReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [followUpSentStatus, setFollowUpSentStatus] = useState<Record<string, boolean>>({});
  const [showAllPositive, setShowAllPositive] = useState(false);
  const [showAllNegative, setShowAllNegative] = useState(false);
  const { userProfile } = useAuth();
  const { stats, sendFollowUp, checkFollowUpSent } = useFollowUpSystem();

  // Fetch recent reviews and check follow-up status
  useEffect(() => {
    const fetchRecentReviews = async () => {
      if (!userProfile?.id) return;

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setReviews(data);
        
        // Check follow-up status for each review
        const statusMap: Record<string, boolean> = {};
        for (const review of data) {
          statusMap[review.id] = await checkFollowUpSent(review.id);
        }
        setFollowUpSentStatus(statusMap);
      }
    };

    fetchRecentReviews();
  }, [userProfile, checkFollowUpSent]);

  const handleSendFollowUp = async (review: any) => {
    if (!review.customer_email) return;
    
    const success = await sendFollowUp(review.id, review.customer_email, review.customer_name);
    if (success) {
      // Update local status
      setFollowUpSentStatus(prev => ({
        ...prev,
        [review.id]: true
      }));
    }
  };

  const getFollowUpButtonState = (review: any) => {
    const alreadySent = followUpSentStatus[review.id];
    const hasEmail = !!review.customer_email;
    const canSend = stats.hasAccess && stats.canSend && hasEmail && !alreadySent;
    
    if (!hasEmail) return { disabled: true, text: 'No Email', variant: 'outline' as const };
    if (alreadySent) return { disabled: true, text: 'Sent', variant: 'outline' as const, icon: CheckCircle };
    if (!stats.hasAccess) return { disabled: true, text: 'Upgrade Required', variant: 'outline' as const };
    if (!stats.canSend) return { disabled: true, text: 'Limit Reached', variant: 'outline' as const };
    
    return { disabled: false, text: 'Send Follow-up', variant: 'default' as const, icon: Send };
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const positiveReviews = reviews.filter((review: any) => review.rating >= 4);
  const negativeReviews = reviews.filter((review: any) => review.rating <= 2);

  const renderReviewList = (reviewList: any[], showAll: boolean, setShowAll: (value: boolean) => void) => {
    const displayedReviews = showAll ? reviewList : reviewList.slice(0, 5);
    
    if (reviewList.length === 0) {
      return (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No reviews in this category yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {displayedReviews.map((review: any) => {
          const buttonState = getFollowUpButtonState(review);
          const IconComponent = buttonState.icon;
          
          return (
            <div key={review.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-foreground truncate">{review.customer_name}</h4>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-500 fill-current' : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <Badge variant={review.rating >= 4 ? 'default' : review.rating <= 2 ? 'destructive' : 'secondary'}>
                      {review.rating >= 4 ? 'Positive' : review.rating <= 2 ? 'Negative' : 'Neutral'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{review.review_text}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{getRelativeTime(review.created_at)}</span>
                    {review.customer_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {review.customer_email}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <Button
                    onClick={() => handleSendFollowUp(review)}
                    disabled={buttonState.disabled}
                    variant={buttonState.variant}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
                    {buttonState.text}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        
        {reviewList.length > 5 && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="w-full sm:w-auto"
            >
              {showAll ? 'Show Less' : `View All ${reviewList.length} Reviews`}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-foreground">Recent Reviews</h2>
        <p className="text-muted-foreground">
          Manage customer reviews with smart follow-up actions
        </p>
      </div>

      <Tabs defaultValue="positive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="positive" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Positive Reviews ({positiveReviews.length})
          </TabsTrigger>
          <TabsTrigger value="negative" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Negative Reviews ({negativeReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="positive" className="space-y-4">
          <Card className="trustqr-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Positive Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderReviewList(positiveReviews, showAllPositive, setShowAllPositive)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="negative" className="space-y-4">
          <Card className="trustqr-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-red-500" />
                Negative Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderReviewList(negativeReviews, showAllNegative, setShowAllNegative)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecentReviews;