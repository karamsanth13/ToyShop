export type AdminRole = "Admin" | "Super Admin";
export type SocialPlatform = "Instagram" | "Facebook" | "YouTube" | "TikTok" | "Other";

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: { id: string; full_name: string; email: string; role: AdminRole; created_at: string; updated_at: string };
        Insert: { id: string; full_name: string; email: string; role: AdminRole; created_at?: string; updated_at?: string };
        Update: { id?: string; full_name?: string; email?: string; role?: AdminRole; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      shop_details: {
        Row: { id: number; name: string | null; description: string | null; logo_path: string | null; address: string | null; map_location: string | null; phone: string | null; whatsapp_number: string | null; email: string | null; updated_at: string };
        Insert: { id?: number; name?: string | null; description?: string | null; logo_path?: string | null; address?: string | null; map_location?: string | null; phone?: string | null; whatsapp_number?: string | null; email?: string | null; updated_at?: string };
        Update: { id?: number; name?: string | null; description?: string | null; logo_path?: string | null; address?: string | null; map_location?: string | null; phone?: string | null; whatsapp_number?: string | null; email?: string | null; updated_at?: string };
        Relationships: [];
      };
      social_links: {
        Row: { id: string; platform: SocialPlatform; url: string; label: string | null; sort_order: number; created_at: string; updated_at: string };
        Insert: { id?: string; platform: SocialPlatform; url: string; label?: string | null; sort_order?: number; created_at?: string; updated_at?: string };
        Update: { id?: string; platform?: SocialPlatform; url?: string; label?: string | null; sort_order?: number; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      login_rate_limits: {
        Row: { bucket_hash: string; failures: number; window_started_at: string; locked_until: string | null; updated_at: string };
        Insert: { bucket_hash: string; failures?: number; window_started_at?: string; locked_until?: string | null; updated_at?: string };
        Update: { bucket_hash?: string; failures?: number; window_started_at?: string; locked_until?: string | null; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_admin_role: { Args: Record<PropertyKey, never>; Returns: AdminRole | null };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_super_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      login_bucket_is_limited: { Args: { p_bucket_hash: string }; Returns: boolean };
      record_login_failure: { Args: { p_bucket_hash: string }; Returns: undefined };
      clear_login_failures: { Args: { p_bucket_hash: string }; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
