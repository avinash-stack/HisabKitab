import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Phone, Chrome } from "lucide-react";

type AuthMode = "email" | "phone";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created successfully! Check your email to verify (if required).");
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Signed in successfully!");
      }
    }
    setLoading(false);
  };

  const handlePhoneOtpSend = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      toast.error(error.message || "SMS provider may not be configured.");
    } else {
      toast.success("OTP sent to your phone!");
      setOtpSent(true);
    }
    setLoading(false);
  };

  const handlePhoneOtpVerify = async () => {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    if (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      }
    });
    if (error) {
      toast.error(error.message || "Google login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-display text-gradient">HisabKitab</h1>
          <p className="text-muted-foreground text-sm">Expense, Debt & EMI Tracker</p>
        </div>

        {/* Google Login */}
        <Button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-12 bg-secondary hover:bg-secondary/80 text-foreground gap-2"
        >
          <Chrome className="w-5 h-5" />
          Continue with Google
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => { setMode("email"); setOtpSent(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mode === "email" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button
            onClick={() => { setMode("phone"); setOtpSent(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mode === "phone" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            <Phone className="w-4 h-4" />
            Phone
          </button>
        </div>

        {mode === "email" && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-secondary border-border"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-secondary border-border"
              />
            </div>
            <Button
              onClick={handleEmailAuth}
              disabled={loading || !email || !password}
              className="w-full h-12 gradient-primary text-primary-foreground font-semibold"
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                disabled={loading}
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        )}

        {mode === "phone" && (
          <div className="space-y-3">
            <Input
              type="tel"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 bg-secondary border-border"
            />
            {otpSent && (
              <Input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="h-12 bg-secondary border-border"
                maxLength={6}
              />
            )}
            <Button
              onClick={otpSent ? handlePhoneOtpVerify : handlePhoneOtpSend}
              disabled={loading || !phone || (otpSent && !otp)}
              className="w-full h-12 gradient-primary text-primary-foreground font-semibold"
            >
              {otpSent ? "Verify OTP" : "Send OTP"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Phone login requires SMS provider setup
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
