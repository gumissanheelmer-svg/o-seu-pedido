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
      affiliate_sales_orders: {
        Row: {
          affiliate_id: string
          business_id: string
          commission_value: number
          created_at: string
          id: string
          platform_profit: number | null
          sale_value: number
        }
        Insert: {
          affiliate_id: string
          business_id: string
          commission_value?: number
          created_at?: string
          id?: string
          platform_profit?: number | null
          sale_value?: number
        }
        Update: {
          affiliate_id?: string
          business_id?: string
          commission_value?: number
          created_at?: string
          id?: string
          platform_profit?: number | null
          sale_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_sales_orders_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_sales_orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates_orders: {
        Row: {
          active: boolean
          created_at: string
          fixed_commission: number
          id: string
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          fixed_commission?: number
          id?: string
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          fixed_commission?: number
          id?: string
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          business_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          business_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          business_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          active: boolean
          address: string | null
          affiliate_id: string | null
          approval_status: Database["public"]["Enums"]["approval_status"]
          business_type: Database["public"]["Enums"]["business_type"]
          confirmation_message: string | null
          cover_image_url: string | null
          cover_video_url: string | null
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
          affiliate_id?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          business_type?: Database["public"]["Enums"]["business_type"]
          confirmation_message?: string | null
          cover_image_url?: string | null
          cover_video_url?: string | null
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
          affiliate_id?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          business_type?: Database["public"]["Enums"]["business_type"]
          confirmation_message?: string | null
          cover_image_url?: string | null
          cover_video_url?: string | null
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
        Relationships: [
          {
            foreignKeyName: "businesses_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean
          business_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          business_id: string
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      impersonate_sessions: {
        Row: {
          active: boolean
          ended_at: string | null
          id: string
          started_at: string
          super_admin_id: string
          target_business_id: string
        }
        Insert: {
          active?: boolean
          ended_at?: string | null
          id?: string
          started_at?: string
          super_admin_id: string
          target_business_id: string
        }
        Update: {
          active?: boolean
          ended_at?: string | null
          id?: string
          started_at?: string
          super_admin_id?: string
          target_business_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "impersonate_sessions_target_business_id_fkey"
            columns: ["target_business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          selected_options: Json | null
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
          selected_options?: Json | null
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
          selected_options?: Json | null
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
          customer_id: string | null
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
          customer_id?: string | null
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
          customer_id?: string | null
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
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_option_values: {
        Row: {
          active: boolean
          created_at: string
          id: string
          option_id: string
          price_adjustment: number | null
          sort_order: number | null
          value: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          option_id: string
          price_adjustment?: number | null
          sort_order?: number | null
          value: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          option_id?: string
          price_adjustment?: number | null
          sort_order?: number | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_option_values_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "product_options"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          created_at: string
          id: string
          name: string
          product_id: string
          required: boolean
          sort_order: number | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          product_id: string
          required?: boolean
          sort_order?: number | null
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          product_id?: string
          required?: boolean
          sort_order?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          business_id: string
          category: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          image_urls: Json | null
          main_image_url: string | null
          name: string
          prep_hours: number | null
          price: number
          sort_order: number | null
          updated_at: string
          video_urls: Json | null
        }
        Insert: {
          active?: boolean
          business_id: string
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          image_urls?: Json | null
          main_image_url?: string | null
          name: string
          prep_hours?: number | null
          price: number
          sort_order?: number | null
          updated_at?: string
          video_urls?: Json | null
        }
        Update: {
          active?: boolean
          business_id?: string
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          image_urls?: Json | null
          main_image_url?: string | null
          name?: string
          prep_hours?: number | null
          price?: number
          sort_order?: number | null
          updated_at?: string
          video_urls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_payments: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          currency: string
          id: string
          notes: string | null
          paid_at: string
          recorded_by: string | null
          reference: string | null
          subscription_id: string
        }
        Insert: {
          amount: number
          business_id: string
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          paid_at?: string
          recorded_by?: string | null
          reference?: string | null
          subscription_id: string
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          paid_at?: string
          recorded_by?: string | null
          reference?: string | null
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
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
      super_admin_emails: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
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
      is_super_admin_email: { Args: { _email: string }; Returns: boolean }
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
