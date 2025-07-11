import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface FollowUpLimits {
  free: { limit: 0, hasAccess: false };
  premium: { limit: 20, hasAccess: true };
  vip: { limit: -1, hasAccess: true }; // -1 means unlimited
}

interface FollowUpStats {
  used: number;
  limit: number;
  hasAccess: boolean;
  canSend: boolean;
  isUnlimited: boolean;
}

export const useFollowUpSystem = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<FollowUpStats>({
    used: 0,
    limit: 0,
    hasAccess: false,
    canSend: false,
    isUnlimited: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const limits: FollowUpLimits = {
    free: { limit: 0, hasAccess: false },
    premium: { limit: 20, hasAccess: true },
    vip: { limit: -1, hasAccess: true },
  };

  const getCurrentMonthUsage = async () => {
    if (!userProfile?.business_uuid) return 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const { data, error } = await supabase
      .from('follow_up_logs')
      .select('id')
      .eq('business_uuid', userProfile.business_uuid)
      .gte('sent_at', startOfMonth.toISOString())
      .lte('sent_at', endOfMonth.toISOString());

    if (error) {
      console.error('Error fetching follow-up usage:', error);
      return 0;
    }

    return data?.length || 0;
  };

  const updateStats = async () => {
    if (!userProfile) return;

    const planTier = (userProfile.plan_tier || 'free').toLowerCase() as keyof FollowUpLimits;
    const planLimits = limits[planTier] || limits.free;
    const used = await getCurrentMonthUsage();

    const isUnlimited = planLimits.limit === -1;
    const canSend = planLimits.hasAccess && (isUnlimited || used < planLimits.limit);

    setStats({
      used,
      limit: planLimits.limit,
      hasAccess: planLimits.hasAccess,
      canSend,
      isUnlimited,
    });
    setIsLoading(false);
  };

  const sendFollowUp = async (reviewId: string, customerEmail: string, customerName: string) => {
    if (!userProfile?.business_uuid) {
      toast({
        title: "Error",
        description: "User profile not found",
        variant: "destructive",
      });
      return false;
    }

    if (!stats.canSend) {
      if (!stats.hasAccess) {
        toast({
          title: "Upgrade Required",
          description: "Follow-up messages are only available for Premium and VIP users.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Monthly Limit Reached",
          description: "You've reached your monthly limit. Upgrade to VIP for unlimited follow-ups.",
          variant: "destructive",
        });
      }
      return false;
    }

    try {
      // Insert follow-up log
      const { error: logError } = await supabase
        .from('follow_up_logs')
        .insert({
          business_uuid: userProfile.business_uuid,
          review_id: reviewId,
          method: 'email',
        });

      if (logError) throw logError;

      // Simulate sending email (replace with actual email service)
      console.log(`Sending follow-up email to ${customerEmail} for review ${reviewId}`);
      
      toast({
        title: "Follow-up Sent",
        description: `Follow-up email sent to ${customerName}`,
      });

      // Update stats
      await updateStats();
      
      return true;
    } catch (error) {
      console.error('Error sending follow-up:', error);
      toast({
        title: "Error",
        description: "Failed to send follow-up message",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    updateStats();
  }, [userProfile]);

  return {
    stats,
    isLoading,
    sendFollowUp,
    refreshStats: updateStats,
  };
};