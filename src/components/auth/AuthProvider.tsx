
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  name: string;
  business_name: string;
  email: string;
  business_uuid: string;
  review_page_link?: string;
  alert_email?: string;
  business_logo?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  signUp: (email: string, password: string, name: string, businessName: string, businessUuid?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      // Now select all columns including the new ones
      const { data, error } = await supabase
        .from('users')
        .select('id, name, business_name, email, business_uuid, review_page_link, alert_email, business_logo')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else if (data) {
        console.log('User profile fetched:', data);
        setUserProfile({
          id: data.id,
          name: data.name,
          business_name: data.business_name,
          email: data.email,
          business_uuid: data.business_uuid,
          review_page_link: data.review_page_link,
          alert_email: data.alert_email,
          business_logo: data.business_logo,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, businessName: string, businessUuid?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          business_name: businessName,
          business_uuid: businessUuid || crypto.randomUUID(),
        },
      },
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resendConfirmation = async (email: string) => {
    await supabase.auth.resend({
      type: 'signup',
      email,
    });
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      console.log('Updating profile with:', updates);
      
      // Build the update object with all possible fields
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.business_name !== undefined) dbUpdates.business_name = updates.business_name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.review_page_link !== undefined) dbUpdates.review_page_link = updates.review_page_link;
      if (updates.alert_email !== undefined) dbUpdates.alert_email = updates.alert_email;
      if (updates.business_logo !== undefined) dbUpdates.business_logo = updates.business_logo;

      const { error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', user.id);

      if (error) {
        console.error('Update profile error:', error);
        return { error };
      }

      console.log('Profile updated successfully');

      // Update local state
      if (userProfile) {
        setUserProfile({ ...userProfile, ...updates });
      }

      return { error: null };
    } catch (error) {
      console.error('Update profile catch error:', error);
      return { error };
    }
  };

  const value = {
    user,
    userProfile,
    signUp,
    signIn,
    signOut,
    resendConfirmation,
    updateProfile,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
