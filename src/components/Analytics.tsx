
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Users, Star, Calendar, Filter } from 'lucide-react';
import { useState } from 'react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [feedbackType, setFeedbackType] = useState('all');

  // Mock data for demonstration
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

  const stats = {
    totalFeedback: 401,
    positivePercentage: 79,
    negativePercentage: 21,
    averageRating: 4.3,
    weeklyGrowth: 12.5
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="trustqr-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalFeedback}</p>
              </div>
              <Users className="w-8 h-8 text-accent" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+{stats.weeklyGrowth}% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="trustqr-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold text-foreground">{stats.averageRating}/5</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="flex items-center mt-2">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(stats.averageRating) ? 'text-yellow-500 fill-current' : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="trustqr-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Positive Feedback</p>
                <p className="text-2xl font-bold text-green-500">{stats.positivePercentage}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <Progress value={stats.positivePercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="trustqr-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Needs Attention</p>
                <p className="text-2xl font-bold text-red-500">{stats.negativePercentage}%</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
            <Progress value={stats.negativePercentage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
  );
};

export default Analytics;
