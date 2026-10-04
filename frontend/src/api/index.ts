import { httpApi } from './http/adapter';
import type { StorefrontApi } from './types';

/** The storefront talks only to the BuyUpon backend (VITE_API_BASE_URL). */
export const api: StorefrontApi = httpApi;
