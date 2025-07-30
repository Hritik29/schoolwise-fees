export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      class_fee_structures: {
        Row: {
          class_grade: string
          created_at: string
          id: string
          is_active: boolean
          tuition_fee_yearly: number
          updated_at: string
        }
        Insert: {
          class_grade: string
          created_at?: string
          id?: string
          is_active?: boolean
          tuition_fee_yearly: number
          updated_at?: string
        }
        Update: {
          class_grade?: string
          created_at?: string
          id?: string
          is_active?: boolean
          tuition_fee_yearly?: number
          updated_at?: string
        }
        Relationships: []
      }
      fee_structures: {
        Row: {
          amount: number
          class_grade: string | null
          created_at: string
          description: string | null
          fee_type: string
          frequency: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          amount: number
          class_grade?: string | null
          created_at?: string
          description?: string | null
          fee_type: string
          frequency?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          amount?: number
          class_grade?: string | null
          created_at?: string
          description?: string | null
          fee_type?: string
          frequency?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      fee_transactions: {
        Row: {
          amount: number
          applied_to_fee_type: string | null
          created_at: string
          created_by: string | null
          fee_category: string | null
          fee_type: string | null
          id: string
          payment_method: string
          reference_number: string | null
          remarks: string | null
          student_fee_id: string
          student_id: string
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          amount: number
          applied_to_fee_type?: string | null
          created_at?: string
          created_by?: string | null
          fee_category?: string | null
          fee_type?: string | null
          id?: string
          payment_method?: string
          reference_number?: string | null
          remarks?: string | null
          student_fee_id: string
          student_id: string
          transaction_date?: string
          transaction_type?: string
        }
        Update: {
          amount?: number
          applied_to_fee_type?: string | null
          created_at?: string
          created_by?: string | null
          fee_category?: string | null
          fee_type?: string | null
          id?: string
          payment_method?: string
          reference_number?: string | null
          remarks?: string | null
          student_fee_id?: string
          student_id?: string
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_transactions_student_fee_id_fkey"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fee_details: {
        Row: {
          academic_year: string | null
          created_at: string
          fee_type: string
          id: string
          outstanding_amount: number
          paid_amount: number
          student_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          created_at?: string
          fee_type: string
          id?: string
          outstanding_amount?: number
          paid_amount?: number
          student_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          created_at?: string
          fee_type?: string
          id?: string
          outstanding_amount?: number
          paid_amount?: number
          student_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      student_fees: {
        Row: {
          created_at: string
          due_date: string | null
          fee_structure_id: string
          id: string
          outstanding_amount: number
          paid_amount: number
          status: string
          student_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          fee_structure_id: string
          id?: string
          outstanding_amount: number
          paid_amount?: number
          status?: string
          student_id: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          fee_structure_id?: string
          id?: string
          outstanding_amount?: number
          paid_amount?: number
          status?: string
          student_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_fees_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          aadhar_number: string | null
          account_number: string | null
          address: string | null
          apar_id: string | null
          class_grade: string
          created_at: string
          date_of_birth: string | null
          email: string | null
          enrollment_date: string
          first_name: string
          id: string
          last_name: string
          parent_email: string | null
          parent_name: string
          parent_phone: string
          phone: string | null
          section: string | null
          sssm_id: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          aadhar_number?: string | null
          account_number?: string | null
          address?: string | null
          apar_id?: string | null
          class_grade: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          enrollment_date?: string
          first_name: string
          id?: string
          last_name: string
          parent_email?: string | null
          parent_name: string
          parent_phone: string
          phone?: string | null
          section?: string | null
          sssm_id?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          aadhar_number?: string | null
          account_number?: string | null
          address?: string | null
          apar_id?: string | null
          class_grade?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          enrollment_date?: string
          first_name?: string
          id?: string
          last_name?: string
          parent_email?: string | null
          parent_name?: string
          parent_phone?: string
          phone?: string | null
          section?: string | null
          sssm_id?: string | null
          status?: string
          student_id?: string
          updated_at?: string
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
