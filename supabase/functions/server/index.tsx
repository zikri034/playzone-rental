import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { supabase, verifyUser } from "./auth.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-c7f52ad3/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== AUTH ROUTES =====

// Sign up new user
app.post("/make-server-c7f52ad3/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log("Sign up error:", error);
      return c.json({ error: error.message }, 400);
    }

    // Create default user profile and settings
    if (data.user) {
      await kv.set(`user_profile:${data.user.id}`, {
        userId: data.user.id,
        name,
        email,
        avatar: null,
        membershipTier: "free",
        membershipStatus: "active",
        createdAt: new Date().toISOString(),
      });

      await kv.set(`user_settings:${data.user.id}`, {
        userId: data.user.id,
        darkMode: false,
        notificationsEnabled: true,
        emailNotifications: true,
        pushNotifications: false,
        rentalReminders: true,
      });
    }

    return c.json({ user: data.user, message: "User created successfully" });
  } catch (error) {
    console.log("Sign up error:", error);
    return c.json({ error: "Failed to create user" }, 500);
  }
});

// ===== PROFILE ROUTES =====

// Get user profile
app.get("/make-server-c7f52ad3/profile", async (c) => {
  const { user, error } = await verifyUser(c.req.header("Authorization"));
  
  if (error || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const profile = await kv.get(`user_profile:${user.id}`);
    
    if (!profile) {
      // Create default profile if it doesn't exist
      const defaultProfile = {
        userId: user.id,
        name: user.user_metadata?.name || "User",
        email: user.email,
        avatar: null,
        membershipTier: "free",
        membershipStatus: "active",
        createdAt: new Date().toISOString(),
      };
      await kv.set(`user_profile:${user.id}`, defaultProfile);
      return c.json(defaultProfile);
    }

    return c.json(profile);
  } catch (error) {
    console.log("Get profile error:", error);
    return c.json({ error: "Failed to get profile" }, 500);
  }
});

// Update user profile
app.put("/make-server-c7f52ad3/profile", async (c) => {
  const { user, error } = await verifyUser(c.req.header("Authorization"));
  
  if (error || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const updates = await c.req.json();
    const currentProfile = await kv.get(`user_profile:${user.id}`);

    const updatedProfile = {
      ...currentProfile,
      ...updates,
      userId: user.id, // Ensure userId cannot be changed
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user_profile:${user.id}`, updatedProfile);
    return c.json(updatedProfile);
  } catch (error) {
    console.log("Update profile error:", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// ===== SETTINGS ROUTES =====

// Get user settings
app.get("/make-server-c7f52ad3/settings", async (c) => {
  const { user, error } = await verifyUser(c.req.header("Authorization"));
  
  if (error || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const settings = await kv.get(`user_settings:${user.id}`);
    
    if (!settings) {
      // Create default settings if they don't exist
      const defaultSettings = {
        userId: user.id,
        darkMode: false,
        notificationsEnabled: true,
        emailNotifications: true,
        pushNotifications: false,
        rentalReminders: true,
      };
      await kv.set(`user_settings:${user.id}`, defaultSettings);
      return c.json(defaultSettings);
    }

    return c.json(settings);
  } catch (error) {
    console.log("Get settings error:", error);
    return c.json({ error: "Failed to get settings" }, 500);
  }
});

// Update user settings
app.put("/make-server-c7f52ad3/settings", async (c) => {
  const { user, error } = await verifyUser(c.req.header("Authorization"));
  
  if (error || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const updates = await c.req.json();
    const currentSettings = await kv.get(`user_settings:${user.id}`);

    const updatedSettings = {
      ...currentSettings,
      ...updates,
      userId: user.id, // Ensure userId cannot be changed
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user_settings:${user.id}`, updatedSettings);
    return c.json(updatedSettings);
  } catch (error) {
    console.log("Update settings error:", error);
    return c.json({ error: "Failed to update settings" }, 500);
  }
});

// ===== MEMBERSHIP ROUTES =====

// Upgrade membership
app.post("/make-server-c7f52ad3/membership/upgrade", async (c) => {
  const { user, error } = await verifyUser(c.req.header("Authorization"));
  
  if (error || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { tier } = await c.req.json();

    if (!["free", "premium", "vip"].includes(tier)) {
      return c.json({ error: "Invalid membership tier" }, 400);
    }

    const profile = await kv.get(`user_profile:${user.id}`);
    const updatedProfile = {
      ...profile,
      membershipTier: tier,
      membershipStatus: "active",
      membershipUpdatedAt: new Date().toISOString(),
    };

    await kv.set(`user_profile:${user.id}`, updatedProfile);
    return c.json(updatedProfile);
  } catch (error) {
    console.log("Upgrade membership error:", error);
    return c.json({ error: "Failed to upgrade membership" }, 500);
  }
});

Deno.serve(app.fetch);