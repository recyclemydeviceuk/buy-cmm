import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { api } from '../../api';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { SUPPORT_EMAIL, WHATSAPP_DISPLAY, WHATSAPP_URL } from '../../data/site';

const COLS = [
  { title: 'Shop', links: [['iPhone', '/shop?brand=Apple'], ['Samsung Galaxy', '/shop?brand=Samsung'], ['Foldables', '/shop?series=Galaxy%20Z'], ['Under £250', '/shop?maxPrice=250'], ['Newest models', '/shop?sort=newest']] },
  { title: 'Help', links: [['Track your order', '/track'], ['How it works', '/how-it-works'], ['Condition grades', '/how-it-works#grades'], ['Warranty & returns', '/faq#warranty'], ['Delivery', '/faq#delivery'], ['FAQ', '/faq']] },
  { title: 'Company', links: [['Get in touch', '/contact'], ['Sell your phone', 'https://cashmymobile.co.uk'], ['About us', '/faq#about']] },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) return;
    await api.subscribe(email);
    setDone(true);
  }
  const link = 'text-[15px] text-ink-2 transition-colors hover:text-ink';
  return (
    <footer className="mt-24 border-t border-mist-2 bg-mist md:mt-32">
      <div className="container py-20 md:py-28">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <img src="/brand/cmm-logo.png" alt="CashMyMobile" className="h-6 w-auto" />
            <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-ink-3">Certified pre-owned iPhone and Samsung, tested and graded by hand in the UK.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1fbd5a]"><WhatsAppIcon size={16} /> {WHATSAPP_DISPLAY}</a>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex h-10 items-center rounded-full border border-ink/15 px-4 text-sm font-semibold text-ink-2 transition-colors hover:border-ink hover:text-ink">{SUPPORT_EMAIL}</a>
            </div>
            <form onSubmit={submit} className="mt-12 max-w-sm">
              <p className="text-sm font-semibold text-ink">Price drops and new stock, once a week</p>
              {done ? (
                <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-success">
                  <Check size={16} /> You&rsquo;re on the list.
                </p>
              ) : (
                <div className="mt-3 flex items-center border-b border-ink/20 transition-colors focus-within:border-ink">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="h-12 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-4" />
                  <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink hover:text-white focus-ring" aria-label="Subscribe">
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </form>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:col-span-7 lg:pl-16">
            {COLS.map((c) => (
              <div key={c.title}>
                <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.22em] text-ink-3">{c.title}</p>
                <ul className="space-y-4">
                  {c.links.map(([label, to]) => (
                    <li key={label}>
                      {to.startsWith('http') ? <a href={to} className={link}>{label}</a> : <Link to={to} className={link}>{label}</Link>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-mist-2 pt-8 text-xs text-ink-3 md:mt-24 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} CashMyMobile Ltd · All prices include VAT</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/faq" className="transition-colors hover:text-ink">Privacy</Link>
            <Link to="/faq" className="transition-colors hover:text-ink">Terms</Link>
            <span>Visa · Mastercard · Amex · Apple Pay · Google Pay</span>
          </div>
        </div>
        <p className="mt-4 text-[11px] text-ink-4">iPhone is a trademark of Apple Inc. Galaxy is a trademark of Samsung Electronics. We are an independent reseller.</p>
      </div>
    </footer>
  );
}
