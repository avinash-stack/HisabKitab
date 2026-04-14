import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Chrome } from "lucide-react";
import { Capacitor } from "@capacitor/core";

export default function Auth() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    // Automatically use standard URL if testing on Web Browser localhost, 
    // but use the custom Deep Link scheme when running as a Native App!
    const redirectTo = Capacitor.isNativePlatform() 
      ? "com.avinash.hisabkitab://login-callback" 
      : window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
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

        {/* Google Login Only */}
        <Button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-12 bg-secondary hover:bg-secondary/80 text-foreground gap-2"
        >
          <Chrome className="w-5 h-5" />
          {loading ? "Connecting..." : "Continue with Google"}
        </Button>
      </div>
    </div>
  );
}
