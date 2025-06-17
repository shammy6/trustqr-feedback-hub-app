
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, TrendingDown, Lightbulb, Target } from "lucide-react";

const FeedbackAnalysis = () => {
  // Mock data for demonstration - in real app this would come from API
  const feedbackData = {
    totalResponses: 127,
    averageRating: 4.2,
    sentiment: {
      positive: 68,
      neutral: 22,
      negative: 10
    },
    recentFeedback: [
      {
        id: 1,
        customerName: "Sarah M.",
        rating: 5,
        feedback: "Amazing coffee and excellent service! Will definitely come back.",
        sentiment: "positive",
        timestamp: "2 hours ago"
      },
      {
        id: 2,
        customerName: "Mike R.",
        rating: 2,
        feedback: "Coffee was cold and service was slow. Not happy with the experience.",
        sentiment: "negative",
        timestamp: "5 hours ago"
      },
      {
        id: 3,
        customerName: "Emma L.",
        rating: 4,
        feedback: "Good coffee, nice atmosphere. Could improve the waiting time.",
        sentiment: "neutral",
        timestamp: "1 day ago"
      }
    ]
  };

  // Dynamic suggestions based on current performance
  const getSmartSuggestions = () => {
    const { positive, negative } = feedbackData.sentiment;
    
    if (positive >= 70) {
      return [
        "🎉 Excellent work! Your positive feedback rate is outstanding at " + positive + "%",
        "💡 Consider asking satisfied customers to leave reviews on Google to boost your online presence",
        "🔄 Maintain your current service standards - customers clearly love what you're doing"
      ];
    } else if (negative >= 20) {
      return [
        "⚠️ Address service speed issues mentioned in recent feedback",
        "🌡️ Implement temperature checks for beverages to ensure consistency",
        "📋 Consider staff training on customer service best practices"
      ];
    } else {
      return [
        "📈 Your feedback is trending positively - keep up the good work!",
        "🎯 Focus on converting neutral feedback to positive by addressing minor issues",
        "💪 Consider implementing a customer loyalty program to increase satisfaction"
      ];
    }
  };

  const getPerformanceInsight = () => {
    const { positive, negative, neutral } = feedbackData.sentiment;
    const trend = positive > 60 ? "positive" : negative > 20 ? "negative" : "stable";
    
    let insight = "";
    if (trend === "positive") {
      insight = `Your business is performing exceptionally well with ${positive}% positive feedback. Customers consistently praise your service quality and atmosphere. This strong performance indicates that your current operational strategies are highly effective.`;
    } else if (trend === "negative") {
      insight = `There are some areas that need attention, with ${negative}% negative feedback. The main concerns seem to be around service speed and product consistency. Addressing these issues could significantly improve customer satisfaction.`;
    } else {
      insight = `Your business shows steady performance with room for improvement. While ${positive}% of feedback is positive, the ${neutral}% neutral responses suggest opportunities to exceed customer expectations and create more memorable experiences.`;
    }
    
    return insight;
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      default: return '😐';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'negative': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Brain className="w-6 h-6 text-accent" />
          AI Feedback Analysis
        </h2>
        <p className="text-muted-foreground">
          Intelligent insights from your customer feedback
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="trustqr-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                <p className="text-2xl font-bold text-foreground">{feedbackData.totalResponses}</p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
          </CardContent>
        </Card>

        <Card className="trustqr-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold text-foreground">{feedbackData.averageRating}/5</p>
              </div>
              <div className="text-2xl">⭐</div>
            </div>
          </CardContent>
        </Card>

        <Card className="trustqr-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Positive Feedback</p>
                <p className="text-2xl font-bold text-accent">{feedbackData.sentiment.positive}%</p>
              </div>
              <div className="text-2xl">😊</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Analysis */}
      <Card className="trustqr-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Sentiment Analysis
          </CardTitle>
          <CardDescription>
            Automatic analysis of customer feedback sentiment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                😊 Positive
              </span>
              <span className="text-sm text-muted-foreground">{feedbackData.sentiment.positive}%</span>
            </div>
            <Progress value={feedbackData.sentiment.positive} className="h-2" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                😐 Neutral
              </span>
              <span className="text-sm text-muted-foreground">{feedbackData.sentiment.neutral}%</span>
            </div>
            <Progress value={feedbackData.sentiment.neutral} className="h-2" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                😞 Negative
              </span>
              <span className="text-sm text-muted-foreground">{feedbackData.sentiment.negative}%</span>
            </div>
            <Progress value={feedbackData.sentiment.negative} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Performance Insight Section */}
      <Card className="trustqr-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Performance Insight
          </CardTitle>
          <CardDescription>
            AI-powered analysis of your current business performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-accent/10 rounded-lg border-l-4 border-accent">
            <p className="text-sm text-foreground leading-relaxed">
              {getPerformanceInsight()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card className="trustqr-card">
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>Latest customer responses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedbackData.recentFeedback.map((feedback) => (
            <div key={feedback.id} className="p-4 border border-border rounded-lg bg-card/50">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{feedback.customerName}</span>
                  <Badge variant="outline" className={getSentimentColor(feedback.sentiment)}>
                    {getSentimentEmoji(feedback.sentiment)} {feedback.sentiment}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm">{"⭐".repeat(feedback.rating)}</span>
                  <span className="text-xs text-muted-foreground ml-2">{feedback.timestamp}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{feedback.feedback}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dynamic AI Suggestions */}
      <Card className="trustqr-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Smart Improvement Suggestions
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your current performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getSmartSuggestions().map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-background">{index + 1}</span>
                </div>
                <p className="text-sm text-foreground">{suggestion}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackAnalysis;
