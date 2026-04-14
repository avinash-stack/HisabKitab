import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { supabase } from "@/integrations/supabase/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import BottomNav from "@/components/BottomNav";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Debts from "@/pages/Debts";
import Loans from "@/pages/Loans";
import Income from "@/pages/Income";
import Overview from "@/pages/Overview";
import RecurringExpenses from "@/pages/RecurringExpenses";
import Profile from "@/pages/Profile";
import AddSelect from "@/pages/AddSelect";
import AddExpense from "@/pages/AddExpense";
import AddIncome from "@/pages/AddIncome";
import AddLoan from "@/pages/AddLoan";
import AddDebt from "@/pages/AddDebt";
import Subscription from "@/pages/Subscription";
import NotFound from "@/pages/NotFound";
import AboutUs from "@/pages/AboutUs";
import Help from "@/pages/Help";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();

  // 🔥 Deep link handler (Google Login fix)
  useEffect(() => {
    let listenerHandle: { remove: () => void } | null = null;

    CapacitorApp.addListener("appUrlOpen", async (event) => {
      const url = event.url;
      console.log("🔗 Deep link received:", url);

      if (url.includes("login-callback")) {
        // Try fragment (#) first (implicit grant flow)
        let tokenString = url.split("#")[1];

        // Fallback to query params (?) if no fragment
        if (!tokenString) {
          const queryPart = url.split("?")[1];
          if (queryPart) tokenString = queryPart;
        }

        if (tokenString) {
          const params = new URLSearchParams(tokenString);
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");

          console.log("🔑 Tokens found:", !!access_token, !!refresh_token);

          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) {
              console.error("❌ setSession error:", error.message);
            } else {
              console.log("✅ Session set successfully");
            }
            // No redirect needed — AuthProvider's onAuthStateChange
            // will detect the new session and update the UI automatically
          }
        }
      }
    }).then((handle) => {
      listenerHandle = handle;
    });

    return () => {
      listenerHandle?.remove();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/debts" element={<Debts />} />
        <Route path="/income" element={<Income />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/recurring" element={<RecurringExpenses />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/add" element={<AddSelect />} />
        <Route path="/add/expense" element={<AddExpense />} />
        <Route path="/add/income" element={<AddIncome />} />
        <Route path="/add/loan" element={<AddLoan />} />
        <Route path="/add/debt" element={<AddDebt />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/help" element={<Help />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;