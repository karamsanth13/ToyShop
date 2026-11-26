export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type AdminRole = "Admin" | "Super Admin";
export type SocialPlatform = "Instagram" | "Facebook" | "YouTube" | "TikTok" | "Other";

type Table<Row, Insert, Update, Relationships = []> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

type Timestamped = { created_at: string; updated_at: string };
type CategoryRow = Timestamped & {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
};
type ProductRow = Timestamped & {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  price: number;
  images: string[];
  description: string | null;
  availability: "in_stock" | "out_of_stock";
  is_published: boolean;
  is_rare: boolean;
  is_new: boolean;
  is_recommended: boolean;
};
type OfferRow = Timestamped & {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  is_published: boolean;
};
type OfferProductRow = { offer_id: string; product_id: string; created_at: string };

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: { id: string; full_name: string; email: string; role: AdminRole; is_active: boolean; created_at: string; updated_at: string };
        Insert: { id: string; full_name: string; email: string; role: AdminRole; is_active?: boolean; created_at?: string; updated_at?: string };
        Update: { id?: string; full_name?: string; email?: string; role?: AdminRole; is_active?: boolean; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      shop_details: {
        Row: { id: number; name: string | null; description: string | null; logo_path: string | null; address: string | null; map_location: string | null; phone: string | null; whatsapp_number: string | null; email: string | null; opening_hours: string | null; updated_at: string };
        Insert: { id?: number; name?: string | null; description?: string | null; logo_path?: string | null; address?: string | null; map_location?: string | null; phone?: string | null; whatsapp_number?: string | null; email?: string | null; opening_hours?: string | null; updated_at?: string };
        Update: { id?: number; name?: string | null; description?: string | null; logo_path?: string | null; address?: string | null; map_location?: string | null; phone?: string | null; whatsapp_number?: string | null; email?: string | null; opening_hours?: string | null; updated_at?: string };
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
      categories: Table<
        CategoryRow,
        Omit<CategoryRow, keyof Timestamped | "id"> & Partial<Pick<CategoryRow, keyof Timestamped | "id">>,
        Partial<Omit<CategoryRow, "id" | "created_at">>,
        []
      >;
      products: Table<
        ProductRow,
        Omit<ProductRow, keyof Timestamped | "id"> & Partial<Pick<ProductRow, keyof Timestamped | "id">>,
        Partial<Omit<ProductRow, "id" | "created_at">>,
        [{ foreignKeyName: "products_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] }]
      >;
      offers: Table<
        OfferRow,
        Omit<OfferRow, keyof Timestamped | "id"> & Partial<Pick<OfferRow, keyof Timestamped | "id">>,
        Partial<Omit<OfferRow, "id" | "created_at">>,
        []
      >;
      offer_products: Table<
        OfferProductRow,
        OfferProductRow,
        Partial<OfferProductRow>,
        [
          { foreignKeyName: "offer_products_offer_id_fkey"; columns: ["offer_id"]; isOneToOne: false; referencedRelation: "offers"; referencedColumns: ["id"] },
          { foreignKeyName: "offer_products_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ]
      >;
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
