import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

const inputCls = 'w-full h-12 rounded-2xl border border-line bg-white px-4 text-[15px] text-ink placeholder:text-ink-4 transition-all focus:border-ink focus:outline-none focus:ring-4 focus:ring-ink/5 aria-[invalid=true]:border-brand-600';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field({ label, error, hint, className, id, ...rest }, ref) {
  const inputId = id ?? rest.name;
  return (
    <label htmlFor={inputId} className={cn('block', className)}>
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <input ref={ref} id={inputId} className={inputCls} aria-invalid={!!error} {...rest} />
      {error ? <span className="mt-1.5 block text-xs font-semibold text-brand-600">{error}</span> : hint ? <span className="mt-1.5 block text-xs text-ink-3">{hint}</span> : null}
    </label>
  );
});

export function TextArea({ label, error, className, id, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  const inputId = id ?? rest.name;
  return (
    <label htmlFor={inputId} className={cn('block', className)}>
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <textarea id={inputId} className={cn(inputCls, 'h-auto min-h-[150px] resize-y py-3')} aria-invalid={!!error} {...rest} />
      {error && <span className="mt-1.5 block text-xs font-semibold text-brand-600">{error}</span>}
    </label>
  );
}

export function Select({ label, className, id, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  const inputId = id ?? rest.name;
  return (
    <label htmlFor={inputId} className={cn('block', className)}>
      {label && <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>}
      <select id={inputId} className={cn(inputCls, 'appearance-none bg-[url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%230B0C10%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27><polyline points=%276 9 12 15 18 9%27/></svg>")] bg-[length:16px] bg-[right_14px_center] bg-no-repeat pr-10 font-medium')} {...rest}>
        {children}
      </select>
    </label>
  );
}
