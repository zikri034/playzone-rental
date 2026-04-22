import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../utils/supabase/client";
import type { User } from "@supabase/supabase-js";

// --- INTERFACES (Tetap sama) ---
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

  // Jika fungsi-fungsi di bawah ini (fetchProfile/settings) juga Error CORS nanti, 
  // kita akan ubah ke query tabel manual. Untuk sekarang kita fokus di Sign Up.
  const API_BASE = `https://apxorxfvzmhwwyesxbhd.supabase.co/functions/v1/make-server-c7f52ad3`;

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const fetchSettings = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        if (data.darkMode) document.documentElement.classList.add("dark");
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
          await fetchProfile(session.access_token);
          await fetchSettings(session.access_token);
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
          await fetchProfile(session.access_token);
          await fetchSettings(session.access_token);
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

  // 🔥 PERBAIKAN FUNGSI SIGN UP
  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Kita gunakan SDK resmi Supabase, bukan fetch manual ke Edge Function
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name, // Menyimpan nama ke metadata user
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Jika berhasil, otomatis login
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
        await fetchProfile(data.session.access_token);
        await fetchSettings(data.session.access_token);
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
    if (!accessToken) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!accessToken) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      if (updatedSettings.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (error) {
      console.error("Update settings error:", error);
      throw error;
    }
  };

  const upgradeMembership = async (tier: "free" | "premium" | "vip") => {
    if (!accessToken) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE}/membership/upgrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ tier }),
      });
      if (!response.ok) throw new Error("Failed to upgrade membership");
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Upgrade membership error:", error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (accessToken) await fetchProfile(accessToken);
  };

  const refreshSettings = async () => {
    if (accessToken) await fetchSettings(accessToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        settings,
        accessToken,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        updateSettings,
        upgradeMembership,
        refreshProfile,
        refreshSettings,
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