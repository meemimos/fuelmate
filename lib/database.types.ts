export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          push_token: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          push_token?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          push_token?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          role: 'owner' | 'member';
          joined_at: string | null;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          role?: 'owner' | 'member';
          joined_at?: string | null;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          role?: 'owner' | 'member';
          joined_at?: string | null;
        };
        Relationships: [];
      };
      price_alerts: {
        Row: {
          id: string;
          user_id: string;
          fuel_type: 'Unleaded' | 'Premium' | 'Diesel' | 'E10';
          threshold_cents: number;
          station_name: string | null;
          is_active: boolean;
          last_triggered_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          fuel_type: 'Unleaded' | 'Premium' | 'Diesel' | 'E10';
          threshold_cents: number;
          station_name?: string | null;
          is_active?: boolean;
          last_triggered_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          fuel_type?: 'Unleaded' | 'Premium' | 'Diesel' | 'E10';
          threshold_cents?: number;
          station_name?: string | null;
          is_active?: boolean;
          last_triggered_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      fill_records: {
        Row: {
          id: string;
          user_id: string;
          group_id: string | null;
          station_name: string;
          fuel_type: 'Unleaded' | 'Premium' | 'Diesel' | 'E10';
          locked_price_cents: number;
          pump_price_cents: number;
          litres: number;
          saved_dollars: number | null;
          filled_at: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          group_id?: string | null;
          station_name: string;
          fuel_type: 'Unleaded' | 'Premium' | 'Diesel' | 'E10';
          locked_price_cents: number;
          pump_price_cents: number;
          litres: number;
          filled_at: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          group_id?: string | null;
          station_name?: string;
          fuel_type?: 'Unleaded' | 'Premium' | 'Diesel' | 'E10';
          locked_price_cents?: number;
          pump_price_cents?: number;
          litres?: number;
          filled_at?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      station_prices: {
        Row: {
          id: string;
          station_name: string;
          brand: string | null;
          address: string | null;
          lat: number | null;
          lng: number | null;
          fuel_type: string;
          price_cents: number;
          last_updated: string | null;
        };
        Insert: {
          id?: string;
          station_name: string;
          brand?: string | null;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          fuel_type: string;
          price_cents: number;
          last_updated?: string | null;
        };
        Update: {
          id?: string;
          station_name?: string;
          brand?: string | null;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          fuel_type?: string;
          price_cents?: number;
          last_updated?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
