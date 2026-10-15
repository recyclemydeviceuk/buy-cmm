import type { StoreConfig } from '../types';

/** Fallbacks used until the store config has loaded from the backend. */
export const DEFAULT_CONFIG: StoreConfig = {
  store: { name: 'CashMyMobile', supportEmail: 'support@cashmymobile.co.uk', hours: 'Monday to Friday, 9am to 5:30pm', warrantyMonths: 12, returnsDays: 30 },
  delivery: [
    { id: 'next-day', label: 'Next-day tracked', description: 'Order by 3pm, arrives tomorrow. Signature required.', fee: 0, etaDays: 1, cutoff: '15:00', enabled: true },
  ],
  conditions: [],
  paypal: { mode: 'sandbox', clientId: (import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined) ?? '' },
};

export function siteContact(c: StoreConfig) {
  return {
    SUPPORT_EMAIL: c.store.supportEmail,
    SUPPORT_HOURS: c.store.hours,
    WARRANTY_MONTHS: c.store.warrantyMonths,
    RETURNS_DAYS: c.store.returnsDays,
  };
}
