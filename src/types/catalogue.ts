export type Availability = "in_stock" | "out_of_stock";

export interface Category {
  id: string; name: string; slug: string; description: string | null; sortOrder: number;
}

export interface Product {
  id: string; name: string; slug: string; categoryId: string | null;
  category: Pick<Category, "name" | "slug"> | null; price: string; images: string[];
  description: string | null; availability: Availability; isRare: boolean;
  isNew: boolean; isRecommended: boolean; createdAt: string;
}

export interface Offer {
  id: string; title: string; description: string | null; startsAt: string;
  endsAt: string; products: Product[];
}

export interface ApiSuccess<T> { data: T }
export interface ApiError { error: { code: string; message: string; details: Record<string, unknown> | null } }
