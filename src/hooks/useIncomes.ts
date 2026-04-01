import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

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

export function useIncomes(month?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["incomes", month],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase.from("incomes").select("*").order("income_date", { ascending: false });
      if (month) {
        const start = `${month}-01`;
        const end = `${month}-31`;
        q = q.gte("income_date", start).lte("income_date", end);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data as Income[];
    },
  });

  const addIncome = useMutation({
    mutationFn: async (input: IncomeInput) => {
      const { error } = await supabase.from("incomes").insert({ ...input, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["incomes"] }); toast.success("Income added"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateIncome = useMutation({
    mutationFn: async ({ id, ...input }: IncomeInput & { id: string }) => {
      const { error } = await supabase.from("incomes").update(input).eq("id", id);
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
