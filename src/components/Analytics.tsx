
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Users, Star, Calendar, Filter, Eye, QrCode } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import FollowUpManager from '@/components/FollowUpManager';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [feedbackType, setFeedbackType] = useState('all');
  const [reviews, setReviews] = useState([]);
  const { userProfile } = useAuth();
  const { 
    totalReviews, 
    totalPageViews, 
    totalQrScans, 
    averageRating, 
    positivePercentage, 
    recentActivity, 
    isLoading 
  } = useRealtimeAnalytics();

  // Fetch recent reviews for follow-up system
  useEffect(() => {
    const fetchRecentReviews = async () => {
      if (!userProfile?.id) return;

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setReviews(data);
      }
    };

    fetchRecentReviews();
  }, [userProfile]);

  const negativePercentage = 100 - positivePercentage;

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

  // Mock chart data for visualization (can be enhanced later with real historical data)
  const dailyData = [
    { date: '2024-01-01', feedback: 12, positive: 8, negative: 4 },
    { date: '2024-01-02', feedback: 15, positive: 11, negative: 4 },
    { date: '2024-01-03', feedback: 8, positive: 6, negative: 2 },
    { date: '2024-01-04', feedback: 20, positive: 16, negative: 4 },
    { date: '2024-01-05', feedback: 18, positive: 14, negative: 4 },
    { date: '2024-01-06', feedback: 25, positive: 19, negative: 6 },
    { date: '2024-01-07', feedback: 22, positive: 17, negative: 5 }
  ];

  const weeklyData = [
    { week: 'Week 1', feedback: 87, positive: 68, negative: 19 },
    { week: 'Week 2', feedback: 94, positive: 73, negative: 21 },
    { week: 'Week 3', feedback: 102, positive: 81, negative: 21 },
    { week: 'Week 4', feedback: 118, positive: 94, negative: 24 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Track your feedback performance and customer satisfaction
          </p>
        </div>
        
        <div className="flex flex-row gap-3 w-full sm:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="flex-1 sm:w-[150px] bg-input border-border">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={feedbackType} onValueChange={setFeedbackType}>
            <SelectTrigger className="flex-1 sm:w-[150px] bg-input border-border">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="post-visit">Post-visit</SelectItem>
              <SelectItem value="complaint">Complaints</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="trustqr-card">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold text-foreground">{totalReviews}</p>
                </div>
                <Star className="w-8 h-8 text-accent" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="trustqr-card">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                  <p className="text-2xl font-bold text-foreground">{totalPageViews}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="trustqr-card">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">QR Scans</p>
                  <p className="text-2xl font-bold text-foreground">{totalQrScans}</p>
                </div>
                <QrCode className="w-8 h-8 text-purple-500" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="trustqr-card">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold text-foreground">{averageRating}/5</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            )}
            {!isLoading && (
              <div className="flex items-center mt-2">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(averageRating) ? 'text-yellow-500 fill-current' : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="trustqr-card">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Positive Rate</p>
                  <p className="text-2xl font-bold text-green-500">{positivePercentage}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            )}
            {!isLoading && (
              <Progress value={positivePercentage} className="mt-2" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Follow-up System */}
      <FollowUpManager reviews={reviews} />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="trustqr-card lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Live updates from your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'review' ? 'bg-yellow-100 text-yellow-600' :
                      activity.type === 'page_view' ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
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
        <div className="lg:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="trustqr-card">
            <CardHeader>
              <CardTitle>Daily Feedback Volume</CardTitle>
              <CardDescription>
                Feedback received over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="positive" stackId="a" fill="hsl(var(--accent))" />
                  <Bar dataKey="negative" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="trustqr-card">
            <CardHeader>
              <CardTitle>Weekly Trends</CardTitle>
              <CardDescription>
                Feedback trends over the last 4 weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="week" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="feedback" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
