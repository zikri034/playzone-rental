import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { Gamepad2, Mail, Lock, User, ArrowLeft } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);

  const handleBackToDashboard = () => {
    navigate("/");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(signInEmail, signInPassword);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signUpPassword !== signUpConfirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (signUpPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await signUp(signUpEmail, signUpPassword, signUpName);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-xl" role="main" aria-label="Authentication form">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToDashboard}
            className="absolute top-4 left-4 flex items-center gap-2"
            aria-label="Return to dashboard"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            <span>Back to Dashboard</span>
          </Button>
          
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center" aria-hidden="true">
            <Gamepad2 className="text-white" size={32} />
          </div>
          <CardTitle className="text-2xl font-bold">PS Rent Pro</CardTitle>
          <CardDescription>Manage your PlayStation console rentals</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2" role="tablist" aria-label="Authentication options">
              <TabsTrigger value="signin" aria-label="Sign in to your account">Sign In</TabsTrigger>
              <TabsTrigger value="signup" aria-label="Create a new account">Sign Up</TabsTrigger>
            </TabsList>

            {/* SIGN IN TAB */}
            <TabsContent value="signin" role="tabpanel" aria-labelledby="signin-tab">
              <form onSubmit={handleSignIn} className="space-y-4" aria-label="Sign in form">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={18} aria-hidden="true" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="pl-10"
                      required
                      aria-required="true"
                      aria-describedby="signin-email-hint"
                      autoComplete="email"
                    />
                  </div>
                  <span id="signin-email-hint" className="sr-only">Enter your email address</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} aria-hidden="true" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="pl-10"
                      required
                      aria-required="true"
                      aria-describedby="signin-password-hint"
                      autoComplete="current-password"
                    />
                  </div>
                  <span id="signin-password-hint" className="sr-only">Enter your password</span>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full"
                  aria-label={loading ? "Signing in, please wait" : "Sign in to your account"}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                <p className="text-xs text-center text-slate-500 dark:text-slate-400" role="note">
                  Demo: Use any email/password or create a new account
                </p>
              </form>
            </TabsContent>

            {/* SIGN UP TAB */}
            <TabsContent value="signup" role="tabpanel" aria-labelledby="signup-tab">
              <form onSubmit={handleSignUp} className="space-y-4" aria-label="Sign up form">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={18} aria-hidden="true" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      className="pl-10"
                      required
                      aria-required="true"
                      aria-describedby="signup-name-hint"
                      autoComplete="name"
                    />
                  </div>
                  <span id="signup-name-hint" className="sr-only">Enter your full name</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={18} aria-hidden="true" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="pl-10"
                      required
                      aria-required="true"
                      aria-describedby="signup-email-hint"
                      autoComplete="email"
                    />
                  </div>
                  <span id="signup-email-hint" className="sr-only">Enter your email address</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} aria-hidden="true" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="pl-10"
                      required
                      aria-required="true"
                      aria-describedby="signup-password-hint"
                      autoComplete="new-password"
                    />
                  </div>
                  <span id="signup-password-hint" className="sr-only">Password must be at least 6 characters</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} aria-hidden="true" />
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                      aria-required="true"
                      aria-describedby="signup-confirm-password-hint"
                      autoComplete="new-password"
                    />
                  </div>
                  <span id="signup-confirm-password-hint" className="sr-only">Re-enter your password to confirm</span>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full"
                  aria-label={loading ? "Creating account, please wait" : "Create a new account"}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>

                <p className="text-xs text-center text-slate-500 dark:text-slate-400" role="note">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}