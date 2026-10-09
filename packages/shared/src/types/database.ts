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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          label: string | null
          landmark: string | null
          lat: number | null
          line1: string
          line2: string | null
          lng: number | null
          phone: string
          pincode: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          label?: string | null
          landmark?: string | null
          lat?: number | null
          line1: string
          line2?: string | null
          lng?: number | null
          phone: string
          pincode: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string | null
          landmark?: string | null
          lat?: number | null
          line1?: string
          line2?: string | null
          lng?: number | null
          phone?: string
          pincode?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_invites: {
        Row: {
          consumed_at: string | null
          consumed_user_id: string | null
          created_at: string
          email: string
          invited_by: string | null
          role: Database["public"]["Enums"]["admin_role"]
        }
        Insert: {
          consumed_at?: string | null
          consumed_user_id?: string | null
          created_at?: string
          email: string
          invited_by?: string | null
          role: Database["public"]["Enums"]["admin_role"]
        }
        Update: {
          consumed_at?: string | null
          consumed_user_id?: string | null
          created_at?: string
          email?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Relationships: [
          {
            foreignKeyName: "admin_invites_consumed_user_id_fkey"
            columns: ["consumed_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          is_active: boolean
          role: Database["public"]["Enums"]["admin_role"]
          seller_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          is_active?: boolean
          role: Database["public"]["Enums"]["admin_role"]
          seller_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          seller_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_users_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attribute_sets: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          option_types: Json
          spec_fields: Json
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          option_types?: Json
          spec_fields?: Json
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          option_types?: Json
          spec_fields?: Json
          updated_at?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          category_id: string | null
          created_at: string
          deep_link: string | null
          ends_at: string | null
          id: string
          image_path: string
          is_active: boolean
          placement: string
          sort_order: number
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          deep_link?: string | null
          ends_at?: string | null
          id?: string
          image_path: string
          is_active?: boolean
          placement: string
          sort_order?: number
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          deep_link?: string | null
          ends_at?: string | null
          id?: string
          image_path?: string
          is_active?: boolean
          placement?: string
          sort_order?: number
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "banners_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          logo_path: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          logo_path?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          logo_path?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          added_at: string
          cart_id: string
          id: string
          quantity: number
          variant_id: string
        }
        Insert: {
          added_at?: string
          cart_id: string
          id?: string
          quantity: number
          variant_id: string
        }
        Update: {
          added_at?: string
          cart_id?: string
          id?: string
          quantity?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          coupon_code: string | null
          created_at: string
          id: string
          pincode: string | null
          updated_at: string
          use_points: boolean
          user_id: string
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          id?: string
          pincode?: string | null
          updated_at?: string
          use_points?: boolean
          user_id: string
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          id?: string
          pincode?: string | null
          updated_at?: string
          use_points?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          default_attribute_set_id: string | null
          deleted_at: string | null
          id: string
          image_path: string | null
          is_active: boolean
          is_returnable: boolean | null
          issue_report_hours: number | null
          name: string
          parent_id: string | null
          path: string[]
          return_days: number | null
          sealed_return_only: boolean | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_attribute_set_id?: string | null
          deleted_at?: string | null
          id?: string
          image_path?: string | null
          is_active?: boolean
          is_returnable?: boolean | null
          issue_report_hours?: number | null
          name: string
          parent_id?: string | null
          path?: string[]
          return_days?: number | null
          sealed_return_only?: boolean | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_attribute_set_id?: string | null
          deleted_at?: string | null
          id?: string
          image_path?: string | null
          is_active?: boolean
          is_returnable?: boolean | null
          issue_report_hours?: number | null
          name?: string
          parent_id?: string | null
          path?: string[]
          return_days?: number | null
          sealed_return_only?: boolean | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_default_attribute_set_id_fkey"
            columns: ["default_attribute_set_id"]
            isOneToOne: false
            referencedRelation: "attribute_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string
          discount_paise: number
          id: string
          order_id: string
          status: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string
          discount_paise: number
          id?: string
          order_id: string
          status?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string
          discount_paise?: number
          id?: string
          order_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          category_ids: string[]
          code: string
          created_at: string
          description: string | null
          ends_at: string | null
          first_order_only: boolean
          id: string
          is_active: boolean
          max_discount_paise: number | null
          min_order_paise: number
          seller_id: string | null
          starts_at: string | null
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at: string
          usage_limit_per_user: number | null
          usage_limit_total: number | null
          value: number
        }
        Insert: {
          category_ids?: string[]
          code: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          first_order_only?: boolean
          id?: string
          is_active?: boolean
          max_discount_paise?: number | null
          min_order_paise?: number
          seller_id?: string | null
          starts_at?: string | null
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string
          usage_limit_per_user?: number | null
          usage_limit_total?: number | null
          value: number
        }
        Update: {
          category_ids?: string[]
          code?: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          first_order_only?: boolean
          id?: string
          is_active?: boolean
          max_discount_paise?: number | null
          min_order_paise?: number
          seller_id?: string | null
          starts_at?: string | null
          type?: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string
          usage_limit_per_user?: number | null
          usage_limit_total?: number | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          app_version: string | null
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          description: string | null
          enabled: boolean
          key: string
          rules: Json
          updated_at: string
        }
        Insert: {
          description?: string | null
          enabled?: boolean
          key: string
          rules?: Json
          updated_at?: string
        }
        Update: {
          description?: string | null
          enabled?: boolean
          key?: string
          rules?: Json
          updated_at?: string
        }
        Relationships: []
      }
      home_sections: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_active: boolean
          platform: string[]
          sort_order: number
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string[]
          sort_order?: number
          title?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string[]
          sort_order?: number
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          low_stock_threshold: number
          quantity: number
          reserved: number
          seller_id: string
          updated_at: string
          variant_id: string
        }
        Insert: {
          low_stock_threshold?: number
          quantity?: number
          reserved?: number
          seller_id: string
          updated_at?: string
          variant_id: string
        }
        Update: {
          low_stock_threshold?: number
          quantity?: number
          reserved?: number
          seller_id?: string
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_number_counters: {
        Row: {
          fy: string
          last_value: number
        }
        Insert: {
          fy: string
          last_value?: number
        }
        Update: {
          fy?: string
          last_value?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          channel: string
          created_at: string
          data: Json
          id: string
          read_at: string | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          channel: string
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          channel?: string
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          gst_rate: number
          hsn_code: string | null
          id: string
          image_path: string | null
          line_total_paise: number
          mrp_paise: number
          name: string
          order_id: string
          points_multiplier: number
          product_id: string
          quantity: number
          returned_quantity: number
          seller_id: string
          sku: string
          tax_paise: number
          unit_price_paise: number
          variant_id: string
          variant_label: string
        }
        Insert: {
          created_at?: string
          gst_rate?: number
          hsn_code?: string | null
          id?: string
          image_path?: string | null
          line_total_paise: number
          mrp_paise: number
          name: string
          order_id: string
          points_multiplier?: number
          product_id: string
          quantity: number
          returned_quantity?: number
          seller_id: string
          sku: string
          tax_paise?: number
          unit_price_paise: number
          variant_id: string
          variant_label: string
        }
        Update: {
          created_at?: string
          gst_rate?: number
          hsn_code?: string | null
          id?: string
          image_path?: string | null
          line_total_paise?: number
          mrp_paise?: number
          name?: string
          order_id?: string
          points_multiplier?: number
          product_id?: string
          quantity?: number
          returned_quantity?: number
          seller_id?: string
          sku?: string
          tax_paise?: number
          unit_price_paise?: number
          variant_id?: string
          variant_label?: string
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
          {
            foreignKeyName: "order_items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      order_number_counters: {
        Row: {
          last_value: number
          period: string
        }
        Insert: {
          last_value?: number
          period: string
        }
        Update: {
          last_value?: number
          period?: string
        }
        Relationships: []
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: number
          note: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: number
          note?: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: number
          note?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancel_reason: string | null
          cancelled_at: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          coupon_discount_paise: number
          created_at: string
          delivered_at: string | null
          delivery_fee_paise: number
          delivery_mode: Database["public"]["Enums"]["delivery_mode"]
          delivery_slot: unknown
          delivery_type: string
          id: string
          invoice_number: string | null
          invoice_path: string | null
          order_number: string
          packed_at: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          pincode: string
          placed_at: string | null
          points_credit_at: string | null
          points_credited: boolean
          points_discount_paise: number
          points_redeemed: number
          points_to_earn: number
          return_window_ends_at: string | null
          seller_id: string
          shipped_at: string | null
          shipping_address: Json
          status: Database["public"]["Enums"]["order_status"]
          subtotal_mrp_paise: number
          subtotal_paise: number
          tax_paise: number
          total_paise: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          coupon_discount_paise?: number
          created_at?: string
          delivered_at?: string | null
          delivery_fee_paise?: number
          delivery_mode: Database["public"]["Enums"]["delivery_mode"]
          delivery_slot?: unknown
          delivery_type?: string
          id?: string
          invoice_number?: string | null
          invoice_path?: string | null
          order_number?: string
          packed_at?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pincode: string
          placed_at?: string | null
          points_credit_at?: string | null
          points_credited?: boolean
          points_discount_paise?: number
          points_redeemed?: number
          points_to_earn?: number
          return_window_ends_at?: string | null
          seller_id: string
          shipped_at?: string | null
          shipping_address: Json
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_mrp_paise: number
          subtotal_paise: number
          tax_paise?: number
          total_paise: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          coupon_discount_paise?: number
          created_at?: string
          delivered_at?: string | null
          delivery_fee_paise?: number
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"]
          delivery_slot?: unknown
          delivery_type?: string
          id?: string
          invoice_number?: string | null
          invoice_path?: string | null
          order_number?: string
          packed_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pincode?: string
          placed_at?: string | null
          points_credit_at?: string | null
          points_credited?: boolean
          points_discount_paise?: number
          points_redeemed?: number
          points_to_earn?: number
          return_window_ends_at?: string | null
          seller_id?: string
          shipped_at?: string | null
          shipping_address?: Json
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_mrp_paise?: number
          subtotal_paise?: number
          tax_paise?: number
          total_paise?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_paise: number
          created_at: string
          currency: string
          error_code: string | null
          error_description: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          order_id: string
          provider: string
          provider_order_id: string | null
          provider_payment_id: string | null
          raw_event: Json | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount_paise: number
          created_at?: string
          currency?: string
          error_code?: string | null
          error_description?: string | null
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          order_id: string
          provider: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          raw_event?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount_paise?: number
          created_at?: string
          currency?: string
          error_code?: string | null
          error_description?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          order_id?: string
          provider?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          raw_event?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pincode_waitlist: {
        Row: {
          created_at: string
          email: string | null
          id: string
          notified_at: string | null
          phone: string | null
          pincode: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          notified_at?: string | null
          phone?: string | null
          pincode: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          notified_at?: string | null
          phone?: string | null
          pincode?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pincode_waitlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      points_boosters: {
        Row: {
          category_id: string
          created_at: string
          ends_at: string | null
          id: string
          is_active: boolean
          multiplier: number
          starts_at: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          multiplier?: number
          starts_at?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          multiplier?: number
          starts_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_boosters_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      points_ledger: {
        Row: {
          created_at: string
          created_by: string | null
          delta: number
          id: number
          note: string | null
          order_id: string | null
          reason: Database["public"]["Enums"]["points_reason"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delta: number
          id?: number
          note?: string | null
          order_id?: string | null
          reason: Database["public"]["Enums"]["points_reason"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delta?: number
          id?: number
          note?: string | null
          order_id?: string | null
          reason?: Database["public"]["Enums"]["points_reason"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_ledger_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          position: number
          product_id: string
          storage_path: string
          variant_id: string | null
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id: string
          storage_path: string
          variant_id?: string | null
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          storage_path?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          code: string
          id: string
          label: string
          position: number
          product_id: string
          values: string[]
        }
        Insert: {
          code: string
          id?: string
          label: string
          position?: number
          product_id: string
          values?: string[]
        }
        Update: {
          code?: string
          id?: string
          label?: string
          position?: number
          product_id?: string
          values?: string[]
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
          attribute_set_id: string
          brand_id: string | null
          category_id: string
          country_of_origin: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          gst_rate: number
          hsn_code: string | null
          id: string
          is_veg: boolean | null
          name: string
          rating_avg: number
          rating_count: number
          search: unknown
          seller_id: string
          slug: string
          specs: Json
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          attribute_set_id: string
          brand_id?: string | null
          category_id: string
          country_of_origin?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          gst_rate?: number
          hsn_code?: string | null
          id?: string
          is_veg?: boolean | null
          name: string
          rating_avg?: number
          rating_count?: number
          search?: unknown
          seller_id: string
          slug: string
          specs?: Json
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          attribute_set_id?: string
          brand_id?: string | null
          category_id?: string
          country_of_origin?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          gst_rate?: number
          hsn_code?: string | null
          id?: string
          is_veg?: boolean | null
          name?: string
          rating_avg?: number
          rating_count?: number
          search?: unknown
          seller_id?: string
          slug?: string
          specs?: Json
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_attribute_set_id_fkey"
            columns: ["attribute_set_id"]
            isOneToOne: false
            referencedRelation: "attribute_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          consent_at: string | null
          created_at: string
          default_pincode: string | null
          deleted_at: string | null
          full_name: string | null
          id: string
          last_active_at: string
          marketing_opt_in: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          consent_at?: string | null
          created_at?: string
          default_pincode?: string | null
          deleted_at?: string | null
          full_name?: string | null
          id: string
          last_active_at?: string
          marketing_opt_in?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          consent_at?: string | null
          created_at?: string
          default_pincode?: string | null
          deleted_at?: string | null
          full_name?: string | null
          id?: string
          last_active_at?: string
          marketing_opt_in?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recently_viewed: {
        Row: {
          product_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          product_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          product_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recently_viewed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount_paise: number
          created_at: string
          created_by: string | null
          id: string
          method: string
          order_id: string
          payment_id: string | null
          processed_at: string | null
          provider_refund_id: string | null
          reason: string | null
          return_id: string | null
          status: Database["public"]["Enums"]["refund_status"]
        }
        Insert: {
          amount_paise: number
          created_at?: string
          created_by?: string | null
          id?: string
          method: string
          order_id: string
          payment_id?: string | null
          processed_at?: string | null
          provider_refund_id?: string | null
          reason?: string | null
          return_id?: string | null
          status?: Database["public"]["Enums"]["refund_status"]
        }
        Update: {
          amount_paise?: number
          created_at?: string
          created_by?: string | null
          id?: string
          method?: string
          order_id?: string
          payment_id?: string | null
          processed_at?: string | null
          provider_refund_id?: string | null
          reason?: string | null
          return_id?: string | null
          status?: Database["public"]["Enums"]["refund_status"]
        }
        Relationships: [
          {
            foreignKeyName: "refunds_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "returns"
            referencedColumns: ["id"]
          },
        ]
      }
      request_rate_limits: {
        Row: {
          attempts: number
          scope: string
          subject: string
          window_start: string
        }
        Insert: {
          attempts: number
          scope: string
          subject: string
          window_start: string
        }
        Update: {
          attempts?: number
          scope?: string
          subject?: string
          window_start?: string
        }
        Relationships: []
      }
      returns: {
        Row: {
          admin_note: string | null
          created_at: string
          id: string
          items: Json
          order_id: string
          photo_paths: string[]
          reason: string
          status: Database["public"]["Enums"]["return_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          id?: string
          items: Json
          order_id: string
          photo_paths?: string[]
          reason: string
          status?: Database["public"]["Enums"]["return_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          id?: string
          items?: Json
          order_id?: string
          photo_paths?: string[]
          reason?: string
          status?: Database["public"]["Enums"]["return_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          order_item_id: string | null
          product_id: string
          rating: number
          status: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          order_item_id?: string | null
          product_id: string
          rating: number
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          order_item_id?: string | null
          product_id?: string
          rating?: number
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: true
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          created_at: string
          display_name: string
          fssai_license_no: string | null
          gstin: string | null
          id: string
          is_platform: boolean
          legal_name: string | null
          pan: string | null
          registered_address: Json | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          fssai_license_no?: string | null
          gstin?: string | null
          id?: string
          is_platform?: boolean
          legal_name?: string | null
          pan?: string | null
          registered_address?: Json | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          fssai_license_no?: string | null
          gstin?: string | null
          id?: string
          is_platform?: boolean
          legal_name?: string | null
          pan?: string | null
          registered_address?: Json | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      serviceability_requests: {
        Row: {
          created_at: string
          email: string | null
          id: string
          notified_at: string | null
          phone: string | null
          pincode: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          notified_at?: string | null
          phone?: string | null
          pincode: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          notified_at?: string | null
          phone?: string | null
          pincode?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "serviceability_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      serviceable_pincodes: {
        Row: {
          city: string | null
          cod_allowed: boolean
          cod_max_paise: number | null
          created_at: string
          delivery_fee_paise: number
          delivery_mode: Database["public"]["Enums"]["delivery_mode"]
          eta_text: string | null
          free_delivery_threshold_paise: number | null
          is_active: boolean
          is_placeholder: boolean
          min_order_paise: number
          pincode: string
          state: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          cod_allowed?: boolean
          cod_max_paise?: number | null
          created_at?: string
          delivery_fee_paise?: number
          delivery_mode: Database["public"]["Enums"]["delivery_mode"]
          eta_text?: string | null
          free_delivery_threshold_paise?: number | null
          is_active?: boolean
          is_placeholder?: boolean
          min_order_paise?: number
          pincode: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          cod_allowed?: boolean
          cod_max_paise?: number | null
          created_at?: string
          delivery_fee_paise?: number
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"]
          eta_text?: string | null
          free_delivery_threshold_paise?: number | null
          is_active?: boolean
          is_placeholder?: boolean
          min_order_paise?: number
          pincode?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          awb: string | null
          carrier: string | null
          created_at: string
          delivered_at: string | null
          id: string
          mode: Database["public"]["Enums"]["delivery_mode"]
          order_id: string
          rider_name: string | null
          rider_phone: string | null
          seller_id: string
          shipped_at: string | null
          status: string
          tracking_url: string | null
          updated_at: string
        }
        Insert: {
          awb?: string | null
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          mode: Database["public"]["Enums"]["delivery_mode"]
          order_id: string
          rider_name?: string | null
          rider_phone?: string | null
          seller_id: string
          shipped_at?: string | null
          status?: string
          tracking_url?: string | null
          updated_at?: string
        }
        Update: {
          awb?: string | null
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          mode?: Database["public"]["Enums"]["delivery_mode"]
          order_id?: string
          rider_name?: string | null
          rider_phone?: string | null
          seller_id?: string
          shipped_at?: string | null
          status?: string
          tracking_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_list_items: {
        Row: {
          confidence: number | null
          id: string
          list_id: string
          matched_variant_id: string | null
          parsed_name: string | null
          position: number
          quantity: number | null
          raw_line: string
          status: string
          unit: string | null
        }
        Insert: {
          confidence?: number | null
          id?: string
          list_id: string
          matched_variant_id?: string | null
          parsed_name?: string | null
          position?: number
          quantity?: number | null
          raw_line: string
          status?: string
          unit?: string | null
        }
        Update: {
          confidence?: number | null
          id?: string
          list_id?: string
          matched_variant_id?: string | null
          parsed_name?: string | null
          position?: number
          quantity?: number | null
          raw_line?: string
          status?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_matched_variant_id_fkey"
            columns: ["matched_variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_matched_variant_id_fkey"
            columns: ["matched_variant_id"]
            isOneToOne: false
            referencedRelation: "variants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string
          error: string | null
          id: string
          image_path: string | null
          model: string | null
          raw_text: string | null
          source: Database["public"]["Enums"]["shopping_list_source"]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          image_path?: string | null
          model?: string | null
          raw_text?: string | null
          source: Database["public"]["Enums"]["shopping_list_source"]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          image_path?: string | null
          model?: string | null
          raw_text?: string | null
          source?: Database["public"]["Enums"]["shopping_list_source"]
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      store_config: {
        Row: {
          business: Json
          features: Json
          id: string
          legal: Json
          logo_url: string | null
          store_name: string
          support: Json
          theme: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          business?: Json
          features?: Json
          id?: string
          legal?: Json
          logo_url?: string | null
          store_name?: string
          support?: Json
          theme?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          business?: Json
          features?: Json
          id?: string
          legal?: Json
          logo_url?: string | null
          store_name?: string
          support?: Json
          theme?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      username_reservations: {
        Row: {
          expires_at: string
          user_id: string
          username: string
        }
        Insert: {
          expires_at?: string
          user_id: string
          username: string
        }
        Update: {
          expires_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      usernames: {
        Row: {
          created_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "usernames_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      variants: {
        Row: {
          barcode: string | null
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          label: string
          max_per_order: number
          member_price_paise: number | null
          mrp_paise: number
          option_values: Json
          position: number
          price_paise: number
          product_id: string
          seller_id: string
          shipping_weight_grams: number | null
          sku: string
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          label: string
          max_per_order?: number
          member_price_paise?: number | null
          mrp_paise: number
          option_values?: Json
          position?: number
          price_paise: number
          product_id: string
          seller_id: string
          shipping_weight_grams?: number | null
          sku: string
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          label?: string
          max_per_order?: number
          member_price_paise?: number | null
          mrp_paise?: number
          option_values?: Json
          position?: number
          price_paise?: number
          product_id?: string
          seller_id?: string
          shipping_weight_grams?: number | null
          sku?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variants_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      inventory_available: {
        Row: {
          available: number | null
          is_low_stock: boolean | null
          seller_id: string | null
          variant_id: string | null
        }
        Insert: {
          available?: never
          is_low_stock?: never
          seller_id?: string | null
          variant_id?: string | null
        }
        Update: {
          available?: never
          is_low_stock?: never
          seller_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      payments_customer: {
        Row: {
          amount_paise: number | null
          created_at: string | null
          currency: string | null
          error_code: string | null
          error_description: string | null
          id: string | null
          method: Database["public"]["Enums"]["payment_method"] | null
          order_id: string | null
          provider: string | null
          provider_order_id: string | null
          provider_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      points_balances: {
        Row: {
          balance: number | null
          last_activity_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      variants_public: {
        Row: {
          barcode: string | null
          id: string | null
          label: string | null
          max_per_order: number | null
          member_price_paise: number | null
          mrp_paise: number | null
          option_values: Json | null
          position: number | null
          price_paise: number | null
          product_id: string | null
          seller_id: string | null
          shipping_weight_grams: number | null
          sku: string | null
        }
        Relationships: [
          {
            foreignKeyName: "variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variants_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      category_return_window: {
        Args: { p_category_id: string }
        Returns: string
      }
      check_pincode: {
        Args: { p_pincode: string }
        Returns: {
          cod_available: boolean
          eta_text: string
          min_order_paise: number
          mode: Database["public"]["Enums"]["delivery_mode"]
          serviceable: boolean
        }[]
      }
      commit_inventory: {
        Args: { p_quantity: number; p_seller_id: string; p_variant_id: string }
        Returns: undefined
      }
      consume_request_limit: {
        Args: {
          p_limit: number
          p_scope: string
          p_subject: string
          p_window_seconds: number
        }
        Returns: boolean
      }
      financial_year_label: { Args: { p_date?: string }; Returns: string }
      has_admin_role: {
        Args: { roles: Database["public"]["Enums"]["admin_role"][] }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_anonymous: { Args: never; Returns: boolean }
      lookup_coupon: {
        Args: { p_code: string }
        Returns: {
          category_ids: string[]
          code: string
          created_at: string
          description: string | null
          ends_at: string | null
          first_order_only: boolean
          id: string
          is_active: boolean
          max_discount_paise: number | null
          min_order_paise: number
          seller_id: string | null
          starts_at: string | null
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at: string
          usage_limit_per_user: number | null
          usage_limit_total: number | null
          value: number
        }
        SetofOptions: {
          from: "*"
          to: "coupons"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      next_invoice_number: { Args: never; Returns: string }
      next_order_number: { Args: never; Returns: string }
      orders_log_status: {
        Args: {
          p_order_id: string
          p_status: Database["public"]["Enums"]["order_status"]
        }
        Returns: undefined
      }
      points_balance: { Args: { p_user_id: string }; Returns: number }
      release_inventory: {
        Args: { p_quantity: number; p_seller_id: string; p_variant_id: string }
        Returns: undefined
      }
      reserve_inventory: {
        Args: { p_quantity: number; p_seller_id: string; p_variant_id: string }
        Returns: boolean
      }
      set_default_address: {
        Args: { p_address_id: string }
        Returns: undefined
      }
      username_available: { Args: { p_username: string }; Returns: boolean }
    }
    Enums: {
      admin_role: "super_admin" | "manager" | "catalog" | "orders" | "support"
      coupon_type: "percent" | "flat" | "free_delivery"
      delivery_mode: "own_delivery" | "courier"
      order_status:
        | "pending_payment"
        | "placed"
        | "packed"
        | "shipped"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
        | "return_requested"
        | "returned"
        | "refunded"
      payment_method: "upi" | "card" | "wallet" | "netbanking" | "cod"
      payment_status:
        | "created"
        | "pending"
        | "captured"
        | "failed"
        | "refunded"
        | "partially_refunded"
      points_reason:
        | "earn_order"
        | "earn_booster"
        | "redeem_order"
        | "reverse_cancel"
        | "reverse_return"
        | "expire"
        | "admin_adjust"
      product_status: "draft" | "active" | "archived"
      refund_status: "pending" | "processing" | "processed" | "failed"
      return_status:
        | "requested"
        | "approved"
        | "rejected"
        | "picked_up"
        | "received"
        | "refunded"
      shopping_list_source: "text" | "photo" | "upload"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      admin_role: ["super_admin", "manager", "catalog", "orders", "support"],
      coupon_type: ["percent", "flat", "free_delivery"],
      delivery_mode: ["own_delivery", "courier"],
      order_status: [
        "pending_payment",
        "placed",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "return_requested",
        "returned",
        "refunded",
      ],
      payment_method: ["upi", "card", "wallet", "netbanking", "cod"],
      payment_status: [
        "created",
        "pending",
        "captured",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      points_reason: [
        "earn_order",
        "earn_booster",
        "redeem_order",
        "reverse_cancel",
        "reverse_return",
        "expire",
        "admin_adjust",
      ],
      product_status: ["draft", "active", "archived"],
      refund_status: ["pending", "processing", "processed", "failed"],
      return_status: [
        "requested",
        "approved",
        "rejected",
        "picked_up",
        "received",
        "refunded",
      ],
      shopping_list_source: ["text", "photo", "upload"],
    },
  },
} as const
