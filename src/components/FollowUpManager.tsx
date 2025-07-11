import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, AlertCircle, Crown, Zap } from 'lucide-react';
import { useFollowUpSystem } from '@/hooks/useFollowUpSystem';
import { useAuth } from '@/components/auth/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';

interface FollowUpManagerProps {
  reviews?: Array<{
    id: string;
    customer_name: string;
    customer_email: string | null;
    rating: number;
    review_text: string;
    created_at: string;
  }>;
}

const FollowUpManager = ({ reviews = [] }: FollowUpManagerProps) => {
  const { userProfile } = useAuth();
  const { stats, isLoading, sendFollowUp } = useFollowUpSystem();

  const planTier = userProfile?.plan_tier || 'free';
  const planName = planTier.charAt(0).toUpperCase() + planTier.slice(1);

  const handleSendFollowUp = async (review: typeof reviews[0]) => {
    if (!review.customer_email) return;
    
    await sendFollowUp(review.id, review.customer_email, review.customer_name);
  };

  const getPlanIcon = () => {
    switch (planTier.toLowerCase()) {
      case 'premium': return <Zap className="w-4 h-4" />;
      case 'vip': return <Crown className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getPlanBadgeVariant = () => {
    switch (planTier.toLowerCase()) {
      case 'premium': return 'purple';
      case 'vip': return 'gold';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Follow-up Stats Card */}
      <Card className="trustqr-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getPlanIcon()}
                Follow-up System
              </CardTitle>
              <CardDescription>
                Automatically send follow-up messages to customers
              </CardDescription>
            </div>
            <Badge variant={getPlanBadgeVariant() as any}>
              {planName}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : !stats.hasAccess ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upgrade Required</h3>
              <p className="text-muted-foreground mb-4">
                Follow-up messages are only available for Premium and VIP users.
              </p>
              <Button className="trustqr-gradient text-white">
                Upgrade to Premium
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Usage Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">This Month</span>
                </div>
                <div className="text-right">
                  {stats.isUnlimited ? (
                    <div className="flex items-center gap-1">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-semibold">Unlimited</span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold">
                      {stats.used}/{stats.limit} used
                    </span>
                  )}
                </div>
              </div>

              {!stats.isUnlimited && (
                <div className="space-y-2">
                  <Progress 
                    value={(stats.used / stats.limit) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{stats.used} sent</span>
                    <span>{stats.limit - stats.used} remaining</span>
                  </div>
                </div>
              )}

              {/* Upgrade Notice for Premium */}
              {planTier === 'premium' && !stats.isUnlimited && (
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <Crown className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Upgrade to VIP</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        Get unlimited follow-up messages and priority support.
                      </p>
                      <Button size="sm" variant="outline" className="text-xs">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews for Follow-up */}
      {stats.hasAccess && reviews.length > 0 && (
        <Card className="trustqr-card">
          <CardHeader>
            <CardTitle>Send Follow-ups</CardTitle>
            <CardDescription>
              Send personalized follow-up messages to recent customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{review.customer_name}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span 
                            key={i} 
                            className={`text-sm ${i < review.rating ? 'text-yellow-500' : 'text-muted-foreground'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-1">
                      {review.review_text}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!review.customer_email || !stats.canSend}
                    onClick={() => handleSendFollowUp(review)}
                    className="ml-4"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Send
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FollowUpManager;