import type { CheckoutRequest, Facets, Order, Paged, Product, ProductQuery, Review } from '../types';

/** Every data source the storefront can talk to implements this. */
export interface StorefrontApi {
  listProducts(query: ProductQuery): Promise<Paged<Product>>;
  getFacets(query: ProductQuery): Promise<Facets>;
  getProduct(slug: string): Promise<Product | null>;
  getFeatured(): Promise<Product[]>;
  getRelated(slug: string): Promise<Product[]>;
  getReviews(productId: string): Promise<Review[]>;
  checkout(req: CheckoutRequest): Promise<Order>;
  getOrder(orderNumber: string): Promise<Order | null>;
  subscribe(email: string): Promise<{ ok: true }>;
  sendContact(payload: { name: string; email: string; message: string }): Promise<{ ok: true }>;
}
