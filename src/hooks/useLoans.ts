import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export type Loan = {
  id: string;
  loan_name: string;
  total_amount: number;
  emi_amount: number;
  tenure_months: number;
  due_day: number;
  remaining_balance: number;
  user_id: string;
  created_at: string;
};

export type LoanInput = {
  loan_name: string;
  total_amount: number;
  emi_amount: number;
  tenure_months: number;
  due_day: number;
  remaining_balance: number;
};

export function useLoans() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["loans"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("loans").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Loan[];
    },
  });

  const addLoan = useMutation({
    mutationFn: async (input: LoanInput) => {
      const { error } = await supabase.from("loans").insert({ ...input, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["loans"] }); toast.success("Loan added"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateLoan = useMutation({
    mutationFn: async ({ id, ...input }: LoanInput & { id: string }) => {
      const { error } = await supabase.from("loans").update(input).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["loans"] }); toast.success("Loan updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteLoan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("loans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["loans"] }); toast.success("Loan deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, addLoan, updateLoan, deleteLoan };
}
