
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const FeedbackAnalysis = () => {
  // Mock data for demonstration
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
    ],
    suggestions: [
      "Consider improving service speed based on recent feedback",
      "Maintain the excellent coffee quality that customers love",
      "Address temperature consistency issues"
    ]
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
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                <p className="text-2xl font-bold text-trustqr-navy">{feedbackData.totalResponses}</p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold text-trustqr-navy">{feedbackData.averageRating}/5</p>
              </div>
              <div className="text-2xl">⭐</div>
            </div>
          </CardContent>
        </Card>

        <Card>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧠 AI Sentiment Analysis
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

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>Latest customer responses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedbackData.recentFeedback.map((feedback) => (
            <div key={feedback.id} className="p-4 border rounded-lg bg-card/50">
              <div className="flex items-start justify-between mb-2">
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

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💡 AI Improvement Suggestions
          </CardTitle>
          <CardDescription>
            Based on your feedback analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {feedbackData.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-trustqr-light-emerald/30 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">{index + 1}</span>
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
