export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Insert, Update, Relationships = []> = {
  Row: Row; Insert: Insert; Update: Update; Relationships: Relationships;
};

type Timestamped = { created_at: string; updated_at: string };
type CategoryRow = Timestamped & { id: string; name: string; slug: string; description: string | null; sort_order: number; is_published: boolean };
type ProductRow = Timestamped & {
  id: string; name: string; slug: string; category_id: string | null; price: number;
  images: string[]; description: string | null; availability: "in_stock" | "out_of_stock";
  is_published: boolean; is_rare: boolean; is_new: boolean; is_recommended: boolean;
};
type OfferRow = Timestamped & { id: string; title: string; description: string | null; starts_at: string; ends_at: string; is_published: boolean };
type OfferProductRow = { offer_id: string; product_id: string; created_at: string };

export interface Database {
  public: {
    Tables: {
      categories: Table<CategoryRow, Omit<CategoryRow, keyof Timestamped | "id"> & Partial<Pick<CategoryRow, keyof Timestamped | "id">>, Partial<Omit<CategoryRow, "id" | "created_at">>, []>;
      products: Table<ProductRow, Omit<ProductRow, keyof Timestamped | "id"> & Partial<Pick<ProductRow, keyof Timestamped | "id">>, Partial<Omit<ProductRow, "id" | "created_at">>, [
        { foreignKeyName: "products_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] },
      ]>;
      offers: Table<OfferRow, Omit<OfferRow, keyof Timestamped | "id"> & Partial<Pick<OfferRow, keyof Timestamped | "id">>, Partial<Omit<OfferRow, "id" | "created_at">>, []>;
      offer_products: Table<OfferProductRow, OfferProductRow, Partial<OfferProductRow>, [
        { foreignKeyName: "offer_products_offer_id_fkey"; columns: ["offer_id"]; isOneToOne: false; referencedRelation: "offers"; referencedColumns: ["id"] },
        { foreignKeyName: "offer_products_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
      ]>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
