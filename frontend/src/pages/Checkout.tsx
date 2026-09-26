import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Check } from 'lucide-react';
import { PayPalButton } from '../components/checkout/PayPalButton';
import { api } from '../api';
import { useBasket } from '../store/basket';
import { useSeo } from '../lib/seo';
import type { Address, DeliveryMethod } from '../types';
import { Field } from '../components/ui/Field';
import { conditionLabel, money } from '../lib/format';
import { cn } from '../lib/cn';

const EMPTY: Address = { firstName: '', lastName: '', email: '', phone: '', line1: '', line2: '', city: '', postcode: '' };
const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

function Step({ n, title, sub, children }: { n: number; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-line py-10 first:border-t-0 first:pt-0 md:grid-cols-[72px_1fr] md:gap-10">
      <div>
        <span className="serif-accent text-4xl leading-none text-ink-3">0{n}</span>
      </div>
      <div>
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-ink-3">{sub}</p>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

export default function Checkout() {
  useSeo({ title: 'Checkout', noindex: true });
  const { lines, subtotal, clear } = useBasket();
  const navigate = useNavigate();
  const [address, setAddress] = useState<Address>(EMPTY);
  const [delivery, setDelivery] = useState<DeliveryMethod>('next-day');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!lines.length && !busy) return <Navigate to="/basket" replace />;

  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) => setAddress((a) => ({ ...a, [k]: e.target.value }));

  function validate() {
    const e: Record<string, string> = {};
    if (!address.firstName.trim()) e.firstName = 'Enter your first name';
    if (!address.lastName.trim()) e.lastName = 'Enter your last name';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address.email)) e.email = 'Enter a valid email address';
    if (address.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a valid UK phone number';
    if (!address.line1.trim()) e.line1 = 'Enter the first line of your address';
    if (!address.city.trim()) e.city = 'Enter your town or city';
    if (!UK_POSTCODE.test(address.postcode.trim())) e.postcode = 'Enter a valid UK postcode';
    setErrors(e);
    if (Object.keys(e).length) {
      setServerError('Please complete your details and delivery address before paying.');
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    setServerError(null);
    return true;
  }

  async function onApproved(paypalOrderId: string) {
    setBusy(true);
    setServerError(null);
    // The PayPal order ID is the payment token; the backend captures it server-side.
    const order = await api.checkout({
      lines: lines.map((l) => ({ productId: l.productId, storage: l.storage, network: l.network, condition: l.condition, quantity: l.quantity })),
      customer: { ...address, postcode: address.postcode.toUpperCase().trim() },
      delivery,
      paymentToken: paypalOrderId,
    });
    clear();
    navigate(`/order/${order.orderNumber}`, { replace: true, state: order });
  }

  const count = lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <div className="container py-6 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <Link to="/basket" className="inline-flex items-center gap-1 text-xs font-semibold text-ink-3 hover:text-ink"><ChevronLeft size={14} /> Back to basket</Link>
          <h1 className="mt-2 text-3xl md:text-[2.75rem] md:leading-[1.05]">Checkout</h1>
        </div>
        <ol className="flex items-center gap-2 text-xs font-semibold">
          {['Basket', 'Details', 'PayPal'].map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[11px]', i === 0 ? 'bg-tint-mint text-success' : 'bg-ink text-white')}>{i === 0 ? <Check size={12} strokeWidth={3} /> : i + 1}</span>
              <span className={i === 0 ? 'text-ink-3' : 'text-ink'}>{s}</span>
              {i < 2 && <span className="mx-1 h-px w-6 bg-line" />}
            </li>
          ))}
        </ol>
      </div>

      <form onSubmit={(e) => e.preventDefault()} noValidate className="mt-2 grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Step n={1} title="Your details" sub="Where we send the confirmation and tracking.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name" name="firstName" autoComplete="given-name" value={address.firstName} onChange={set('firstName')} error={errors.firstName} />
              <Field label="Last name" name="lastName" autoComplete="family-name" value={address.lastName} onChange={set('lastName')} error={errors.lastName} />
              <Field label="Email" name="email" type="email" autoComplete="email" value={address.email} onChange={set('email')} error={errors.email} />
              <Field label="Mobile number" name="phone" type="tel" autoComplete="tel" value={address.phone} onChange={set('phone')} error={errors.phone} hint="For the courier only" />
            </div>
          </Step>

          <Step n={2} title="Delivery" sub="Free and tracked, whichever you pick.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Address line 1" name="line1" autoComplete="address-line1" className="sm:col-span-2" value={address.line1} onChange={set('line1')} error={errors.line1} />
              <Field label="Address line 2 (optional)" name="line2" autoComplete="address-line2" className="sm:col-span-2" value={address.line2} onChange={set('line2')} />
              <Field label="Town or city" name="city" autoComplete="address-level2" value={address.city} onChange={set('city')} error={errors.city} />
              <Field label="Postcode" name="postcode" autoComplete="postal-code" value={address.postcode} onChange={set('postcode')} error={errors.postcode} />
            </div>
            <fieldset className="mt-6">
              <legend className="sr-only">Delivery option</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    { id: 'next-day', title: 'Next-day tracked', body: 'Order by 3pm, arrives tomorrow. Signature required.' },
                    { id: 'standard', title: 'Standard tracked', body: 'Arrives in 2 to 3 working days.' },
                  ] as Array<{ id: DeliveryMethod; title: string; body: string }>
                ).map((o) => (
                  <label key={o.id} className={cn('flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all', delivery === o.id ? 'border-ink ring-1 ring-ink' : 'border-line hover:border-ink')}>
                    <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', delivery === o.id ? 'border-ink bg-ink text-white' : 'border-ink/30')}>{delivery === o.id && <Check size={12} strokeWidth={3} />}</span>
                    <input type="radio" name="delivery" value={o.id} checked={delivery === o.id} onChange={() => setDelivery(o.id)} className="sr-only" />
                    <span className="flex-1">
                      <span className="flex justify-between text-sm font-semibold">{o.title} <span className="text-success">Free</span></span>
                      <span className="mt-0.5 block text-xs text-ink-3">{o.body}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </Step>

          <Step n={3} title="Pay with PayPal" sub="PayPal is our only payment method. You approve the payment in PayPal and come straight back here.">
            <ul className="grid gap-2 sm:grid-cols-3">
              {[
                ['No card details here', 'Your card or bank stays inside PayPal.'],
                ['Buyer protection', 'PayPal covers eligible purchases.'],
                ['Instant confirmation', 'Order number and invoice by email.'],
              ].map(([t, sub]) => (
                <li key={t} className="rounded-2xl border border-line p-4">
                  <p className="text-sm font-bold">{t}</p>
                  <p className="mt-0.5 text-xs text-ink-3">{sub}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-3">Use the PayPal button in the order summary when your details are complete.</p>
          </Step>
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-28 overflow-hidden rounded-[28px] bg-ink text-white">
            <div className="flex items-center justify-between border-b border-white/10 px-7 py-5">
              <h2 className="font-display text-lg font-bold">Your order</h2>
              <span className="text-xs text-white/50">{count} {count === 1 ? 'item' : 'items'}</span>
            </div>
            <ul className="divide-y divide-white/10 px-7">
              {lines.map((l) => (
                <li key={l.lineId} className="flex items-center gap-4 py-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white p-1.5">
                    <img src={l.image} alt="" className="h-full w-full product-img" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{l.name}</p>
                    <p className="text-xs text-white/50">{l.storage} · {l.network} · {conditionLabel(l.condition)} × {l.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{money(l.unitPrice * l.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-white/10 px-7 py-5 text-sm">
              <div className="flex justify-between"><span className="text-white/60">Subtotal</span><span>{money(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-white/60">Delivery</span><span className="text-tint-mint">Free</span></div>
              <div className="flex items-baseline justify-between border-t border-white/10 pt-3"><span className="font-display font-bold">Total</span><span className="font-display text-2xl font-bold tracking-tighter">{money(subtotal)}</span></div>
            </div>
            <div className="px-7 pb-7">
              {serverError && <p className="mb-4 rounded-2xl bg-brand-600/20 p-3 text-sm font-semibold text-brand-200">{serverError}</p>}
              <div className="rounded-2xl bg-white p-3">
                <PayPalButton amount={subtotal} disabled={busy} validate={validate} onApproved={onApproved} onError={(m) => { setServerError(m); setBusy(false); }} />
              </div>
              <p className="mt-4 flex items-start gap-2 text-[11px] text-white/50"><ShieldCheck size={13} className="mt-0.5 shrink-0" /> By paying you agree to our terms. 30-day returns and 12-month warranty apply.</p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
