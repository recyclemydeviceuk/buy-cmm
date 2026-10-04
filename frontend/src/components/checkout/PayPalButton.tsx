import { useEffect, useRef } from 'react';
import { Lock } from 'lucide-react';
import { useStoreConfig } from '../../store/catalog';

interface Props {
  amount: number;
  disabled?: boolean;
  /** Return false to block the PayPal window (e.g. details form invalid). */
  validate: () => boolean;
  onApproved: (paypalOrderId: string) => Promise<void>;
  onError: (message: string) => void;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: Record<string, unknown>) => { render: (el: HTMLElement) => Promise<void>; close?: () => void };
    };
  }
}

/**
 * PayPal is the only payment method. The client ID comes from the admin (Settings → Payments) or
 * VITE_PAYPAL_CLIENT_ID; the PayPal JS SDK renders its Smart Button and the backend captures the order
 * server-side for the server-computed total. Without a client ID, checkout is shown as unavailable.
 */
export function PayPalButton({ amount, disabled, validate, onApproved, onError }: Props) {
  const { paypal } = useStoreConfig();
  const CLIENT_ID = paypal.clientId || undefined;
  const useSdk = !!CLIENT_ID;
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef({ validate, onApproved, onError, amount });
  latest.current = { validate, onApproved, onError, amount };

  useEffect(() => {
    if (!useSdk || !host.current) return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !window.paypal || !host.current) return;
      host.current.innerHTML = '';
      window.paypal
        .Buttons({
          style: { layout: 'vertical', shape: 'pill', color: 'gold', label: 'pay', height: 48 },
          onClick: (_: unknown, actions: { resolve: () => void; reject: () => void }) => (latest.current.validate() ? actions.resolve() : actions.reject()),
          createOrder: (_: unknown, actions: { order: { create: (o: unknown) => Promise<string> } }) =>
            actions.order.create({ purchase_units: [{ amount: { currency_code: 'GBP', value: latest.current.amount.toFixed(2) } }] }),
          onApprove: async (data: { orderID: string }) => latest.current.onApproved(data.orderID),
          onError: () => latest.current.onError('PayPal could not complete the payment. Please try again.'),
        })
        .render(host.current);
    };
    if (window.paypal) render();
    else {
      const s = document.createElement('script');
      s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(CLIENT_ID!)}&currency=GBP&intent=capture`;
      s.async = true;
      s.onload = render;
      s.onerror = () => latest.current.onError('PayPal failed to load. Check your connection and try again.');
      document.head.appendChild(s);
    }
    return () => {
      cancelled = true;
    };
  }, [useSdk, CLIENT_ID]);

  if (useSdk) return <div ref={host} className={disabled ? 'pointer-events-none opacity-50' : ''} />;

  // No PayPal client ID configured: never pretend to take a payment.
  return (
    <div className="rounded-2xl border border-line bg-cream p-4 text-center">
      <p className="text-sm font-semibold">Payments are temporarily unavailable</p>
      <p className="mt-1 text-xs text-ink-3">Please try again shortly. Your basket is saved on this device.</p>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-ink-3"><Lock size={11} /> Checkout runs through PayPal; no card details are entered on this site.</p>
    </div>
  );
}
