import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export type Debt = {
  id: string;
  person_name: string;
  amount: number;
  type: "given" | "taken";
  due_date: string | null;
  status: "pending" | "paid";
  note: string | null;
  user_id: string;
  created_at: string;
};

export type DebtInput = {
  person_name: string;
  amount: number;
  type: "given" | "taken";
  due_date?: string;
  status?: "pending" | "paid";
  note?: string;
};

export function useDebts() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["debts"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("debts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(d => ({ ...d, amount: Number(d.amount) })) as Debt[];
    },
  });

  const addDebt = useMutation({
    mutationFn: async (input: DebtInput) => {
      const { error } = await supabase.from("debts").insert({ ...input, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["debts"] }); toast.success("Debt added"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateDebt = useMutation({
    mutationFn: async ({ id, ...input }: DebtInput & { id: string }) => {
      const { error } = await supabase.from("debts").update(input).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["debts"] }); toast.success("Debt updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteDebt = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("debts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["debts"] }); toast.success("Debt deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, addDebt, updateDebt, deleteDebt };
}
