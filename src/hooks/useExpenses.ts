import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";

export type Expense = {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  expense_date: string;
  user_id: string;
  created_at: string;
};

export type ExpenseInput = {
  amount: number;
  category: string;
  note?: string;
  expense_date: string;
};

export function useExpenses(month?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["expenses", month],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase.from("expenses").select("*").order("expense_date", { ascending: false });
      if (month) {
        const monthDate = new Date(`${month}-15`);
        const start = format(startOfMonth(monthDate), "yyyy-MM-dd");
        const end = format(endOfMonth(monthDate), "yyyy-MM-dd");
        q = q.gte("expense_date", start).lte("expense_date", end);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map(e => ({ ...e, amount: Number(e.amount) })) as Expense[];
    },
  });

  const addExpense = useMutation({
    mutationFn: async (input: ExpenseInput) => {
      const { error } = await supabase.from("expenses").insert({ ...input, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["expenses"] }); toast.success("Expense added"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateExpense = useMutation({
    mutationFn: async ({ id, ...input }: ExpenseInput & { id: string }) => {
      const { error } = await supabase.from("expenses").update(input).eq("id", id);
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
