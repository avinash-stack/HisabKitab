import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { encryptData, decryptData, getMasterKey } from "@/lib/crypto";

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
      const { data, error } = await supabase.from("loans").select("*");
      if (error) throw error;
      
      const key = await getMasterKey();
      
      const decryptedData: Loan[] = [];
      for (const l of (data as any[]) || []) {
        if (l.encrypted_payload) {
          const payload = await decryptData(l.encrypted_payload, key);
          decryptedData.push({
            id: l.id,
            user_id: l.user_id,
            created_at: l.created_at,
            loan_name: payload.loan_name,
            total_amount: Number(payload.total_amount),
            emi_amount: Number(payload.emi_amount),
            tenure_months: Number(payload.tenure_months),
            due_day: Number(payload.due_day),
            remaining_balance: Number(payload.remaining_balance)
          } as Loan);
        } else {
          decryptedData.push({ ...l, total_amount: Number(l.total_amount), emi_amount: Number(l.emi_amount), remaining_balance: Number(l.remaining_balance) } as Loan);
        }
      }
      
      decryptedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return decryptedData;
    },
  });

  const addLoan = useMutation({
    mutationFn: async (input: LoanInput) => {
      const key = await getMasterKey();
      const payload = await encryptData(input, key);
      const { error } = await supabase.from("loans").insert({ 
        user_id: user!.id,
        encrypted_payload: payload 
      } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["loans"] }); toast.success("Loan added"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateLoan = useMutation({
    mutationFn: async ({ id, ...input }: LoanInput & { id: string }) => {
      const key = await getMasterKey();
      const payload = await encryptData(input, key);
      const { error } = await supabase.from("loans").update({
        encrypted_payload: payload
      } as any).eq("id", id);
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
