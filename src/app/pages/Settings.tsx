import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { User, Bell, Moon, Crown, LogOut, Camera, Mail, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";

// 🔥 Import Supabase ditambahkan di sini
import { supabase } from "../../utils/supabase/client"; 

export default function Settings() {
  const { user, profile, settings, updateProfile, updateSettings, upgradeMembership, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Profile form state
  const [name, setName] = useState(profile?.name || "");
  const [email] = useState(profile?.email || "");

  // Settings state - initialize from settings context
  const [darkMode, setDarkMode] = useState(settings?.darkMode || false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings?.notificationsEnabled || false);
  const [emailNotifications, setEmailNotifications] = useState(settings?.emailNotifications || false);
  const [pushNotifications, setPushNotifications] = useState(settings?.pushNotifications || false);
  const [rentalReminders, setRentalReminders] = useState(settings?.rentalReminders || false);

  // Update local state when settings context changes
  useEffect(() => {
    if (settings) {
      setDarkMode(settings.darkMode);
      setNotificationsEnabled(settings.notificationsEnabled);
      setEmailNotifications(settings.emailNotifications);
      setPushNotifications(settings.pushNotifications);
      setRentalReminders(settings.rentalReminders);
    }
  }, [settings]);

  // Update name when profile changes
  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile({ name });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDarkMode = async (checked: boolean) => {
    setDarkMode(checked);
    try {
      await updateSettings({ darkMode: checked });
      toast.success(checked ? "Dark mode enabled" : "Dark mode disabled");
    } catch (error) {
      toast.error("Failed to update dark mode setting");
      setDarkMode(!checked);
    }
  };

  const handleToggleNotifications = async (checked: boolean) => {
    setNotificationsEnabled(checked);
    try {
      await updateSettings({ notificationsEnabled: checked });
      toast.success("Notifications setting updated");
    } catch (error) {
      toast.error("Failed to update notifications");
      setNotificationsEnabled(!checked);
    }
  };

  const handleToggleEmailNotifications = async (checked: boolean) => {
    setEmailNotifications(checked);
    try {
      await updateSettings({ emailNotifications: checked });
      toast.success("Email notifications updated");
    } catch (error) {
      toast.error("Failed to update email notifications");
      setEmailNotifications(!checked);
    }
  };

  const handleTogglePushNotifications = async (checked: boolean) => {
    setPushNotifications(checked);
    try {
      await updateSettings({ pushNotifications: checked });
      toast.success("Push notifications updated");
    } catch (error) {
      toast.error("Failed to update push notifications");
      setPushNotifications(!checked);
    }
  };

  const handleToggleRentalReminders = async (checked: boolean) => {
    setRentalReminders(checked);
    try {
      await updateSettings({ rentalReminders: checked });
      toast.success("Rental reminders updated");
    } catch (error) {
      toast.error("Failed to update rental reminders");
      setRentalReminders(!checked);
    }
  };

  const handleUpgradeMembership = async (tier: "free" | "premium" | "vip") => {
    setLoading(true);
    try {
      await upgradeMembership(tier);
      toast.success(`Upgraded to ${tier.toUpperCase()} membership!`);
    } catch (error) {
      toast.error("Failed to upgrade membership");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Fungsi Sign Out yang super tangguh
  const handleSignOut = async () => {
    try {
      setLoading(true);
      
      // 1. Putuskan koneksi sesi dari Supabase
      await supabase.auth.signOut();
      
      // 2. Panggil fungsi signOut bawaan context kamu (jika ada)
      if (typeof signOut === 'function') {
        await signOut();
      }

      // 3. Hapus semua cache lokal secara paksa
      localStorage.clear();
      sessionStorage.clear();

      toast.success("Berhasil keluar dari akun!");

      // 4. Paksa lempar (redirect) ke halaman login/auth
      navigate("/auth", { replace: true });
      
      // 5. Refresh layar agar semua state React benar-benar bersih
      window.location.reload(); 

    } catch (error) {
      console.error(error);
      toast.error("Gagal keluar akun. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const getMembershipColor = (tier?: string) => {
    switch (tier) {
      case "vip":
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "premium":
        return "bg-gradient-to-r from-blue-500 to-cyan-500";
      default:
        return "bg-slate-500";
    }
  };

  const getMembershipBadge = (tier?: string) => {
    switch (tier) {
      case "vip":
        return <Badge className="bg-purple-500">VIP</Badge>;
      case "premium":
        return <Badge className="bg-blue-500">Premium</Badge>;
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-600 dark:text-slate-400">Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and avatar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar || undefined} />
                  <AvatarFallback className={getMembershipColor(profile?.membershipTier)}>
                    <span className="text-2xl text-white font-bold">
                      {profile?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Camera size={16} />
                    Change Photo
                  </Button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">JPG, PNG or GIF (max. 2MB)</p>
                </div>
              </div>

              <Separator />

              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="flex gap-2">
                  <User className="text-slate-400 mt-2" size={20} />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              {/* Email Display */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2">
                  <Mail className="text-slate-400 mt-2" size={20} />
                  <Input id="email" value={email} disabled className="bg-slate-50 dark:bg-slate-900" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Email cannot be changed</p>
              </div>

              {/* Membership Badge */}
              <div className="space-y-2">
                <Label>Membership Status</Label>
                <div className="flex items-center gap-2">
                  <Crown className="text-slate-400" size={20} />
                  {getMembershipBadge(profile?.membershipTier)}
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {profile?.membershipTier === "vip" && "VIP Member - All benefits unlocked"}
                    {profile?.membershipTier === "premium" && "Premium Member - Enhanced features"}
                    {profile?.membershipTier === "free" && "Free Member - Upgrade for more benefits"}
                  </span>
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={loading} className="w-full gap-2">
                <Save size={16} />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PREFERENCES TAB */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="text-slate-600 dark:text-slate-400" size={20} />
                  <div>
                    <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Enable dark theme</p>
                  </div>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={handleToggleDarkMode}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="text-slate-600 dark:text-slate-400" size={20} />
                  <div>
                    <Label htmlFor="notifications" className="font-medium">Enable Notifications</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive all notifications</p>
                  </div>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={handleToggleNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="text-slate-600 dark:text-slate-400" size={20} />
                  <div>
                    <Label htmlFor="email-notif" className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Get updates via email</p>
                  </div>
                </div>
                <Switch
                  id="email-notif"
                  checked={emailNotifications}
                  onCheckedChange={handleToggleEmailNotifications}
                  disabled={!notificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="text-slate-600 dark:text-slate-400" size={20} />
                  <div>
                    <Label htmlFor="push-notif" className="font-medium">Push Notifications</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Browser push notifications</p>
                  </div>
                </div>
                <Switch
                  id="push-notif"
                  checked={pushNotifications}
                  onCheckedChange={handleTogglePushNotifications}
                  disabled={!notificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="text-slate-600 dark:text-slate-400" size={20} />
                  <div>
                    <Label htmlFor="rental-reminders" className="font-medium">Rental Reminders</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Alerts before rental ends</p>
                  </div>
                </div>
                <Switch
                  id="rental-reminders"
                  checked={rentalReminders}
                  onCheckedChange={handleToggleRentalReminders}
                  disabled={!notificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MEMBERSHIP TAB */}
        <TabsContent value="membership" className="space-y-4">
          <Card className={`${profile?.membershipTier !== "free" ? "border-2 border-blue-500" : ""}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Plan</CardTitle>
                {getMembershipBadge(profile?.membershipTier)}
              </div>
              <CardDescription>
                {profile?.membershipTier === "free" && "Upgrade to unlock premium features"}
                {profile?.membershipTier === "premium" && "Enjoying premium benefits"}
                {profile?.membershipTier === "vip" && "You're a VIP member!"}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Free Plan */}
          <Card className={profile?.membershipTier === "free" ? "border-2 border-slate-300" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="text-slate-500" size={20} />
                Free Plan
              </CardTitle>
              <CardDescription>Basic features for casual users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Reserve up to 2 consoles per day
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Standard rental rates
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Basic notifications
                </li>
              </ul>
              {profile?.membershipTier === "free" && (
                <Badge variant="secondary">Current Plan</Badge>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className={profile?.membershipTier === "premium" ? "border-2 border-blue-500" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="text-blue-500" size={20} />
                Premium Plan
              </CardTitle>
              <CardDescription>Enhanced features for regular users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold text-blue-600">$9.99<span className="text-sm text-slate-500">/month</span></div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Reserve up to 5 consoles per day
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 10% discount on all rentals
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Priority booking
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Advanced notifications
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Extended rental periods
                </li>
              </ul>
              {profile?.membershipTier === "premium" ? (
                <Badge className="bg-blue-500">Current Plan</Badge>
              ) : profile?.membershipTier === "free" ? (
                <Button
                  onClick={() => handleUpgradeMembership("premium")}
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  Upgrade to Premium
                </Button>
              ) : null}
            </CardContent>
          </Card>

          {/* VIP Plan */}
          <Card className={profile?.membershipTier === "vip" ? "border-2 border-purple-500" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="text-purple-500" size={20} />
                VIP Plan
              </CardTitle>
              <CardDescription>Ultimate experience for power users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                $19.99<span className="text-sm text-slate-500">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Unlimited console reservations
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 20% discount on all rentals
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Exclusive VIP-only consoles
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Free 1-hour extension per rental
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 24/7 priority support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Early access to new releases
                </li>
              </ul>
              {profile?.membershipTier === "vip" ? (
                <Badge className="bg-purple-500">Current Plan</Badge>
              ) : (
                <Button
                  onClick={() => handleUpgradeMembership("vip")}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Upgrade to VIP
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sign Out Section */}
      <Card className="mt-6 border-red-200 dark:border-red-900">
        <CardContent className="pt-6">
          <Button
            variant="destructive"
            onClick={handleSignOut}
            disabled={loading}
            className="w-full gap-2"
          >
            <LogOut size={16} />
            {loading ? "Signing out..." : "Sign Out"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}