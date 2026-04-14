export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      debts: {
        Row: {
          encrypted_payload?: string | null
          amount: number
          created_at: string
          due_date: string | null
          id: string
          note: string | null
          person_name: string
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          encrypted_payload?: string | null
          amount: number
          created_at?: string
          due_date?: string | null
          id?: string
          note?: string | null
          person_name: string
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          encrypted_payload?: string | null
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          note?: string | null
          person_name?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          encrypted_payload?: string | null
          amount: number
          category: string
          created_at: string
          expense_date: string
          id: string
          note: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          encrypted_payload?: string | null
          amount: number
          category: string
          created_at?: string
          expense_date?: string
          id?: string
          note?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          encrypted_payload?: string | null
          amount?: number
          category?: string
          created_at?: string
          expense_date?: string
          id?: string
          note?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loans: {
        Row: {
          created_at: string
          due_day: number
          emi_amount: number
          id: string
          loan_name: string
          remaining_balance: number
          tenure_months: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_day: number
          emi_amount: number
          id?: string
          loan_name: string
          remaining_balance: number
          tenure_months: number
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_day?: number
          emi_amount?: number
          id?: string
          loan_name?: string
          remaining_balance?: number
          tenure_months?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          day_of_month: number
          id: string
          is_active: boolean
          last_generated_date: string | null
          note: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          day_of_month?: number
          id?: string
          is_active?: boolean
          last_generated_date?: string | null
          note?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          day_of_month?: number
          id?: string
          is_active?: boolean
          last_generated_date?: string | null
          note?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          phone: string | null
          currency: string
          monthly_budget: number | null
          avatar_url: string | null
          subscription_tier: string
          subscription_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          phone?: string | null
          currency?: string
          monthly_budget?: number | null
          avatar_url?: string | null
          subscription_tier?: string
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          phone?: string | null
          currency?: string
          monthly_budget?: number | null
          avatar_url?: string | null
          subscription_tier?: string
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      income_sources: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          created_at?: string
        }
        Relationships: []
      }
      incomes: {
        Row: {
          encrypted_payload?: string | null
          id: string
          user_id: string
          amount: number
          source: string
          note: string | null
          income_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          encrypted_payload?: string | null
          id?: string
          user_id: string
          amount: number
          source: string
          note?: string | null
          income_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          encrypted_payload?: string | null
          id?: string
          user_id?: string
          amount?: number
          source?: string
          note?: string | null
          income_date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          created_at?: string
        }
        Relationships: []
      }
      debt_contacts: {
        Row: {
          id: string
          user_id: string
          name: string
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
