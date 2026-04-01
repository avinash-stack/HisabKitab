import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Phone, Chrome, Sparkles } from "lucide-react";

type AuthMode = "email" | "phone";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMagicLink = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      toast.error(error.message);
    } else {
      setMagicLinkSent(true);
      toast.success("Magic link sent! Check your inbox.");
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
        <div className="text-center space-y-2 flex flex-col items-center">
          <img src="/logo.png" alt="HisabKitab Logo" className="w-24 h-24 mb-2 object-contain" />
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
            onClick={() => { setMode("email"); setOtpSent(false); setMagicLinkSent(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mode === "email" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button
            onClick={() => { setMode("phone"); setOtpSent(false); setMagicLinkSent(false); }}
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
            {!magicLinkSent ? (
              <>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-secondary border-border"
                  onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
                />
                <Button
                  onClick={handleMagicLink}
                  disabled={loading || !email}
                  className="w-full h-12 gradient-primary text-primary-foreground font-semibold gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {loading ? "Sending..." : "Send Magic Link"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  We'll email you a magic link to sign in — no password needed!
                </p>
              </>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Check your inbox!</p>
                  <p className="text-xs text-muted-foreground">
                    We sent a magic link to <span className="text-foreground font-medium">{email}</span>
                  </p>
                </div>
                <button
                  onClick={() => { setMagicLinkSent(false); setEmail(""); }}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Use a different email
                </button>
              </div>
            )}
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
