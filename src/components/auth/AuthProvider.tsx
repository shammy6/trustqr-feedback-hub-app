
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string;
  business_name: string;
  email: string;
  review_page_link?: string;
  alert_email?: string;
  business_logo?: string;
}

interface AuthUser extends User {
  businessName?: string;
  reviewPageLink?: string;
  alertEmail?: string;
  businessLogo?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string, businessName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, businessName: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
      
      // Enhance user object with profile data
      if (user) {
        const enhancedUser: AuthUser = {
          ...user,
          businessName: data.business_name,
          reviewPageLink: data.review_page_link,
          alertEmail: data.alert_email,
          businessLogo: data.business_logo
        };
        setUser(enhancedUser);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to prevent deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, businessName: string) => {
    try {
      setIsLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            business_name: businessName
          }
        }
      });

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account."
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in"
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      setSession(null);
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out"
      });
      
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Alias methods for compatibility
  const login = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) throw error;
  };

  const signup = async (email: string, password: string, businessName: string) => {
    const { error } = await signUp(email, password, 'User', businessName);
    if (error) throw error;
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !userProfile) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: data.name || userProfile.name,
          business_name: data.business_name || userProfile.business_name,
          review_page_link: data.review_page_link,
          alert_email: data.alert_email,
          business_logo: data.business_logo
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      const updatedProfile = { ...userProfile, ...data };
      setUserProfile(updatedProfile);
      
      // Update enhanced user object
      const enhancedUser: AuthUser = {
        ...user,
        businessName: updatedProfile.business_name,
        reviewPageLink: updatedProfile.review_page_link,
        alertEmail: updatedProfile.alert_email,
        businessLogo: updatedProfile.business_logo
      };
      setUser(enhancedUser);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      session, 
      isLoading, 
      signUp, 
      signIn, 
      signOut,
      login,
      signup,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
