import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Home, Package, PackageSearch, Truck } from 'lucide-react';
import { api } from '../api';
import { useSeo } from '../lib/seo';
import type { Order } from '../types';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { conditionLabel, money } from '../lib/format';
import { cn } from '../lib/cn';

const STAGES: Array<{ key: Order['status']; icon: typeof Check; label: string; sub: string }> = [
  { key: 'confirmed', icon: Check, label: 'Confirmed', sub: 'Payment received' },
  { key: 'packing', icon: Package, label: 'Packing', sub: 'Final checks and boxing' },
  { key: 'dispatched', icon: Truck, label: 'Dispatched', sub: 'With the courier' },
  { key: 'delivered', icon: Home, label: 'Delivered', sub: 'Signed for' },
];
const STAGE_INDEX: Record<Order['status'], number> = { confirmed: 0, packing: 1, dispatched: 2, delivered: 3, cancelled: -1, returned: -1 };
const CLOSED_LABEL: Partial<Record<Order['status'], string>> = { cancelled: 'Cancelled', returned: 'Returned' };

export default function TrackOrder() {
  useSeo({ title: 'Track your order', noindex: true });
  const [sp] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(sp.get('order') ?? '');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const num = orderNumber.trim().toUpperCase();
    const mail = email.trim().toLowerCase();
    if (!num) return setError('Enter your order number.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return setError('Enter the email you ordered with.');
    setBusy(true);
    const found = await api.getOrder(num);
    setBusy(false);
    if (!found || found.customer.email.trim().toLowerCase() !== mail) {
      setOrder(null);
      setError('We couldn’t match that order number and email. Check the confirmation email and try again.');
      return;
    }
    setOrder(found);
  }

  const stage = order ? STAGE_INDEX[order.status] : -1;
  const eta = order ? new Date(order.estimatedDelivery).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : '';

  return (
    <div className="container py-8 md:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="eyebrow text-brand-600">Track your order</p>
            <h1 className="mt-3 text-4xl md:text-[3rem] md:leading-[1.05]">Where is my <span className="serif-accent text-ink-3">phone?</span></h1>
            <p className="mt-4 text-ink-3">Enter the order number from your confirmation email and the email address you used at checkout.</p>
            <form onSubmit={submit} noValidate className="mt-8 space-y-4">
              <Field label="Order number" name="orderNumber" placeholder="CMM-123456" autoComplete="off" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
              <Field label="Email address" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              {error && <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">{error}</p>}
              <Button type="submit" variant="dark" disabled={busy} className="w-full">
                {busy ? 'Looking it up…' : 'Track order'} <PackageSearch size={16} />
              </Button>
            </form>
            <p className="mt-5 text-xs text-ink-3">Can’t find your order number? <Link to="/contact" className="font-semibold text-ink underline underline-offset-4">Get in touch</Link> and we will find it for you.</p>
          </div>

          <div className="lg:col-span-7">
            {order ? (
              <div className="animate-pop rounded-[28px] border border-line p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Order {order.orderNumber}</p>
                    <p className="mt-1 font-display text-2xl font-bold">{CLOSED_LABEL[order.status] ?? (order.status === 'delivered' ? 'Delivered' : `Arriving ${eta}`)}</p>
                    <p className="mt-1 text-sm text-ink-3">{order.delivery === 'next-day' ? 'Next-day tracked, signature required' : 'Standard tracked'} · to {order.customer.postcode}</p>
                  </div>
                  <span className={cn('rounded-full px-3 py-1.5 text-xs font-bold', CLOSED_LABEL[order.status] ? 'bg-brand-50 text-brand-700' : 'bg-tint-mint text-success')}>{CLOSED_LABEL[order.status] ?? 'On track'}</span>
                </div>

                {!CLOSED_LABEL[order.status] && (
                  <ol className="mt-8 grid grid-cols-4 gap-2">
                    {STAGES.map(({ icon: Icon, label, sub }, i) => {
                      const done = i <= stage;
                      return (
                        <li key={label}>
                          <div className={cn('h-1 rounded-full', done ? 'bg-success' : 'bg-line')} />
                          <span className={cn('mt-4 flex h-9 w-9 items-center justify-center rounded-full', done ? 'bg-success text-white' : 'bg-cream text-ink-3')}><Icon size={15} /></span>
                          <p className={cn('mt-2 text-xs font-bold', done ? 'text-ink' : 'text-ink-3')}>{label}</p>
                          <p className="text-[11px] text-ink-3">{sub}</p>
                        </li>
                      );
                    })}
                  </ol>
                )}

                <ul className="mt-8 divide-y divide-line border-t border-line">
                  {order.lines.map((l) => (
                    <li key={l.lineId} className="flex items-center gap-4 py-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream p-1.5"><img src={l.image} alt="" className="h-full w-full product-img" /></div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{l.brand} {l.name}</p>
                        <p className="text-xs text-ink-3">{l.storage} · {l.network} · {conditionLabel(l.condition)} × {l.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">{money(l.unitPrice * l.quantity)}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm">
                  <span className="text-ink-3">Total paid</span>
                  <span className="font-display text-xl font-bold tracking-tighter">{money(order.total)}</span>
                </div>
                <Link to="/faq#delivery" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline">Delivery questions <ArrowRight size={14} /></Link>
              </div>
            ) : (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-[28px] bg-cream p-10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white"><PackageSearch size={24} /></span>
                <p className="mt-5 font-display text-lg font-bold">Your order status will appear here</p>
                <p className="mt-1 max-w-xs text-sm text-ink-3">We show the stage it is at, the delivery date and what is in the box.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
