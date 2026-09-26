import { Link, useLocation, useParams } from 'react-router-dom';
import { Check, ArrowRight, Truck, MapPin, Mail, Package, Home, PackageSearch, FileText } from 'lucide-react';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { Order } from '../types';
import { Button } from '../components/ui/Button';
import { conditionLabel, money } from '../lib/format';
import { Skeleton } from '../components/ui/Skeleton';
import { cn } from '../lib/cn';

const TIMELINE = [
  { icon: Check, label: 'Confirmed' },
  { icon: Package, label: 'Packing' },
  { icon: Truck, label: 'Dispatched' },
  { icon: Home, label: 'Delivered' },
];

export default function OrderConfirmed() {
  const { orderNumber = '' } = useParams();
  const { state } = useLocation() as { state?: Order };
  useDocumentTitle('Order confirmed');
  const fetched = useAsync(() => (state ? Promise.resolve(state) : api.getOrder(orderNumber)), [orderNumber]);
  const order = state ?? fetched.data;

  if (!order && fetched.loading) return <div className="container py-20"><Skeleton className="mx-auto h-64 max-w-2xl" /></div>;
  if (!order) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-3xl">We couldn’t find that order</h1>
        <p className="mt-2 text-ink-3">Check the link in your confirmation email, or contact us and we will track it down.</p>
        <Button to="/contact" variant="secondary" className="mt-6">Get in touch</Button>
      </div>
    );
  }

  const eta = new Date(order.estimatedDelivery).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <div className="container py-8 md:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-tint-mint px-3 py-1.5 text-xs font-bold text-success"><Check size={13} strokeWidth={3} /> Order confirmed</span>
            <h1 className="mt-4 text-3xl md:text-[2.75rem] md:leading-[1.05]">Thanks, {order.customer.firstName}.</h1>
            <p className="mt-2 text-ink-3">Your payment went through PayPal and order <span className="rounded-md bg-cream px-2 py-0.5 font-semibold text-ink">{order.orderNumber}</span> is confirmed.</p>
          </div>
          <div className="text-left md:text-right">
            <p className="eyebrow">Arrives</p>
            <p className="mt-1 font-display text-xl font-bold">{eta}</p>
          </div>
        </div>

        {/* Timeline */}
        <ol className="mt-10 grid grid-cols-4 gap-2">
          {TIMELINE.map(({ icon: Icon, label }, i) => (
            <li key={label} className="text-center">
              <div className={cn('h-1 rounded-full', i === 0 ? 'bg-success' : 'bg-line')} />
              <span className={cn('mx-auto mt-4 flex h-9 w-9 items-center justify-center rounded-full', i === 0 ? 'bg-success text-white' : 'bg-cream text-ink-3')}><Icon size={15} /></span>
              <p className={cn('mt-2 text-xs font-semibold', i === 0 ? 'text-ink' : 'text-ink-3')}>{label}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-4 md:grid-cols-12">
          <div className="rounded-[28px] border border-line p-6 md:col-span-7">
            <p className="eyebrow">Items</p>
            <ul className="mt-3 divide-y divide-line">
              {order.lines.map((l) => (
                <li key={l.lineId} className="flex items-center gap-4 py-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cream p-2">
                    <img src={l.image} alt="" className="h-full w-full product-img" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{l.brand} {l.name}</p>
                    <p className="text-xs text-ink-3">{l.storage} · {l.network} · {conditionLabel(l.condition)} × {l.quantity}</p>
                  </div>
                  <p className="text-sm font-bold">{money(l.unitPrice * l.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-sm text-ink-3">Total paid, incl. VAT</span>
              <span className="font-display text-2xl font-bold tracking-tighter">{money(order.total)}</span>
            </div>
          </div>
          <div className="space-y-4 md:col-span-5">
            <div className="rounded-[28px] bg-cream p-6">
              <p className="flex items-center gap-2 eyebrow"><MapPin size={13} /> Delivering to</p>
              <p className="mt-2 text-sm font-medium leading-relaxed">
                {order.customer.firstName} {order.customer.lastName}<br />
                {order.customer.line1}{order.customer.line2 ? `, ${order.customer.line2}` : ''}<br />
                {order.customer.city}, {order.customer.postcode}
              </p>
              <p className="mt-3 text-xs text-ink-3">{order.delivery === 'next-day' ? 'Next-day tracked, signature required' : 'Standard tracked'}</p>
            </div>
            <div className="rounded-[28px] bg-cream p-6">
              <p className="flex items-center gap-2 eyebrow"><Mail size={13} /> Check your inbox</p>
              <p className="mt-2 text-sm text-ink-2">We’ve emailed your <span className="font-semibold text-ink">invoice</span>, the full order details and your PayPal receipt to <span className="font-semibold text-ink">{order.customer.email}</span>. Tracking follows as soon as the courier collects it.</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-3"><FileText size={12} /> Can’t see it? Check spam, or reply to any email from us.</p>
            </div>
            <Link to={`/track?order=${encodeURIComponent(order.orderNumber)}`} className="group flex items-center gap-4 rounded-[28px] bg-ink p-6 text-white transition-colors hover:bg-ink-2">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10"><PackageSearch size={20} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">Track this order any time</span>
                <span className="block text-xs text-white/60">Enter your order number and email on the tracking page to see its status.</span>
              </span>
              <ArrowRight size={18} className="shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button to="/shop" variant="dark">Continue shopping <ArrowRight size={16} /></Button>
          <Link to="/faq#delivery" className="inline-flex h-12 items-center rounded-full border border-line px-6 text-sm font-semibold hover:border-ink">Delivery questions</Link>
        </div>
      </div>
    </div>
  );
}
