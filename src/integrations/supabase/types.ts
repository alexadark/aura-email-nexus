export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      crm_leads: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          industry: string | null
          name: string | null
          notes: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name?: string | null
          notes?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name?: string | null
          notes?: string | null
          type?: string | null
        }
        Relationships: []
      }
      emails: {
        Row: {
          body: string | null
          category: string | null
          created_at: string | null
          direction: string | null
          email_id: string | null
          id: string
          received_at: string | null
          sender_email: string | null
          sender_name: string | null
          sent_at: string | null
          status: string | null
          subcategory: string | null
          subject: string | null
          thread_id: string | null
          type: string | null
          validated_at: string | null
        }
        Insert: {
          body?: string | null
          category?: string | null
          created_at?: string | null
          direction?: string | null
          email_id?: string | null
          id?: string
          received_at?: string | null
          sender_email?: string | null
          sender_name?: string | null
          sent_at?: string | null
          status?: string | null
          subcategory?: string | null
          subject?: string | null
          thread_id?: string | null
          type?: string | null
          validated_at?: string | null
        }
        Update: {
          body?: string | null
          category?: string | null
          created_at?: string | null
          direction?: string | null
          email_id?: string | null
          id?: string
          received_at?: string | null
          sender_email?: string | null
          sender_name?: string | null
          sent_at?: string | null
          status?: string | null
          subcategory?: string | null
          subject?: string | null
          thread_id?: string | null
          type?: string | null
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sender_email"
            columns: ["sender_email"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["email"]
          },
        ]
      }
    }
    Views: {
      email_threads: {
        Row: {
          body: string | null
          category: string | null
          created_at: string | null
          direction: string | null
          id: string | null
          received_at: string | null
          sender_email: string | null
          sender_name: string | null
          sent_at: string | null
          status: string | null
          subcategory: string | null
          subject: string | null
          thread_id: string | null
          type: string | null
          validated_at: string | null
        }
        Insert: {
          body?: string | null
          category?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string | null
          received_at?: string | null
          sender_email?: string | null
          sender_name?: string | null
          sent_at?: string | null
          status?: string | null
          subcategory?: string | null
          subject?: string | null
          thread_id?: string | null
          type?: string | null
          validated_at?: string | null
        }
        Update: {
          body?: string | null
          category?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string | null
          received_at?: string | null
          sender_email?: string | null
          sender_name?: string | null
          sent_at?: string | null
          status?: string | null
          subcategory?: string | null
          subject?: string | null
          thread_id?: string | null
          type?: string | null
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sender_email"
            columns: ["sender_email"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["email"]
          },
        ]
      }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
