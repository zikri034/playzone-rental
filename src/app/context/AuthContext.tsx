import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../utils/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UserProfile {
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  membershipTier: "free" | "premium" | "vip";
  membershipStatus: string;
  createdAt: string;
}

interface UserSettings {
  userId: string;
  darkMode: boolean;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  rentalReminders: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  settings: UserSettings | null;
  accessToken: string | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  upgradeMembership: (tier: "free" | "premium" | "vip") => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Menggunakan Supabase Client langsung, bukan Edge Function
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        setProfile({
          userId: data.user_id,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          membershipTier: data.membership_tier,
          membershipStatus: data.membership_status,
          createdAt: data.created_at,
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const fetchSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        setSettings({
          userId: data.user_id,
          darkMode: data.dark_mode,
          notificationsEnabled: data.notifications_enabled,
          emailNotifications: data.email_notifications,
          pushNotifications: data.push_notifications,
          rentalReminders: data.rental_reminders,
        });
        if (data.dark_mode) document.documentElement.classList.add("dark");
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setAccessToken(session.access_token);
          await fetchProfile(session.user.id);
          await fetchSettings(session.user.id);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          setAccessToken(session.access_token);
          await fetchProfile(session.user.id);
          await fetchSettings(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setSettings(null);
          setAccessToken(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name } },
      });

      if (error) throw error;

      // 🔥 Otomatis buat data Profile dan Settings saat Sign Up
      if (data.user) {
        await supabase.from('profiles').insert([{ 
          user_id: data.user.id, 
          name: name, 
          email: email 
        }]);
        await supabase.from('settings').insert([{ 
          user_id: data.user.id 
        }]);
        
        await signIn(email, password);
      }
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        setUser(data.user);
        setAccessToken(data.session.access_token);
        await fetchProfile(data.user.id);
        await fetchSettings(data.user.id);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSettings(null);
      setAccessToken(null);
      document.documentElement.classList.remove("dark");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error("Not authenticated");
    try {
      // Mapping ke format database
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.avatar) dbUpdates.avatar = updates.avatar;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchProfile(user.id);
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) throw new Error("Not authenticated");
    try {
      const dbUpdates: any = {};
      if (updates.darkMode !== undefined) dbUpdates.dark_mode = updates.darkMode;
      if (updates.notificationsEnabled !== undefined) dbUpdates.notifications_enabled = updates.notificationsEnabled;
      
      const { error } = await supabase
        .from('settings')
        .update(dbUpdates)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchSettings(user.id);
    } catch (error) {
      console.error("Update settings error:", error);
      throw error;
    }
  };

  const upgradeMembership = async (tier: "free" | "premium" | "vip") => {
    if (!user) throw new Error("Not authenticated");
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ membership_tier: tier })
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchProfile(user.id);
    } catch (error) {
      console.error("Upgrade membership error:", error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const refreshSettings = async () => {
    if (user) await fetchSettings(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user, profile, settings, accessToken, loading,
        signUp, signIn, signOut, updateProfile, updateSettings,
        upgradeMembership, refreshProfile, refreshSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};