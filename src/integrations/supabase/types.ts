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
      approval_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string
          email: string
          id: string
          notes: string | null
          used_at: string | null
          used_by_user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          email: string
          id?: string
          notes?: string | null
          used_at?: string | null
          used_by_user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          email?: string
          id?: string
          notes?: string | null
          used_at?: string | null
          used_by_user_id?: string | null
        }
        Relationships: []
      }
      businesses: {
        Row: {
          capital_need: number | null
          checklist: Json
          created_at: string
          id: string
          industry: string | null
          loan_product: string | null
          name: string
          notes: string | null
          score: number
          status: string
          top_gap: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          capital_need?: number | null
          checklist?: Json
          created_at?: string
          id?: string
          industry?: string | null
          loan_product?: string | null
          name: string
          notes?: string | null
          score?: number
          status?: string
          top_gap?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          capital_need?: number | null
          checklist?: Json
          created_at?: string
          id?: string
          industry?: string | null
          loan_product?: string | null
          name?: string
          notes?: string | null
          score?: number
          status?: string
          top_gap?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      checklist_submissions: {
        Row: {
          business_id: string
          checklist_key: string
          file_name: string
          file_url: string
          id: string
          submitted_at: string
          verified: boolean
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          business_id: string
          checklist_key: string
          file_name: string
          file_url: string
          id?: string
          submitted_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          business_id?: string
          checklist_key?: string
          file_name?: string
          file_url?: string
          id?: string
          submitted_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_submissions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_results: {
        Row: {
          answers: Json
          business_id: string | null
          checklist: Json
          completed_at: string
          created_at: string
          credit_score_range: string | null
          diagnosis_summary: string | null
          email: string
          id: string
          questionnaire_completed: boolean
          revenue_range: string | null
          roadmap: Json
          score: number
          selected_goals: string[]
          time_in_business: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          business_id?: string | null
          checklist?: Json
          completed_at?: string
          created_at?: string
          credit_score_range?: string | null
          diagnosis_summary?: string | null
          email: string
          id?: string
          questionnaire_completed?: boolean
          revenue_range?: string | null
          roadmap?: Json
          score?: number
          selected_goals?: string[]
          time_in_business?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          business_id?: string | null
          checklist?: Json
          completed_at?: string
          created_at?: string
          credit_score_range?: string | null
          diagnosis_summary?: string | null
          email?: string
          id?: string
          questionnaire_completed?: boolean
          revenue_range?: string | null
          roadmap?: Json
          score?: number
          selected_goals?: string[]
          time_in_business?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_results_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      rep_notes: {
        Row: {
          author_id: string | null
          business_id: string | null
          created_at: string
          id: string
          lead_id: string | null
          note: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          author_id?: string | null
          business_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          note: string
          updated_at?: string
          user_id: string
          visibility: string
        }
        Update: {
          author_id?: string | null
          business_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          note?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "rep_notes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rep_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          amount_seeking: number | null
          company_name: string
          contact_name: string
          created_at: string
          credit_score_range: string | null
          email: string
          id: string
          industry: string | null
          naics_code: string | null
          needs: string[] | null
          phone: string | null
          responses: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_seeking?: number | null
          company_name: string
          contact_name: string
          created_at?: string
          credit_score_range?: string | null
          email: string
          id?: string
          industry?: string | null
          naics_code?: string | null
          needs?: string[] | null
          phone?: string | null
          responses?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_seeking?: number | null
          company_name?: string
          contact_name?: string
          created_at?: string
          credit_score_range?: string | null
          email?: string
          id?: string
          industry?: string | null
          naics_code?: string | null
          needs?: string[] | null
          phone?: string | null
          responses?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      communication_settings: {
        Row: {
          created_at: string
          id: string
          smtp_from_email: string | null
          smtp_from_name: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_secure: boolean
          smtp_user: string | null
          twilio_account_sid: string | null
          twilio_auth_token: string | null
          twilio_from_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          smtp_from_email?: string | null
          smtp_from_name?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean
          smtp_user?: string | null
          twilio_account_sid?: string | null
          twilio_auth_token?: string | null
          twilio_from_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          smtp_from_email?: string | null
          smtp_from_name?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean
          smtp_user?: string | null
          twilio_account_sid?: string | null
          twilio_auth_token?: string | null
          twilio_from_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_client_intake_from_lead: {
        Args: { _email: string; _user_id: string }
        Returns: boolean
      }
      consume_approval_code: {
        Args: { _code: string; _email: string; _user_id: string }
        Returns: boolean
      }
      generate_approval_code: {
        Args: { _email: string; _notes?: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client"
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
    Enums: {
      app_role: ["admin", "client"],
    },
  },
} as const
