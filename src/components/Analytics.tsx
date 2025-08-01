
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Users, Star, Calendar, Filter, Eye, QrCode, Send, Mail, CheckCircle, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { useFollowUpSystem } from '@/hooks/useFollowUpSystem';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [reviewType, setReviewType] = useState('all');
  const [reviews, setReviews] = useState([]);
  const [pageViews, setPageViews] = useState([]);
  const [qrScans, setQrScans] = useState([]);
  const [followUpSentStatus, setFollowUpSentStatus] = useState<Record<string, boolean>>({});
  const [showAllPositive, setShowAllPositive] = useState(false);
  const [showAllNegative, setShowAllNegative] = useState(false);
  const { userProfile } = useAuth();
  const { stats, sendFollowUp, checkFollowUpSent } = useFollowUpSystem();
  const { 
    totalReviews, 
    totalPageViews, 
    totalQrScans, 
    averageRating, 
    positivePercentage, 
    recentActivity, 
    isLoading 
  } = useRealtimeAnalytics();

  // Fetch filtered data based on time range and review type
  useEffect(() => {
    const fetchFilteredData = async () => {
      if (!userProfile?.id) return;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));

      // Fetch reviews with filters
      let reviewQuery = supabase
        .from('reviews')
        .select('*')
        .eq('business_id', userProfile.id)
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false });

      const { data: reviewData, error: reviewError } = await reviewQuery;

      if (!reviewError && reviewData) {
        setReviews(reviewData);
        
        // Check follow-up status for each review
        const statusMap: Record<string, boolean> = {};
        for (const review of reviewData) {
          statusMap[review.id] = await checkFollowUpSent(review.id);
        }
        setFollowUpSentStatus(statusMap);
      }

      // Fetch page views
      const { data: pageViewData } = await supabase
        .from('page_views')
        .select('*')
        .eq('business_uuid', userProfile.business_uuid)
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false });

      if (pageViewData) setPageViews(pageViewData);

      // Fetch QR scans
      const { data: qrScanData } = await supabase
        .from('qr_scans')
        .select('*')
        .eq('business_uuid', userProfile.business_uuid)
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false });

      if (qrScanData) setQrScans(qrScanData);
    };

    fetchFilteredData();
  }, [userProfile, checkFollowUpSent, timeRange, reviewType]);

  const negativePercentage = 100 - positivePercentage;
  const positiveReviews = reviews.filter((review: any) => review.rating >= 4);
  const negativeReviews = reviews.filter((review: any) => review.rating <= 2);

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

  // Helper function to get relative time
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Generate real-time chart data based on actual review data
  const generateDailyData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Filter reviews for this specific date
      const dayReviews = reviews.filter((review: any) => {
        const reviewDate = new Date(review.created_at).toISOString().split('T')[0];
        return reviewDate === dateStr;
      });
      
      const reviewCount = dayReviews.length;
      const positive = dayReviews.filter((r: any) => r.rating >= 4).length;
      const negative = dayReviews.filter((r: any) => r.rating <= 2).length;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        reviews: reviewCount,
        positive,
        negative
      });
    }
    return data;
  };

  const generateWeeklyData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      // Filter reviews for this week
      const weekReviews = reviews.filter((review: any) => {
        const reviewDate = new Date(review.created_at);
        return reviewDate >= weekStart && reviewDate <= weekEnd;
      });
      
      const reviewCount = weekReviews.length;
      const positive = weekReviews.filter((r: any) => r.rating >= 4).length;
      const negative = weekReviews.filter((r: any) => r.rating <= 2).length;
      
      data.push({
        week: `Week ${4 - i}`,
        reviews: reviewCount,
        positive,
        negative
      });
    }
    return data;
  };

  const dailyData = generateDailyData();
  const weeklyData = generateWeeklyData();

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Track your review performance and customer satisfaction
          </p>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-[160px] bg-popover border-border">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={reviewType} onValueChange={setReviewType}>
            <SelectTrigger className="w-full sm:w-[160px] bg-popover border-border">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="post-visit">Post-visit</SelectItem>
              <SelectItem value="complaint">Complaints</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        <Dialog>
          <DialogTrigger asChild>
            <Card className="trustqr-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Reviews</p>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">{totalReviews}</p>
                    </div>
                    <Star className="w-6 h-6 sm:w-8 sm:h-8 text-accent flex-shrink-0" />
                  </div>
                )}
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>All Reviews ({totalReviews})</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No reviews yet</p>
              ) : (
                reviews.map((review: any) => (
                  <div key={review.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{review.customer_name}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{review.review_text}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Card className="trustqr-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Page Views</p>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">{totalPageViews}</p>
                    </div>
                    <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
                  </div>
                )}
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Page Views ({totalPageViews})</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {pageViews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No page views recorded</p>
              ) : (
                pageViews.map((view: any) => (
                  <div key={view.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Page Visit</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(view.created_at).toLocaleString()}
                      </span>
                    </div>
                    {view.referrer && (
                      <p className="text-sm text-muted-foreground">Referrer: {view.referrer}</p>
                    )}
                    {view.user_agent && (
                      <p className="text-xs text-muted-foreground truncate">Device: {view.user_agent}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Card className="trustqr-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">QR Scans</p>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">{totalQrScans}</p>
                    </div>
                    <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0" />
                  </div>
                )}
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>QR Scans ({totalQrScans})</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {qrScans.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No QR scans recorded</p>
              ) : (
                qrScans.map((scan: any) => (
                  <div key={scan.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">QR Code Scan</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(scan.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Type: {scan.scan_type || 'QR Code'}</p>
                    {scan.user_agent && (
                      <p className="text-xs text-muted-foreground truncate">Device: {scan.user_agent}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Card className="trustqr-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Average Rating</p>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">{averageRating}/5</p>
                    </div>
                    <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 flex-shrink-0" />
                  </div>
                )}
                {!isLoading && (
                  <div className="flex items-center mt-3">
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${
                            i < Math.floor(averageRating) ? 'text-yellow-500 fill-current' : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Rating Breakdown</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-5 gap-4">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = reviews.filter((r: any) => r.rating === rating).length;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={rating} className="text-center p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-sm font-medium mr-1">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      </div>
                      <p className="text-lg font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Recent Reviews by Rating</h4>
                {[5, 4, 3, 2, 1].map(rating => {
                  const ratingReviews = reviews.filter((r: any) => r.rating === rating);
                  if (ratingReviews.length === 0) return null;
                  return (
                    <div key={rating} className="border border-border rounded-lg p-3">
                      <h5 className="font-medium mb-2 flex items-center">
                        {rating} Star Reviews ({ratingReviews.length})
                        <div className="flex ml-2">
                          {Array.from({ length: rating }, (_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                          ))}
                        </div>
                      </h5>
                      {ratingReviews.slice(0, 3).map((review: any) => (
                        <div key={review.id} className="mb-2 p-2 bg-muted/30 rounded text-sm">
                          <p className="font-medium">{review.customer_name}</p>
                          <p className="text-muted-foreground">{review.review_text}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Card className="trustqr-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Positive Rate</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-500">{positivePercentage}%</p>
                    </div>
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
                  </div>
                )}
                {!isLoading && (
                  <Progress value={positivePercentage} className="mt-3" />
                )}
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Positive Reviews ({positiveReviews.length})</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {positiveReviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No positive reviews yet</p>
              ) : (
                positiveReviews.map((review: any) => (
                  <div key={review.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{review.customer_name}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{review.review_text}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Follow-up System Stats */}
      <Card className="trustqr-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Mail className="w-5 h-5 flex-shrink-0" />
                Smart Follow-Up System
              </CardTitle>
              <CardDescription className="text-sm">
                Send personalized follow-up messages to customers
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={userProfile?.plan_tier === 'vip' ? 'default' : userProfile?.plan_tier === 'premium' ? 'secondary' : 'outline'} className="text-xs">
                {(userProfile?.plan_tier || 'free').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {!stats.hasAccess ? (
            <div className="text-center py-6 sm:py-8">
              <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Upgrade Required</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                Smart follow-up messages are available for Premium and VIP users.
              </p>
              <Button className="trustqr-gradient text-white" onClick={() => window.location.href = '/app?tab=pricing'}>
                Upgrade Now
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">This Month Usage</span>
                <div className="text-right">
                  {stats.isUnlimited ? (
                    <Badge variant="default" className="text-xs">Unlimited</Badge>
                  ) : (
                    <span className="text-sm font-semibold">
                      {stats.used}/{stats.limit} used
                    </span>
                  )}
                </div>
              </div>
              
              {!stats.isUnlimited && (
                <div className="space-y-2">
                  <Progress value={(stats.used / stats.limit) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{stats.used} sent</span>
                    <span>{stats.limit - stats.used} remaining</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews with Follow-up Actions */}
      <Card className="trustqr-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Recent Reviews</CardTitle>
          <CardDescription className="text-sm">
            Customer reviews with smart follow-up actions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reviews yet</p>
          ) : (
            <TooltipProvider>
              <div className="space-y-3 sm:space-y-4">
                {reviews.slice(0, 10).map((review: any) => {
                  const buttonState = getFollowUpButtonState(review);
                  return (
                    <div key={review.id} className="flex flex-col space-y-3 p-3 sm:p-4 border border-border rounded-lg bg-card sm:flex-row sm:items-start sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col space-y-2 sm:space-y-1">
                          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                            <span className="font-medium text-sm break-words">{review.customer_name}</span>
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 sm:w-4 sm:h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} 
                                  />
                                ))}
                              </div>
                              {review.customer_email && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5 hidden sm:inline-flex">
                                  {review.customer_email}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {review.customer_email && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5 self-start sm:hidden">
                              {review.customer_email}
                            </Badge>
                          )}
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                            {review.review_text}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 sm:ml-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant={buttonState.variant}
                              disabled={buttonState.disabled}
                              onClick={() => handleSendFollowUp(review)}
                              className={`w-full text-xs sm:w-auto ${
                                followUpSentStatus[review.id] ? 'bg-green-100 text-green-700 border-green-200' : ''
                              }`}
                            >
                              {buttonState.icon && <buttonState.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
                              <span className="whitespace-nowrap">{buttonState.text}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            {!review.customer_email ? 'No email address provided' :
                             followUpSentStatus[review.id] ? 'Follow-up already sent for this review' :
                             !stats.hasAccess ? 'Upgrade to Premium or VIP to send follow-ups' :
                             !stats.canSend ? 'Monthly limit reached' :
                             'Send personalized follow-up email'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="trustqr-card lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
            <CardDescription className="text-sm">
              Live updates from your business
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="space-y-1 flex-1 min-w-0">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className={`p-2 rounded-full flex-shrink-0 ${
                      activity.type === 'review' ? 'bg-accent/20 text-accent' :
                      activity.type === 'page_view' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-purple-500/20 text-purple-500'
                    }`}>
                      {activity.type === 'review' ? <Star className="w-4 h-4" /> :
                       activity.type === 'page_view' ? <Eye className="w-4 h-4" /> :
                       <QrCode className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="trustqr-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Daily Review Volume</CardTitle>
                <CardDescription className="text-sm">
                  Reviews received over the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={dailyData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 11 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        tick={{ fontSize: 11 }}
                        width={30}
                      />
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }} 
                      />
                      <Bar dataKey="positive" stackId="a" fill="hsl(var(--accent))" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="negative" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="trustqr-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Weekly Trends</CardTitle>
                <CardDescription className="text-sm">
                  Review trends over the last 4 weeks
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={weeklyData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="week" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        tick={{ fontSize: 11 }}
                        width={30}
                      />
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }} 
                      />
                       <Line 
                        type="monotone" 
                        dataKey="reviews" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: 'hsl(var(--accent))', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
