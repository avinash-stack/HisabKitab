import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  currency: string;
  monthly_budget: number | null;
  avatar_url: string | null;
};

export type ProfileInput = {
  full_name?: string;
  phone?: string;
  currency?: string;
  monthly_budget?: number;
  avatar_url?: string;
};

export function useProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["profile"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  const upsertProfile = useMutation({
    mutationFn: async (input: ProfileInput) => {
      const existing = query.data;
      if (existing) {
        const { error } = await supabase
          .from("profiles")
          .update(input)
          .eq("user_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("profiles")
          .insert({ ...input, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, upsertProfile };
}
