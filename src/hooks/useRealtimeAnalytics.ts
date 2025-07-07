import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export interface ActivityItem {
  id: string;
  type: 'review' | 'page_view' | 'qr_scan';
  timestamp: string;
  description: string;
}

export interface AnalyticsData {
  totalReviews: number;
  totalPageViews: number;
  totalQrScans: number;
  averageRating: number;
  positivePercentage: number;
  recentActivity: ActivityItem[];
  isLoading: boolean;
}

export const useRealtimeAnalytics = (): AnalyticsData => {
  const { userProfile } = useAuth();
  const [data, setData] = useState<AnalyticsData>({
    totalReviews: 0,
    totalPageViews: 0,
    totalQrScans: 0,
    averageRating: 0,
    positivePercentage: 0,
    recentActivity: [],
    isLoading: true,
  });

  console.log('useRealtimeAnalytics - User Profile:', userProfile);
  console.log('useRealtimeAnalytics - Current Data:', data);

  // Helper function to format relative time
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Load initial data
  const loadInitialData = async () => {
    if (!userProfile?.business_uuid) {
      console.log('useRealtimeAnalytics - No business_uuid, setting loading to false');
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    console.log('useRealtimeAnalytics - Loading initial data for business:', userProfile.business_uuid);

    try {
      const [reviewsResult, pageViewsResult, qrScansResult] = await Promise.all([
        supabase
          .from('reviews')
          .select('rating, created_at, customer_name')
          .eq('business_id', userProfile.id),
        supabase
          .from('page_views')
          .select('created_at')
          .eq('business_uuid', userProfile.business_uuid),
        supabase
          .from('qr_scans')
          .select('created_at, scan_type')
          .eq('business_uuid', userProfile.business_uuid),
      ]);

      const reviews = reviewsResult.data || [];
      const pageViews = pageViewsResult.data || [];
      const qrScans = qrScansResult.data || [];

      console.log('useRealtimeAnalytics - Raw data:', {
        reviews: reviews.length,
        pageViews: pageViews.length,
        qrScans: qrScans.length
      });

      // Calculate analytics
      const totalReviews = reviews.length;
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;
      const positiveReviews = reviews.filter(r => r.rating >= 4).length;
      const positivePercentage = totalReviews > 0 
        ? Math.round((positiveReviews / totalReviews) * 100) 
        : 0;

      // Create recent activity
      const allActivity: ActivityItem[] = [
        ...reviews.map(r => ({
          id: `review-${r.created_at}`,
          type: 'review' as const,
          timestamp: r.created_at,
          description: `New review from ${r.customer_name}`,
        })),
        ...pageViews.map(p => ({
          id: `page-${p.created_at}`,
          type: 'page_view' as const,
          timestamp: p.created_at,
          description: 'Review page viewed',
        })),
        ...qrScans.map(q => ({
          id: `qr-${q.created_at}`,
          type: 'qr_scan' as const,
          timestamp: q.created_at,
          description: 'QR code scanned',
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
       .slice(0, 10);

      setData({
        totalReviews,
        totalPageViews: pageViews.length,
        totalQrScans: qrScans.length,
        averageRating: Math.round(averageRating * 10) / 10,
        positivePercentage,
        recentActivity: allActivity,
        isLoading: false,
      });

      console.log('useRealtimeAnalytics - Processed data:', {
        totalReviews,
        totalPageViews: pageViews.length,
        totalQrScans: qrScans.length,
        averageRating: Math.round(averageRating * 10) / 10,
        positivePercentage,
        activityCount: allActivity.length
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    console.log('useRealtimeAnalytics - Effect running, userProfile:', userProfile);
    
    if (!userProfile?.business_uuid) {
      console.log('useRealtimeAnalytics - No business_uuid available');
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    loadInitialData();

    // Set up real-time subscriptions
    console.log('useRealtimeAnalytics - Setting up real-time subscriptions');
    const channel = supabase
      .channel('analytics-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reviews',
          filter: `business_id=eq.${userProfile.id}`,
        },
        (payload) => {
          console.log('useRealtimeAnalytics - New review received:', payload);
          const newReview = payload.new as any;
          setData(prev => {
            const newTotalReviews = prev.totalReviews + 1;
            const currentTotal = prev.averageRating * prev.totalReviews;
            const newAverageRating = (currentTotal + newReview.rating) / newTotalReviews;
            const positiveReviews = newReview.rating >= 4 ? 1 : 0;
            const newPositivePercentage = Math.round(
              ((prev.positivePercentage * prev.totalReviews / 100) + positiveReviews) / newTotalReviews * 100
            );

            const newActivity: ActivityItem = {
              id: `review-${newReview.created_at}`,
              type: 'review',
              timestamp: newReview.created_at,
              description: `New review from ${newReview.customer_name}`,
            };

            return {
              ...prev,
              totalReviews: newTotalReviews,
              averageRating: Math.round(newAverageRating * 10) / 10,
              positivePercentage: newPositivePercentage,
              recentActivity: [newActivity, ...prev.recentActivity.slice(0, 9)],
            };
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'page_views',
          filter: `business_uuid=eq.${userProfile.business_uuid}`,
        },
        (payload) => {
          console.log('useRealtimeAnalytics - New page view received:', payload);
          const newPageView = payload.new as any;
          setData(prev => {
            const newActivity: ActivityItem = {
              id: `page-${newPageView.created_at}`,
              type: 'page_view',
              timestamp: newPageView.created_at,
              description: 'Review page viewed',
            };

            return {
              ...prev,
              totalPageViews: prev.totalPageViews + 1,
              recentActivity: [newActivity, ...prev.recentActivity.slice(0, 9)],
            };
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'qr_scans',
          filter: `business_uuid=eq.${userProfile.business_uuid}`,
        },
        (payload) => {
          console.log('useRealtimeAnalytics - New QR scan received:', payload);
          const newQrScan = payload.new as any;
          setData(prev => {
            const newActivity: ActivityItem = {
              id: `qr-${newQrScan.created_at}`,
              type: 'qr_scan',
              timestamp: newQrScan.created_at,
              description: 'QR code scanned',
            };

            return {
              ...prev,
              totalQrScans: prev.totalQrScans + 1,
              recentActivity: [newActivity, ...prev.recentActivity.slice(0, 9)],
            };
          });
        }
      )
      .subscribe();

    console.log('useRealtimeAnalytics - Subscriptions set up successfully');

    return () => {
      console.log('useRealtimeAnalytics - Cleaning up subscriptions');
      supabase.removeChannel(channel);
    };
  }, [userProfile?.business_uuid, userProfile?.id]);

  return data;
};