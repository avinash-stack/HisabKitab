import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { encryptData, decryptData, importKey } from "@/lib/crypto";

export type Expense = {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  expense_date: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
};

export type ExpenseInput = {
  amount: number;
  category: string;
  note?: string;
  expense_date: string;
};

// Helper: Get key from storage
async function getMasterKey() {
  const rawKey = localStorage.getItem("e2e_master_key");
  if (!rawKey) throw new Error("Encryption key not found. Please run the migration or set up your key.");
  return await importKey(rawKey);
}

export function useExpenses(month?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["expenses", month],
    enabled: !!user,
    queryFn: async () => {
      // 1. Fetch EVERYTHING (No server filtering because data is encrypted)
      const { data, error } = await supabase.from("expenses").select("*");
      if (error) throw error;
      
      const key = await getMasterKey();
      
      // 2. Decrypt all data locally
      const decryptedData: Expense[] = [];
      for (const e of (data as any[]) || []) {
        if (e.encrypted_payload) {
          try {
            const payload = await decryptData(e.encrypted_payload, key);
            decryptedData.push({
              id: e.id,
              user_id: e.user_id,
              created_at: e.created_at,
              amount: Number(payload.amount) || 0,
              category: payload.category || "Unknown",
              note: payload.note || "",
              expense_date: payload.expense_date || "2026-04-14"
            } as Expense);
          } catch (err: any) {
            console.error(`Decryption failed for row ${e.id}:`, err);
            decryptedData.push({
              id: e.id,
              user_id: e.user_id,
              created_at: e.created_at,
              amount: 0,
              category: "Error",
              note: "Decryption Failed - Check Console",
              expense_date: "2026-04-14"
            } as Expense);
          }
        } else {
          console.warn("Row missing encrypted_payload:", e);
          decryptedData.push({ 
            id: e.id,
            user_id: e.user_id,
            created_at: e.created_at,
            amount: Number(e.amount) || 0,
            category: "Fallback",
            note: "No Encrypted Payload Found",
            expense_date: e.expense_date || "2026-04-14"
          } as Expense);
        }
      }

      // 3. Client-side Filtering
      let result = decryptedData;
      if (month) {
        const monthDate = new Date(`${month}-15`);
        const start = format(startOfMonth(monthDate), "yyyy-MM-dd");
        const end = format(endOfMonth(monthDate), "yyyy-MM-dd");
        result = result.filter(e => e.expense_date >= start && e.expense_date <= end);
      }
      
      // 4. Client-side Sorting
      result.sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
      
      return result;
    },
  });

  const addExpense = useMutation({
    mutationFn: async (input: ExpenseInput) => {
      const key = await getMasterKey();
      const payload = await encryptData(input, key);
      const { error } = await supabase.from("expenses").insert({ 
        user_id: user!.id,
        encrypted_payload: payload 
      } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["expenses"] }); toast.success("Expense added"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateExpense = useMutation({
    mutationFn: async ({ id, ...input }: ExpenseInput & { id: string }) => {
      const key = await getMasterKey();
      const payload = await encryptData(input, key);
      const { error } = await supabase.from("expenses").update({
        encrypted_payload: payload
      } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["expenses"] }); toast.success("Expense updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["expenses"] }); toast.success("Expense deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, addExpense, updateExpense, deleteExpense };
}
