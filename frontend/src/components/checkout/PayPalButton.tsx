import { useEffect, useRef, useState } from 'react';
import { Lock, X } from 'lucide-react';
import { money } from '../../lib/format';
import { IS_MOCK } from '../../api';

interface Props {
  amount: number;
  disabled?: boolean;
  /** Return false to block the PayPal window (e.g. details form invalid). */
  validate: () => boolean;
  onApproved: (paypalOrderId: string) => Promise<void>;
  onError: (message: string) => void;
}

const CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: Record<string, unknown>) => { render: (el: HTMLElement) => Promise<void>; close?: () => void };
    };
  }
}

function PayPalWordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline font-display text-[17px] font-bold italic tracking-tight ${className ?? ''}`}>
      <span className="text-[#003087]">Pay</span>
      <span className="text-[#009cde]">Pal</span>
    </span>
  );
}

/**
 * PayPal is the only payment method. With VITE_PAYPAL_CLIENT_ID set (and the HTTP adapter) the real
 * PayPal JS SDK renders its Smart Button. In mock mode a PayPal-styled button opens an in-page
 * approval sheet that mimics the redirect so the whole flow can be walked end to end.
 */
export function PayPalButton({ amount, disabled, validate, onApproved, onError }: Props) {
  const useSdk = !!CLIENT_ID && !IS_MOCK;
  const host = useRef<HTMLDivElement>(null);
  const [sheet, setSheet] = useState(false);
  const [busy, setBusy] = useState(false);
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
  }, [useSdk]);

  if (useSdk) return <div ref={host} className={disabled ? 'pointer-events-none opacity-50' : ''} />;

  async function approve() {
    setBusy(true);
    try {
      await onApproved(`PAYPAL-MOCK-${Date.now().toString(36).toUpperCase()}`);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Payment failed. Please try again.');
      setBusy(false);
      setSheet(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => validate() && setSheet(true)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FFC439] text-sm font-semibold text-[#003087] transition-colors hover:bg-[#f5b800] focus-ring disabled:opacity-50"
      >
        Pay with <PayPalWordmark />
      </button>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-ink-3"><Lock size={11} /> You’ll approve the payment in PayPal. No card details are entered on this site.</p>

      {sheet && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/50 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-label="PayPal checkout">
          <div className="w-full max-w-md animate-pop rounded-3xl bg-white p-6 shadow-float">
            <div className="flex items-center justify-between">
              <PayPalWordmark className="text-2xl" />
              <button type="button" onClick={() => !busy && setSheet(false)} className="rounded-full p-1.5 text-ink-3 hover:bg-cream" aria-label="Close"><X size={18} /></button>
            </div>
            <p className="mt-4 text-sm text-ink-3">Sandbox checkout. This stands in for the PayPal window until a live client ID is configured.</p>
            <div className="mt-5 rounded-2xl bg-cream p-4">
              <p className="text-xs text-ink-3">Paying CashMyMobile Ltd</p>
              <p className="mt-1 font-display text-3xl font-bold tracking-tightest">{money(amount)}</p>
            </div>
            <button type="button" onClick={approve} disabled={busy} className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-[#0070ba] text-sm font-semibold text-white hover:bg-[#005ea6] disabled:opacity-60">
              {busy ? 'Completing payment…' : 'Pay now'}
            </button>
            <button type="button" onClick={() => !busy && setSheet(false)} className="mt-2 h-10 w-full rounded-full text-sm font-semibold text-ink-2 hover:bg-cream">Cancel and return</button>
          </div>
        </div>
      )}
    </>
  );
}
