import type { CheckoutRequest, Facets, MenuProduct, Order, Paged, Product, ProductQuery, Review, ReviewInput, StoreConfig } from '../types';

/** Every data source the storefront can talk to implements this. */
export interface StorefrontApi {
  listProducts(query: ProductQuery): Promise<Paged<Product>>;
  getFacets(query: ProductQuery): Promise<Facets>;
  getProduct(slug: string): Promise<Product | null>;
  getFeatured(): Promise<Product[]>;
  getRelated(slug: string): Promise<Product[]>;
  getReviews(productId: string): Promise<Review[]>;
  submitReview(productId: string, input: ReviewInput): Promise<{ ok: true; status: 'pending' }>;
  getRecentReviews(limit?: number): Promise<{ items: Review[]; total: number; average: number }>;
  getMenuProducts(): Promise<MenuProduct[]>;
  getConfig(): Promise<StoreConfig>;
  checkout(req: CheckoutRequest): Promise<Order>;
  getOrder(orderNumber: string): Promise<Order | null>;
  subscribe(email: string): Promise<{ ok: true }>;
  sendContact(payload: { name: string; email: string; message: string }): Promise<{ ok: true }>;
}
