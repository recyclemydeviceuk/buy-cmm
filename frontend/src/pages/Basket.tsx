import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck, RefreshCcw } from 'lucide-react';
import { useBasket } from '../store/basket';
import { useSeo } from '../lib/seo';
import { Button } from '../components/ui/Button';
import { conditionLabel, money } from '../lib/format';

export default function Basket() {
  useSeo({ title: 'Basket', noindex: true });
  const { lines, subtotal, count, setQuantity, remove } = useBasket();

  if (!lines.length) {
    return (
      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-lg text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream"><ShoppingBag size={26} /></span>
          <h1 className="mt-6 text-3xl md:text-4xl">Your basket is empty</h1>
          <p className="mt-3 text-ink-3">Find a phone you love and it will show up here.</p>
          <Button to="/shop" variant="dark" className="mt-8">
            Browse phones <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <h1 className="text-3xl md:text-[2.75rem] md:leading-[1.05]">Basket</h1>
        <p className="text-sm text-ink-3">{count} {count === 1 ? 'item' : 'items'}</p>
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
        <ul className="divide-y divide-line lg:col-span-8">
          {lines.map((l) => (
            <li key={l.lineId} className="grid grid-cols-[88px_1fr] gap-5 py-6 md:grid-cols-[112px_1fr_auto] md:items-center md:gap-8">
              <Link to={`/phones/${l.slug}`} className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-cream p-3">
                <img src={l.image} alt={l.name} className="h-full w-full product-img" />
              </Link>
              <div className="min-w-0">
                <p className="eyebrow">{l.brand}</p>
                <Link to={`/phones/${l.slug}`} className="mt-1 block font-display text-lg font-bold hover:underline">{l.name}</Link>
                <p className="mt-1 text-sm text-ink-3">{l.storage} · {l.network} · {conditionLabel(l.condition)}</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="inline-flex h-10 items-center rounded-full border border-line">
                    <button type="button" onClick={() => setQuantity(l.lineId, l.quantity - 1)} className="flex h-full w-10 items-center justify-center rounded-full hover:bg-cream focus-ring" aria-label="Decrease quantity"><Minus size={14} /></button>
                    <span className="w-6 text-center text-sm font-bold tabular-nums">{l.quantity}</span>
                    <button type="button" onClick={() => setQuantity(l.lineId, l.quantity + 1)} className="flex h-full w-10 items-center justify-center rounded-full hover:bg-cream focus-ring" aria-label="Increase quantity"><Plus size={14} /></button>
                  </div>
                  <button type="button" onClick={() => remove(l.lineId)} className="inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-brand-600 focus-ring rounded"><Trash2 size={14} /> Remove</button>
                </div>
              </div>
              <div className="col-span-2 flex items-baseline justify-between gap-3 md:col-span-1 md:block md:text-right">
                <p className="font-display text-xl font-bold tracking-tighter">{money(l.unitPrice * l.quantity)}</p>
                {l.quantity > 1 && <p className="text-xs text-ink-3">{money(l.unitPrice)} each</p>}
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:col-span-4">
          <div className="sticky top-28 rounded-[28px] bg-cream p-7">
            <h2 className="font-display text-lg font-bold">Summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-ink-3">Subtotal</dt><dd className="font-semibold">{money(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-3">Delivery</dt><dd className="font-semibold text-success">Free</dd></div>
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-ink/10 pt-5">
              <span className="font-display font-bold">Total</span>
              <span className="font-display text-3xl font-bold tracking-tightest">{money(subtotal)}</span>
            </div>
            <p className="mt-1 text-right text-xs text-ink-3">Includes VAT</p>
            <Button to="/checkout" size="lg" className="mt-6 w-full">
              Checkout <ArrowRight size={18} />
            </Button>
            <Link to="/shop" className="mt-3 block text-center text-sm font-semibold text-ink-2 hover:text-ink">Continue shopping</Link>
            <ul className="mt-6 space-y-2 border-t border-ink/10 pt-5 text-xs text-ink-2">
              <li className="flex items-center gap-2"><Truck size={14} /> Free tracked next-day delivery</li>
              <li className="flex items-center gap-2"><ShieldCheck size={14} /> 12-month warranty</li>
              <li className="flex items-center gap-2"><RefreshCcw size={14} /> 30-day returns</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
