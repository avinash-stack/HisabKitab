import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { encryptData, decryptData, importKey } from "@/lib/crypto";

export type Income = {
  id: string;
  amount: number;
  source: string;
  note: string | null;
  income_date: string;
  user_id: string;
  created_at: string;
};

export type IncomeInput = {
  amount: number;
  source: string;
  note?: string;
  income_date: string;
};

// Helper: Get key from storage
async function getMasterKey() {
  const rawKey = localStorage.getItem("e2e_master_key");
  if (!rawKey) throw new Error("Encryption key not found. Please run the migration or set up your key.");
  return await importKey(rawKey);
}

export function useIncomes(month?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["incomes", month],
    enabled: !!user,
    queryFn: async () => {
      // 1. Fetch EVERYTHING
      const { data, error } = await supabase.from("incomes").select("*");
      if (error) throw error;

      const key = await getMasterKey();
      
      // 2. Decrypt locally
      const decryptedData: Income[] = [];
      for (const i of (data as any[]) || []) {
        if (i.encrypted_payload) {
          const payload = await decryptData(i.encrypted_payload, key);
          decryptedData.push({
            id: i.id,
            user_id: i.user_id,
            created_at: i.created_at,
            amount: Number(payload.amount),
            source: payload.source,
            note: payload.note,
            income_date: payload.income_date
          } as Income);
        } else {
          // Fallback support during dev/testing
          decryptedData.push({ ...i, amount: Number(i.amount) } as Income);
        }
      }

      // 3. Client-side Filtering
      let result = decryptedData;
      if (month) {
        const monthDate = new Date(`${month}-15`);
        const start = format(startOfMonth(monthDate), "yyyy-MM-dd");
        const end = format(endOfMonth(monthDate), "yyyy-MM-dd");
        result = result.filter(i => i.income_date >= start && i.income_date <= end);
      }
      
      // 4. Client-side Sorting
      result.sort((a, b) => new Date(b.income_date).getTime() - new Date(a.income_date).getTime());

      return result;
    },
  });

  const addIncome = useMutation({
    mutationFn: async (input: IncomeInput) => {
      const key = await getMasterKey();
      const payload = await encryptData(input, key);
      const { error } = await supabase.from("incomes").insert({ 
        user_id: user!.id,
        encrypted_payload: payload 
      } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["incomes"] }); toast.success("Income added"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateIncome = useMutation({
    mutationFn: async ({ id, ...input }: IncomeInput & { id: string }) => {
      const key = await getMasterKey();
      const payload = await encryptData(input, key);
      const { error } = await supabase.from("incomes").update({
        encrypted_payload: payload
      } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["incomes"] }); toast.success("Income updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteIncome = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("incomes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["incomes"] }); toast.success("Income deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, addIncome, updateIncome, deleteIncome };
}
