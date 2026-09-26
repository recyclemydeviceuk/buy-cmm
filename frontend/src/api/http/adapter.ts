import type { Order, Product } from '../../types';
import type { StorefrontApi } from '../types';

const BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api/buy${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
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

/** Talks to the (future) BuyUpon backend. Endpoints are documented in API_CONTRACT.md. */
export const httpApi: StorefrontApi = {
  listProducts: (q) => request(`/products${qs(q as Record<string, unknown>)}`),
  getFacets: (q) => request(`/products/facets${qs(q as Record<string, unknown>)}`),
  getProduct: (slug) => request<Product>(`/products/${slug}`).catch(() => null),
  getFeatured: () => request('/products/featured'),
  getRelated: (slug) => request(`/products/${slug}/related`),
  getReviews: (productId) => request(`/products/${productId}/reviews`),
  checkout: (body) => request('/checkout', { method: 'POST', body: JSON.stringify(body) }),
  getOrder: (n) => request<Order>(`/orders/${n}`).catch(() => null),
  subscribe: (email) => request('/newsletter', { method: 'POST', body: JSON.stringify({ email }) }),
  sendContact: (payload) => request('/contact', { method: 'POST', body: JSON.stringify(payload) }),
};
