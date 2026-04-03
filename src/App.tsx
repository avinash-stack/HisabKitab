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
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();

  // 🔥 Deep link handler (Google Login fix)
  useEffect(() => {
    const listener = CapacitorApp.addListener("appUrlOpen", async (event) => {
      const url = event.url;

      if (url.includes("login-callback")) {
        const hash = url.split("#")[1];

        if (hash) {
          const params = new URLSearchParams(hash);

          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");

          if (access_token && refresh_token) {
            await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            // Optional: redirect after login
            window.location.href = "/";
          }
        }
      }
    });

    return () => {
      listener.remove();
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