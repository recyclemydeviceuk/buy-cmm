import { useEffect, useRef, useState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { useStoreConfig } from '../../store/catalog';

interface Props {
  disabled?: boolean;
  /** Return false to stop the PayPal window opening (e.g. the details form is incomplete). */
  validate: () => boolean;
  /** Asks our server to price the basket and open a PayPal order; resolves to PayPal's order id. */
  createOrder: () => Promise<string>;
  /** Asks our server to capture the approved order. Throw a `declined` error to let the shopper pick another method. */
  onApproved: (paypalOrderId: string) => Promise<void>;
  onError: (message: string) => void;
  onCancel?: () => void;
}

interface ButtonsActions {
  restart: () => Promise<void>;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: Record<string, unknown>) => { render: (el: HTMLElement) => Promise<void>; close?: () => Promise<void>; isEligible?: () => boolean };
    };
  }
}

/** Thrown by `onApproved` when PayPal declined the funding source and the same order can be retried. */
export class PaymentDeclined extends Error {}

let sdk: { clientId: string; promise: Promise<void> } | null = null;

/** Loads the PayPal JS SDK once per client id. */
function loadSdk(clientId: string): Promise<void> {
  if (sdk?.clientId === clientId) return sdk.promise;
  document.querySelectorAll('script[data-paypal-sdk]').forEach((s) => s.remove());
  delete window.paypal;
  const promise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    const q = new URLSearchParams({ 'client-id': clientId, currency: 'GBP', intent: 'capture', commit: 'true', components: 'buttons', locale: 'en_GB' });
    s.src = `https://www.paypal.com/sdk/js?${q}`;
    s.async = true;
    s.dataset.paypalSdk = 'true';
    s.onload = () => resolve();
    s.onerror = () => {
      sdk = null;
      reject(new Error('PayPal failed to load'));
    };
    document.head.appendChild(s);
  });
  sdk = { clientId, promise };
  return promise;
}

/**
 * PayPal is the only payment method. The order is created and captured by our server (never priced in the browser);
 * this component only renders PayPal's Smart Buttons and hands their callbacks to the checkout page.
 */
export function PayPalButton({ disabled, validate, createOrder, onApproved, onError, onCancel }: Props) {
  const { paypal } = useStoreConfig();
  const clientId = paypal.clientId;
  const available = !!clientId && paypal.enabled !== false;
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const latest = useRef({ validate, createOrder, onApproved, onError, onCancel });
  latest.current = { validate, createOrder, onApproved, onError, onCancel };

  useEffect(() => {
    if (!available || !host.current) return;
    let cancelled = false;
    let buttons: ReturnType<NonNullable<Window['paypal']>['Buttons']> | null = null;
    setState('loading');
    loadSdk(clientId)
      .then(async () => {
        if (cancelled || !window.paypal || !host.current) return;
        host.current.innerHTML = '';
        buttons = window.paypal.Buttons({
          style: { layout: 'vertical', shape: 'pill', color: 'gold', label: 'pay', height: 48, tagline: false },
          onClick: (_: unknown, actions: { resolve: () => void; reject: () => void }) => (latest.current.validate() ? actions.resolve() : actions.reject()),
          createOrder: async () => {
            try {
              return await latest.current.createOrder();
            } catch (e) {
              latest.current.onError((e as Error).message || 'We could not start the PayPal payment. Please try again.');
              throw e;
            }
          },
          onApprove: async (data: { orderID: string }, actions: ButtonsActions) => {
            try {
              await latest.current.onApproved(data.orderID);
            } catch (e) {
              // PayPal lets the shopper choose another card or bank in the same order.
              if (e instanceof PaymentDeclined) return actions.restart();
              throw e;
            }
          },
          onCancel: () => latest.current.onCancel?.(),
          onError: () => latest.current.onError('PayPal could not complete the payment. You have not been charged. Please try again.'),
        });
        await buttons.render(host.current);
        if (!cancelled) setState('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setState('failed');
        latest.current.onError('PayPal failed to load. Check your connection and refresh the page.');
      });
    return () => {
      cancelled = true;
      void buttons?.close?.().catch(() => undefined);
    };
  }, [available, clientId]);

  if (!available) {
    // No PayPal credentials on the server: never pretend to take a payment.
    return (
      <div className="rounded-2xl border border-line bg-cream p-4 text-center">
        <p className="text-sm font-semibold">Payments are temporarily unavailable</p>
        <p className="mt-1 text-xs text-ink-3">Please try again shortly. Your basket is saved on this device.</p>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-ink-3"><Lock size={11} /> Checkout runs through PayPal; no card details are entered on this site.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[112px]">
      {state === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-ink-3">
          <Loader2 size={16} className="animate-spin" /> Loading PayPal…
        </div>
      )}
      {state === 'failed' && <p className="py-6 text-center text-sm text-ink-3">PayPal could not load. Refresh the page to try again.</p>}
      <div ref={host} className={disabled ? 'pointer-events-none opacity-50' : ''} aria-busy={disabled} />
      {paypal.mode === 'sandbox' && state === 'ready' && <p className="mt-2 text-center text-[11px] font-semibold text-brand-600">PayPal sandbox: test payments only</p>}
    </div>
  );
}
