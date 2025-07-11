import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Crown, Zap } from "lucide-react";

interface SubscriptionLockProps {
  title: string;
  description: string;
  features: string[];
  currentPlan?: string;
}

const SubscriptionLock = ({ 
  title, 
  description, 
  features, 
  currentPlan = "free" 
}: SubscriptionLockProps) => {
  const handleUpgrade = () => {
    // Navigate to pricing page or open upgrade modal
    console.log("Navigate to pricing page");
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Lock className="w-6 h-6 text-muted-foreground" />
          {title}
        </h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card className="trustqr-card max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-accent/10 rounded-full w-fit">
            <Crown className="w-8 h-8 text-accent" />
          </div>
          <CardTitle className="text-xl">Upgrade to Premium or VIP</CardTitle>
          <CardDescription>
            Unlock powerful AI analytics to grow your business faster
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
            <p className="text-sm text-muted-foreground mb-3">
              You're currently on the <span className="font-medium capitalize">{currentPlan}</span> plan
            </p>
            <p className="text-sm text-foreground">
              Upgrade to access advanced AI-powered sentiment analysis, performance insights, 
              and smart recommendations that help you understand your customers better.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              What you'll unlock:
            </h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <Button 
              onClick={handleUpgrade}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Premium
            </Button>
            <Button 
              variant="outline" 
              onClick={handleUpgrade}
              className="flex items-center gap-2 border-accent/30 text-accent hover:bg-accent/10"
            >
              <Zap className="w-4 h-4" />
              View All Plans
            </Button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              30-day money-back guarantee • Cancel anytime • Instant activation
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionLock;