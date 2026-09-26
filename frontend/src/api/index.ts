import { httpApi } from './http/adapter';
import { mockApi } from './mock/adapter';
import type { StorefrontApi } from './types';

const useMock = (import.meta.env.VITE_USE_MOCK ?? 'true') === 'true';

export const api: StorefrontApi = useMock ? mockApi : httpApi;
export const IS_MOCK = useMock;
