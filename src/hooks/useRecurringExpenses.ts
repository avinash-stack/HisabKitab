import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { encryptData, decryptData, getMasterKey } from "@/lib/crypto";

export type RecurringExpense = {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  day_of_month: number;
  is_active: boolean;
  last_generated_date: string | null;
  user_id: string;
  created_at: string;
};

export type RecurringExpenseInput = {
  amount: number;
  category: string;
  note?: string;
  day_of_month: number;
};

export function useRecurringExpenses() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["recurring_expenses"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recurring_expenses" as any)
        .select("*");
      if (error) throw error;
      
      const key = await getMasterKey();
      
      const decryptedData: RecurringExpense[] = [];
      for (const r of (data as any[]) || []) {
        if (r.encrypted_payload) {
          const payload = await decryptData(r.encrypted_payload, key);
          decryptedData.push({
            id: r.id,
            user_id: r.user_id,
            created_at: r.created_at,
            amount: Number(payload.amount),
            category: payload.category,
            note: payload.note || null,
            day_of_month: Number(payload.day_of_month),
            is_active: r.is_active,
            last_generated_date: r.last_generated_date || null
          } as RecurringExpense);
        } else {
          decryptedData.push({ ...r, amount: Number(r.amount) } as RecurringExpense);
        }
      }
      
      decryptedData.sort((a, b) => a.day_of_month - b.day_of_month);
      return decryptedData;
    },
  });

  const addRecurring = useMutation({
    mutationFn: async (input: RecurringExpenseInput) => {
      const key = await getMasterKey();
      const payload = await encryptData(input, key);
      const { error } = await supabase
        .from("recurring_expenses" as any)
        .insert({ 
          user_id: user!.id,
          encrypted_payload: payload 
        } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["recurring_expenses"] }); toast.success("Recurring expense added"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateRecurring = useMutation({
    mutationFn: async ({ id, ...input }: RecurringExpenseInput & { id: string }) => {
      const key = await getMasterKey();
      const payload = await encryptData(input, key);
      const { error } = await supabase
        .from("recurring_expenses" as any)
        .update({
          encrypted_payload: payload
        } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["recurring_expenses"] }); toast.success("Updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("recurring_expenses" as any)
        .update({ is_active } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["recurring_expenses"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteRecurring = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("recurring_expenses" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["recurring_expenses"] }); toast.success("Deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, addRecurring, updateRecurring, toggleActive, deleteRecurring };
}
