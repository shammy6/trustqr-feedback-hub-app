import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Crown, Star } from 'lucide-react';
import { useState } from 'react';

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const handleUpgrade = (plan: string) => {
    // Redirect to Razorpay payment links
    const razorpayLinks = {
      premium: isAnnual 
        ? 'https://rzp.io/l/premium-annual' 
        : 'https://rzp.io/l/premium-monthly',
      vip: isAnnual 
        ? 'https://rzp.io/l/vip-annual' 
        : 'https://rzp.io/l/vip-monthly'
    };
    
    // Open Razorpay in new tab
    window.open(razorpayLinks[plan as keyof typeof razorpayLinks], '_blank');
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for small businesses starting their reputation journey',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        'Unlimited QR review links',
        'Basic email review alerts',
        'Standard email support',
        'Web dashboard access',
        'Basic analytics insights'
      ],
      buttonText: 'Start Free Today',
      popular: false
    },
    {
      id: 'vip',
      name: 'VIP',
      description: 'Enterprise-grade solution for businesses serious about reputation management',
      monthlyPrice: 999,
      annualPrice: 799,
      features: [
        'Everything in Premium Plan',
        'Full custom branding (QR codes + review pages)',
        'Comprehensive monthly performance reports',
        'Dedicated account manager & consultation',
        'Priority feature integrations',
        'Advanced analytics dashboard with AI insights',
        'White-label solution options'
      ],
      buttonText: 'Start VIP Experience',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Advanced tools for growing businesses focused on reputation excellence',
      monthlyPrice: 399,
      annualPrice: 319,
      features: [
        'Everything in Free Plan',
        'AI-powered smart alert system',
        'Advanced review analytics & insights',
        'Priority customer support',
        'Custom response templates',
        'Detailed performance reports'
      ],
      buttonText: 'Upgrade to Premium',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent <span className="text-accent">Pricing</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Choose the perfect plan to protect and grow your business reputation
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly Billing
            </span>
            <Switch 
              checked={isAnnual} 
              onCheckedChange={setIsAnnual}
              className="bg-accent"
            />
            <span className={`text-sm ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual Billing (Save 20%)
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative trustqr-card ${
                plan.popular ? 'border-accent shadow-lg scale-105' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className="space-y-4">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-foreground">
                      ₹{isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      {plan.monthlyPrice > 0 && (
                        <span className="text-base font-normal text-muted-foreground">
                          /month
                        </span>
                      )}
                    </div>
                    {plan.monthlyPrice > 0 && isAnnual && (
                      <p className="text-sm text-muted-foreground">
                        Billed annually
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Button 
                  onClick={() => plan.id !== 'free' && handleUpgrade(plan.id)}
                  disabled={plan.id === 'free'}
                  className={`w-full ${
                    plan.popular 
                      ? 'trustqr-emerald-gradient text-white hover:opacity-90' 
                      : 'trustqr-gradient text-white hover:opacity-90'
                  }`}
                >
                  {plan.id === 'free' ? (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      {plan.buttonText}
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      {plan.buttonText}
                    </>
                  )}
                </Button>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Questions? We're here to help.
          </h3>
          <p className="text-muted-foreground mb-8">
            Contact our team for personalized guidance on choosing the right plan.
          </p>
          <p className="text-sm text-muted-foreground">
            7-day money-back guarantee • Cancel anytime • Instant activation
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => window.open('mailto:support@trustqr.app', '_blank')}
          >
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;