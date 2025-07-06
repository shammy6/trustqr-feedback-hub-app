import { supabase } from '@/integrations/supabase/client';

interface TrackPageViewParams {
  businessUuid: string;
  userAgent?: string;
  referrer?: string;
}

export const trackPageView = async ({ businessUuid, userAgent, referrer }: TrackPageViewParams) => {
  try {
    const { error } = await supabase
      .from('page_views')
      .insert({
        business_uuid: businessUuid,
        user_agent: userAgent || navigator.userAgent,
        referrer: referrer || document.referrer,
      });

    if (error) {
      console.error('Error tracking page view:', error);
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

export const trackQRScan = async ({ businessUuid, scanType = 'qr_code' }: { businessUuid: string; scanType?: string }) => {
  try {
    const { error } = await supabase
      .from('qr_scans')
      .insert({
        business_uuid: businessUuid,
        scan_type: scanType,
        user_agent: navigator.userAgent,
      });

    if (error) {
      console.error('Error tracking QR scan:', error);
    }
  } catch (error) {
    console.error('Error tracking QR scan:', error);
  }
};