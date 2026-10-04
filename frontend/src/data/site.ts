import type { StoreConfig } from '../types';

/** Fallbacks used until the store config has loaded from the backend. */
export const DEFAULT_CONFIG: StoreConfig = {
  store: { name: 'CashMyMobile', supportEmail: 'support@cashmymobile.co.uk', whatsapp: '', hours: 'Monday to Friday, 9am to 5:30pm', warrantyMonths: 12, returnsDays: 30 },
  delivery: [
    { id: 'next-day', label: 'Next-day tracked', description: 'Order by 3pm, arrives tomorrow. Signature required.', fee: 0, etaDays: 1, cutoff: '15:00', enabled: true },
    { id: 'standard', label: 'Standard tracked', description: 'Arrives in 2 to 3 working days.', fee: 0, etaDays: 3, cutoff: '17:00', enabled: true },
  ],
  networks: ['Unlocked', 'EE', 'Vodafone', 'O2', 'Three'],
  conditions: [],
  paypal: { mode: 'sandbox', clientId: (import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined) ?? '' },
};

export function siteContact(c: StoreConfig) {
  const number = (c.store.whatsapp || '').replace(/\D/g, '');
  return {
    SUPPORT_EMAIL: c.store.supportEmail,
    SUPPORT_HOURS: c.store.hours,
    WHATSAPP_NUMBER: number,
    WHATSAPP_DISPLAY: number ? `+${number.slice(0, 2)} ${number.slice(2, 6)} ${number.slice(6)}` : '',
    WHATSAPP_URL: number ? `https://wa.me/${number}?text=${encodeURIComponent(`Hi ${c.store.name}, I have a question about buying a phone.`)}` : '',
    WARRANTY_MONTHS: c.store.warrantyMonths,
    RETURNS_DAYS: c.store.returnsDays,
  };
}
