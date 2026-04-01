import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export type DebtContact = {
  id: string;
  name: string;
  phone: string | null;
  user_id: string;
};

export function useDebtContacts() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["debt_contacts"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("debt_contacts")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as DebtContact[];
    },
  });

  const addContact = useMutation({
    mutationFn: async (input: { name: string; phone?: string }) => {
      const { error } = await supabase
        .from("debt_contacts")
        .insert({ ...input, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["debt_contacts"] });
      toast.success("Contact added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("debt_contacts")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["debt_contacts"] });
      toast.success("Contact deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, addContact, deleteContact };
}
