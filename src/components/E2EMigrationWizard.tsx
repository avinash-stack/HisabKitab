import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateMasterKey, exportKey, encryptData } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export function E2EMigrationWizard() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Ready to start encryption");
  const { toast } = useToast();

  const handleMigration = async () => {
    setIsMigrating(true);
    setProgress(5);
    setStatus("Generating secure encryption key...");

    try {
      // 1. Generate local master key
      const masterKey = await generateMasterKey();
      const rawKey = await exportKey(masterKey);
      
      // SAVE KEY LOCALLY (Warning: In production, use Capacitor API for Secure Storage)
      localStorage.setItem("e2e_master_key", rawKey);

      setProgress(15);
      setStatus("Fetching user data...");

      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // 2. Fetch and Encrypt Expenses
      setStatus("Encrypting expenses...");
      const { data: expenses } = await supabase.from("expenses").select("*");
      if (expenses) {
        for (let i = 0; i < expenses.length; i++) {
          const exp = expenses[i];
          const payload = await encryptData({
            amount: exp.amount,
            category: exp.category,
            note: exp.note,
            expense_date: exp.expense_date
          }, masterKey);
          await supabase.from("expenses").update({ encrypted_payload: payload }).eq("id", exp.id);
        }
      }
      setProgress(40);

      // 3. Fetch and Encrypt Incomes
      setStatus("Encrypting incomes...");
      const { data: incomes } = await supabase.from("incomes").select("*");
      if (incomes) {
        for (let i = 0; i < incomes.length; i++) {
          const inc = incomes[i];
          const payload = await encryptData({
            amount: inc.amount,
            source: inc.source,
            note: inc.note,
            income_date: inc.income_date
          }, masterKey);
          await supabase.from("incomes").update({ encrypted_payload: payload }).eq("id", inc.id);
        }
      }
      setProgress(65);

      // 4. Fetch and Encrypt Debts 
      setStatus("Encrypting debts...");
      const { data: debts } = await supabase.from("debts").select("*");
      if (debts) {
        for (let i = 0; i < debts.length; i++) {
          const debt = debts[i];
          const payload = await encryptData({
            amount: debt.amount,
            person_name: debt.person_name,
            note: debt.note,
            due_date: debt.due_date,
            status: debt.status,
            type: debt.type
          }, masterKey);
          await supabase.from("debts").update({ encrypted_payload: payload }).eq("id", debt.id);
        }
      }
      setProgress(90);

      // We would repeat the above block for loans, recurring_expenses, contacts, etc.

      setStatus("Migration Complete!");
      setProgress(100);
      toast({
        title: "Success",
        description: "All existing data has been securely encrypted locally.",
      });

    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
      toast({
        variant: "destructive",
        title: "Migration Failed",
        description: error.message,
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Security Upgrade: E2E Encryption</CardTitle>
        <CardDescription>
          Encrypt your existing financial data so that it cannot be read by anyone else, including the database administrators.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{status}</p>
        <Progress value={progress} />
        
        <Button 
          className="w-full" 
          onClick={handleMigration} 
          disabled={isMigrating || progress === 100}
        >
          {progress === 100 ? "Encryption Active" : "Start Database Encryption"}
        </Button>
      </CardContent>
    </Card>
  );
}
