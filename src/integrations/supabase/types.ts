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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      businesses: {
        Row: {
          active: boolean
          address: string | null
          approval_status: Database["public"]["Enums"]["approval_status"]
          business_type: Database["public"]["Enums"]["business_type"]
          confirmation_message: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          emola_number: string | null
          id: string
          logo_url: string | null
          mpesa_number: string | null
          name: string
          owner_id: string
          payment_required: boolean
          primary_color: string | null
          secondary_color: string | null
          signal_amount: number | null
          slug: string
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          business_type?: Database["public"]["Enums"]["business_type"]
          confirmation_message?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          emola_number?: string | null
          id?: string
          logo_url?: string | null
          mpesa_number?: string | null
          name: string
          owner_id: string
          payment_required?: boolean
          primary_color?: string | null
          secondary_color?: string | null
          signal_amount?: number | null
          slug: string
          updated_at?: string
          whatsapp_number: string
        }
        Update: {
          active?: boolean
          address?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          business_type?: Database["public"]["Enums"]["business_type"]
          confirmation_message?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          emola_number?: string | null
          id?: string
          logo_url?: string | null
          mpesa_number?: string | null
          name?: string
          owner_id?: string
          payment_required?: boolean
          primary_color?: string | null
          secondary_color?: string | null
          signal_amount?: number | null
          slug?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_paid: number | null
          business_id: string
          client_name: string
          client_phone: string
          created_at: string
          delivery_address: string | null
          delivery_date: string
          delivery_time: string | null
          id: string
          notes: string | null
          order_description: string | null
          order_type: string | null
          payment_confirmed: boolean | null
          payment_method: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          transaction_code: string | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          business_id: string
          client_name: string
          client_phone: string
          created_at?: string
          delivery_address?: string | null
          delivery_date: string
          delivery_time?: string | null
          id?: string
          notes?: string | null
          order_description?: string | null
          order_type?: string | null
          payment_confirmed?: boolean | null
          payment_method?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          transaction_code?: string | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          business_id?: string
          client_name?: string
          client_phone?: string
          created_at?: string
          delivery_address?: string | null
          delivery_date?: string
          delivery_time?: string | null
          id?: string
          notes?: string | null
          order_description?: string | null
          order_type?: string | null
          payment_confirmed?: boolean | null
          payment_method?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          transaction_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          business_id: string
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          business_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          business_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          currency: string
          due_date: string
          id: string
          paid_at: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          business_id: string
          created_at?: string
          currency?: string
          due_date: string
          id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          currency?: string
          due_date?: string
          id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      used_transaction_codes: {
        Row: {
          business_id: string
          created_at: string
          id: string
          order_id: string | null
          transaction_code: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          order_id?: string | null
          transaction_code: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          order_id?: string | null
          transaction_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "used_transaction_codes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "used_transaction_codes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          business_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          business_id?: string | null
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
      get_user_business_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin"
      approval_status: "pending" | "approved" | "rejected" | "blocked"
      business_type:
        | "lanchonete"
        | "bolos"
        | "buques"
        | "restaurante"
        | "outro"
        | "presente"
        | "decoracao"
        | "personalizado"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "ready"
        | "delivered"
        | "cancelled"
      subscription_status: "active" | "pending" | "overdue" | "cancelled"
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
      app_role: ["super_admin", "admin"],
      approval_status: ["pending", "approved", "rejected", "blocked"],
      business_type: [
        "lanchonete",
        "bolos",
        "buques",
        "restaurante",
        "outro",
        "presente",
        "decoracao",
        "personalizado",
      ],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
      ],
      subscription_status: ["active", "pending", "overdue", "cancelled"],
    },
  },
} as const
