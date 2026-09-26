import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, Clock, Mail } from 'lucide-react';
import { WhatsAppIcon } from '../components/ui/WhatsAppIcon';
import { SUPPORT_EMAIL, SUPPORT_HOURS, WHATSAPP_DISPLAY, WHATSAPP_URL } from '../data/site';
import { api } from '../api';
import { useSeo, breadcrumbLd } from '../lib/seo';
import { Field, Select, TextArea } from '../components/ui/Field';
import { Button } from '../components/ui/Button';

const TOPICS = ['Order question', 'Warranty claim', 'Return or refund', 'Trade-in', 'Something else'];

export default function Contact() {
  useSeo({ title: 'Get in touch', description: 'Contact CashMyMobile by WhatsApp, email or the contact form. Order questions, warranty claims and returns answered within one working day.', canonical: '/contact', jsonLd: breadcrumbLd([['Home', '/'], ['Get in touch', '/contact']]) });
  const [form, setForm] = useState({ name: '', email: '', topic: TOPICS[0], order: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Enter your name';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (form.message.trim().length < 10) errs.message = 'Tell us a little more';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    await api.sendContact({ name: form.name, email: form.email, message: `[${form.topic}${form.order ? ` · ${form.order}` : ''}] ${form.message}` });
    setBusy(false);
    setSent(true);
  }

  return (
    <div className="container py-6 md:py-10">
      <div className="grid overflow-hidden rounded-[28px] border border-line md:rounded-[36px] lg:grid-cols-12">
        {/* Dark info panel */}
        <div className="flex min-w-0 flex-col bg-ink p-6 text-white md:p-12 lg:col-span-5">
          <p className="eyebrow text-white/50">Get in touch</p>
          <h1 className="mt-3 text-4xl text-white md:text-5xl md:leading-[1.05]">Talk to a <span className="serif-accent text-white/70">person.</span></h1>
          <p className="mt-4 max-w-sm text-white/60">Order questions, warranty claims, or you just want to check something before buying. We are a small team and we answer everything ourselves.</p>
          <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
            <li>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="group flex items-center gap-4 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"><WhatsAppIcon size={18} /></span>
                <span className="flex-1">
                  <span className="block text-[15px] font-semibold">WhatsApp {WHATSAPP_DISPLAY}</span>
                  <span className="block text-xs text-white/50">Quickest reply, {SUPPORT_HOURS.toLowerCase()}</span>
                </span>
                <ArrowUpRight size={16} className="text-white/50 transition-transform group-hover:translate-x-0.5" />
              </a>
            </li>
            <li>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="group flex items-center gap-4 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15"><Mail size={17} /></span>
                <span className="flex-1">
                  <span className="block break-all text-[15px] font-semibold">{SUPPORT_EMAIL}</span>
                  <span className="block text-xs text-white/50">Email, any time</span>
                </span>
                <ArrowUpRight size={16} className="text-white/50 transition-transform group-hover:translate-x-0.5" />
              </a>
            </li>
            <li className="flex items-center gap-4 py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15"><Clock size={17} /></span>
              <span>
                <span className="block text-[15px] font-semibold">{SUPPORT_HOURS}</span>
                <span className="block text-xs text-white/50">Replies within one working day</span>
              </span>
            </li>
          </ul>
          <div className="mt-auto pt-10">
            <Link to="/faq" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white">Check the help centre first <ArrowUpRight size={15} /></Link>
          </div>
        </div>

        {/* Form */}
        <div className="min-w-0 bg-white p-6 md:p-12 lg:col-span-7">
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-tint-mint text-success"><Check size={28} strokeWidth={3} /></span>
              <h2 className="mt-5 text-2xl md:text-3xl">Message sent</h2>
              <p className="mt-2 max-w-sm text-ink-3">Thanks {form.name.split(' ')[0]}, we will reply to {form.email} within one working day.</p>
              <Button to="/shop" variant="secondary" className="mt-8">Back to shopping <ArrowRight size={16} /></Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <h2 className="font-display text-2xl font-bold">Send a message</h2>
                <p className="mt-1 text-sm text-ink-3">We read every one. Include your order number if you have it.</p>
              </div>
              <Field label="Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
              <Field label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
              <Select label="Topic" name="topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                {TOPICS.map((t) => <option key={t}>{t}</option>)}
              </Select>
              <Field label="Order number (optional)" name="order" placeholder="CMM-123456" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
              <TextArea label="How can we help?" name="message" className="sm:col-span-2" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} error={errors.message} />
              <div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2">
                <p className="text-xs text-ink-3">By sending you agree to us storing this message to reply to you.</p>
                <Button type="submit" variant="dark" disabled={busy}>{busy ? 'Sending…' : 'Send message'} <ArrowRight size={16} /></Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
