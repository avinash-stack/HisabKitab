import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

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
        .select("*")
        .order("day_of_month", { ascending: true });
      if (error) throw error;
      return data as unknown as RecurringExpense[];
    },
  });

  const addRecurring = useMutation({
    mutationFn: async (input: RecurringExpenseInput) => {
      const { error } = await supabase
        .from("recurring_expenses" as any)
        .insert({ ...input, user_id: user!.id } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["recurring_expenses"] }); toast.success("Recurring expense added"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateRecurring = useMutation({
    mutationFn: async ({ id, ...input }: RecurringExpenseInput & { id: string }) => {
      const { error } = await supabase
        .from("recurring_expenses" as any)
        .update(input as any)
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
