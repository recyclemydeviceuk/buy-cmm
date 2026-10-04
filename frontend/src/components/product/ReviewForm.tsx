import { useState, type FormEvent } from 'react';
import { Star } from 'lucide-react';
import { api } from '../../api';
import { Button } from '../ui/Button';
import { Field, TextArea } from '../ui/Field';
import { cn } from '../../lib/cn';

/** Posts a review to the backend; it appears on the page once approved in the admin. */
export function ReviewForm({ productId, productName }: { productId: string; productName: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [form, setForm] = useState({ author: '', email: '', orderNumber: '', title: '', body: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.author.trim().length < 2) return setError('Enter your name.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return setError('Enter the email you ordered with.');
    if (form.title.trim().length < 3) return setError('Give your review a title.');
    if (form.body.trim().length < 10) return setError('Tell us a little more (at least 10 characters).');
    setBusy(true);
    try {
      await api.submitReview(productId, { author: form.author.trim(), email: form.email.trim(), orderNumber: form.orderNumber.trim() || undefined, rating, title: form.title.trim(), body: form.body.trim() });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your review. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (done) return <p className="rounded-2xl bg-tint-mint px-4 py-3 text-sm font-semibold text-success">Thanks. Your review of the {productName} is with our team and will appear once it has been checked.</p>;
  if (!open) return <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>Write a review</Button>;
  return (
    <form onSubmit={submit} noValidate className="rounded-3xl border border-line p-5">
      <p className="font-display text-base font-bold">Review the {productName}</p>
      <div className="mt-3 flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} onClick={() => setRating(n)} className="rounded-full p-0.5 focus-ring">
            <Star size={22} className={cn(n <= rating ? 'fill-amber-400 text-amber-400' : 'fill-line text-line')} strokeWidth={0} />
          </button>
        ))}
        <span className="ml-2 text-sm text-ink-3">{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}</span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="author" value={form.author} onChange={set('author')} placeholder="Shown with your review" />
        <Field label="Email" name="email" type="email" value={form.email} onChange={set('email')} hint="Not shown. Used to verify your purchase." />
        <Field label="Order number (optional)" name="orderNumber" value={form.orderNumber} onChange={set('orderNumber')} placeholder="CMM-2610-123456" hint="Marks the review as a verified purchase" />
        <Field label="Title" name="title" value={form.title} onChange={set('title')} placeholder="Sum it up in a few words" />
        <TextArea label="Your review" name="body" className="sm:col-span-2" value={form.body} onChange={set('body')} placeholder="Condition, battery, delivery, anything that would help someone choosing a grade" />
      </div>
      {error && <p className="mt-3 text-xs font-semibold text-brand-600">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button type="submit" size="sm" disabled={busy}>{busy ? 'Sending…' : 'Submit review'}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
