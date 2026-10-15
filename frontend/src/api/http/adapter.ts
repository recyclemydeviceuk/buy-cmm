import type { Order, Product } from '../../types';
import type { StorefrontApi } from '../types';

/** An error from the API. `details.issue` carries PayPal's reason, e.g. INSTRUMENT_DECLINED. */
export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) {
    super(message);
  }
}

const BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api/buy${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    let message = res.statusText;
    let details: unknown;
    try {
      const body = (await res.json()) as { message?: string; details?: unknown };
      message = body.message ?? message;
      details = body.details;
    } catch {
      /* no body */
    }
    throw new ApiError(message || `Request failed (${res.status})`, res.status, details);
  }
  return (await res.json()) as T;
}

function qs(obj: Record<string, unknown>): string {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) v.forEach((x) => p.append(k, String(x)));
    else p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}

/** Talks to the BuyUpon backend. Endpoints are documented in API_CONTRACT.md. */
export const httpApi: StorefrontApi = {
  listProducts: (q) => request(`/products${qs(q as Record<string, unknown>)}`),
  getFacets: (q) => request(`/products/facets${qs(q as Record<string, unknown>)}`),
  getProduct: (slug) => request<Product>(`/products/${slug}`).catch(() => null),
  getFeatured: () => request('/products/featured'),
  getRelated: (slug) => request(`/products/${slug}/related`),
  getReviews: (productId) => request(`/products/${productId}/reviews`),
  submitReview: (productId, input) => request(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(input) }),
  getRecentReviews: (limit = 8) => request(`/reviews/recent?limit=${limit}`),
  getMenuProducts: () => request('/products/menu'),
  getConfig: () => request('/config'),
  createPayPalOrder: (body) => request('/paypal/orders', { method: 'POST', body: JSON.stringify(body) }),
  checkout: (body) => request('/checkout', { method: 'POST', body: JSON.stringify(body) }),
  getOrder: (n) => request<Order>(`/orders/${n}`).catch(() => null),
  subscribe: (email) => request('/newsletter', { method: 'POST', body: JSON.stringify({ email }) }),
  sendContact: (payload) => request('/contact', { method: 'POST', body: JSON.stringify(payload) }),
};
