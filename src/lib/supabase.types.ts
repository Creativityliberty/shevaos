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
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          settings: Json
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          settings?: Json
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          settings?: Json
          deleted_at?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          tenant_id: string | null
          email: string
          full_name: string | null
          role: Database['public']['Enums']['user_role']
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string
          tenant_id?: string | null
          email: string
          full_name?: string | null
          role?: Database['public']['Enums']['user_role']
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          tenant_id?: string | null
          email?: string
          full_name?: string | null
          role?: Database['public']['Enums']['user_role']
          is_active?: boolean
          updated_at?: string
          deleted_at?: string | null
        }
      }
      customers: {
        Row: {
          id: string
          tenant_id: string
          full_name: string
          phone: string
          secondary_phone: string | null
          address: string | null
          city: string | null
          zone_id: string | null
          status: string
          notes: string | null
          total_orders: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          full_name: string
          phone: string
          secondary_phone?: string | null
          address?: string | null
          city?: string | null
          zone_id?: string | null
          status?: string
          notes?: string | null
          total_orders?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          full_name?: string
          phone?: string
          secondary_phone?: string | null
          address?: string | null
          city?: string | null
          zone_id?: string | null
          status?: string
          notes?: string | null
          total_orders?: number
          updated_at?: string
          deleted_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          tenant_id: string
          order_number: string
          customer_id: string
          zone_id: string
          status: Database['public']['Enums']['order_status']
          total_amount: number
          cod_amount: number
          delivery_fee: number
          delivery_address: string
          source: string | null
          campaign_id: string | null
          sav_agent_id: string | null
          notes: string | null
          attempt_count: number
          confirmed_at: string | null
          delivered_at: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          order_number?: string
          customer_id: string
          zone_id: string
          status?: Database['public']['Enums']['order_status']
          total_amount?: number
          cod_amount?: number
          delivery_fee?: number
          delivery_address: string
          source?: string | null
          campaign_id?: string | null
          sav_agent_id?: string | null
          notes?: string | null
          attempt_count?: number
          confirmed_at?: string | null
          delivered_at?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          status?: Database['public']['Enums']['order_status']
          cod_amount?: number
          delivery_fee?: number
          delivery_address?: string
          source?: string | null
          campaign_id?: string | null
          notes?: string | null
          attempt_count?: number
          confirmed_at?: string | null
          delivered_at?: string | null
          verified_at?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          subtotal: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          quantity?: number
          unit_price?: number
        }
      }
      order_events: {
        Row: {
          id: string
          order_id: string
          event_type: string
          from_status: string | null
          to_status: string | null
          operator_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          event_type: string
          from_status?: string | null
          to_status?: string | null
          operator_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: never
      }
      products: {
        Row: {
          id: string
          tenant_id: string
          sku: string
          name: string
          description: string | null
          unit_price: number
          min_stock_level: number
          is_active: boolean
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          sku: string
          name: string
          description?: string | null
          unit_price: number
          min_stock_level?: number
          is_active?: boolean
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          sku?: string
          name?: string
          description?: string | null
          unit_price?: number
          min_stock_level?: number
          is_active?: boolean
          deleted_at?: string | null
        }
      }
      stock_levels: {
        Row: {
          id: string
          product_id: string
          hub_id: string
          total_stock: number
          reserved_stock: number
          available_stock: number
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          hub_id: string
          total_stock?: number
          reserved_stock?: number
          updated_at?: string
        }
        Update: {
          total_stock?: number
          reserved_stock?: number
          updated_at?: string
        }
      }
      hubs: {
        Row: {
          id: string
          tenant_id: string
          name: string
          address: string | null
          city: string | null
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          address?: string | null
          city?: string | null
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          name?: string
          address?: string | null
          city?: string | null
          deleted_at?: string | null
        }
      }
      zones: {
        Row: {
          id: string
          tenant_id: string
          hub_id: string | null
          name: string
          delivery_fee: number
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          hub_id?: string | null
          name: string
          delivery_fee?: number
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          hub_id?: string | null
          name?: string
          delivery_fee?: number
          deleted_at?: string | null
        }
      }
      deliveries: {
        Row: {
          id: string
          order_id: string
          driver_id: string | null
          hub_id: string | null
          tenant_id: string | null
          status: string
          assigned_at: string
          delivered_at: string | null
          failed_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          driver_id?: string | null
          hub_id?: string | null
          tenant_id?: string | null
          status?: string
          assigned_at?: string
          delivered_at?: string | null
          failed_reason?: string | null
          created_at?: string
        }
        Update: {
          driver_id?: string | null
          hub_id?: string | null
          tenant_id?: string | null
          status?: string
          delivered_at?: string | null
          failed_reason?: string | null
        }
      }
      cash_collections: {
        Row: {
          id: string
          delivery_id: string
          driver_id: string
          tenant_id: string | null
          expected_amount: number
          collected_amount: number
          collected_at: string
          deposited: boolean
          deposit_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          delivery_id: string
          driver_id: string
          tenant_id?: string | null
          expected_amount: number
          collected_amount: number
          collected_at?: string
          deposited?: boolean
          deposit_id?: string | null
          created_at?: string
        }
        Update: {
          deposited?: boolean
          deposit_id?: string | null
        }
      }
      deposits: {
        Row: {
          id: string
          tenant_id: string
          driver_id: string
          hub_id: string | null
          declared_amount: number
          counted_amount: number | null
          verified_amount: number | null
          status: string
          hub_validated_by: string | null
          hub_validated_at: string | null
          finance_verified_by: string | null
          finance_verified_at: string | null
          discrepancy_amount: number
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          driver_id: string
          hub_id?: string | null
          declared_amount: number
          counted_amount?: number | null
          verified_amount?: number | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          counted_amount?: number | null
          verified_amount?: number | null
          status?: string
          hub_validated_by?: string | null
          hub_validated_at?: string | null
          finance_verified_by?: string | null
          finance_verified_at?: string | null
          notes?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
      }
      ledger_entries: {
        Row: {
          id: string
          tenant_id: string
          type: string
          amount: number
          reference_id: string | null
          reference_table: string | null
          description: string
          operator_id: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          type: string
          amount: number
          reference_id?: string | null
          reference_table?: string | null
          description: string
          operator_id: string
          created_at?: string
        }
        Update: never  // IMMUABLE — aucune mise à jour autorisée
      }
      stock_movements: {
        Row: {
          id: string
          tenant_id: string
          product_id: string
          hub_id: string | null
          type: string
          quantity: number
          reference_id: string | null
          operator_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          product_id: string
          hub_id?: string | null
          type: string
          quantity: number
          reference_id?: string | null
          operator_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: never  // Les mouvements sont immuables
      }
      alerts: {
        Row: {
          id: string
          tenant_id: string
          type: string
          severity: string
          title: string
          message: string
          reference_id: string | null
          reference_table: string | null
          is_read: boolean
          is_resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          type: string
          severity?: string
          title: string
          message: string
          reference_id?: string | null
          reference_table?: string | null
          is_read?: boolean
          is_resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          created_at?: string
        }
        Update: {
          is_read?: boolean
          is_resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
        }
      }
      tenant_settings: {
        Row: {
          tenant_id: string
          cash_discrepancy_threshold: number
          cash_deposit_warning_hours: number
          cash_deposit_critical_hours: number
          max_cash_per_driver: number
          stock_alert_threshold: number
          max_orders_per_driver: number
          delivery_timeout_minutes: number
          default_currency: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          tenant_id: string
          cash_discrepancy_threshold?: number
          cash_deposit_warning_hours?: number
          cash_deposit_critical_hours?: number
          max_cash_per_driver?: number
          stock_alert_threshold?: number
          max_orders_per_driver?: number
          delivery_timeout_minutes?: number
          default_currency?: string
          timezone?: string
        }
        Update: {
          cash_discrepancy_threshold?: number
          cash_deposit_warning_hours?: number
          cash_deposit_critical_hours?: number
          max_cash_per_driver?: number
          stock_alert_threshold?: number
          max_orders_per_driver?: number
          delivery_timeout_minutes?: number
          default_currency?: string
          timezone?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_order_with_stock_check: {
        Args: {
          p_tenant_id: string
          p_customer_id: string
          p_zone_id: string
          p_sav_agent_id: string
          p_delivery_address: string
          p_cod_amount: number
          p_delivery_fee: number
          p_items: Json
        }
        Returns: string
      }
      assign_delivery: {
        Args: { p_order_id: string; p_driver_id: string }
        Returns: Json
      }
      confirm_delivery: {
        Args: { p_delivery_id: string; p_collected_amount: number }
        Returns: Json
      }
      report_failure: {
        Args: { p_delivery_id: string; p_reason: string }
        Returns: Json
      }
      cancel_order_with_reason: {
        Args: {
          p_order_id: string
          p_reason: string
          p_operator_id: string
        }
        Returns: string
      }
      verify_and_ledger_deposit: {
        Args: {
          p_deposit_id: string
          p_verified_amount: number
          p_notes?: string
        }
        Returns: Json
      }
      get_tenant_settings: {
        Args: { p_tenant_id: string }
        Returns: {
          cash_discrepancy_threshold: number
          stock_alert_threshold: number
          cash_deposit_warning_hours: number
          cash_deposit_critical_hours: number
          max_cash_per_driver: number
          max_orders_per_driver: number
          delivery_timeout_minutes: number
          default_currency: string
          timezone: string
        }[]
      }
    }
    Enums: {
      user_role:
        | 'ceo'
        | 'manager'
        | 'sav_agent'
        | 'sav_manager'
        | 'dispatcher'
        | 'ops_manager'
        | 'driver'
        | 'hub'
        | 'hub_manager'
        | 'finance'
        | 'ads_manager'
        | 'achats'
        | 'stock_manager'
        | 'super_admin'
      order_status:
        | 'BROUILLON'
        | 'CONFIRMÉE'
        | 'ASSIGNÉE'
        | 'EN_LIVRAISON'
        | 'LIVRÉE'
        | 'ECHEC_LIVRAISON'
        | 'REPROGRAMMÉE'
        | 'ANNULÉE'
        | 'ENCAISSÉE'
        | 'DÉPOSÉE'
        | 'VÉRIFIÉE'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

// Aliases pratiques
export type TenantRow = Tables<'tenants'>
export type UserProfileRow = Tables<'user_profiles'>
export type CustomerRow = Tables<'customers'>
export type OrderRow = Tables<'orders'>
export type OrderItemRow = Tables<'order_items'>
export type OrderEventRow = Tables<'order_events'>
export type ProductRow = Tables<'products'>
export type StockLevelRow = Tables<'stock_levels'>
export type HubRow = Tables<'hubs'>
export type ZoneRow = Tables<'zones'>
export type DeliveryRow = Tables<'deliveries'>
export type CashCollectionRow = Tables<'cash_collections'>
export type DepositRow = Tables<'deposits'>
export type LedgerEntryRow = Tables<'ledger_entries'>
export type StockMovementRow = Tables<'stock_movements'>
export type AlertRow = Tables<'alerts'>
export type TenantSettingsRow = Tables<'tenant_settings'>

export type OrderStatus = Enums<'order_status'>
export type UserRoleEnum = Enums<'user_role'>
