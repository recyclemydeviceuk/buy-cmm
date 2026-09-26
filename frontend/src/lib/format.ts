import type { Condition } from '../types';

const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
const gbpExact = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 });

export const money = (n: number) => gbp.format(n);
export const moneyExact = (n: number) => gbpExact.format(n);

export const CONDITIONS: Record<Condition, { label: string; short: string; blurb: string; detail: string[] }> = {
  excellent: {
    label: 'Excellent',
    short: 'Looks like new',
    blurb: 'Near-flawless. No visible marks from 20cm away, 90%+ battery health.',
    detail: ['No scratches on the screen', 'Body may have micro-marks invisible at arm’s length', 'Battery health 90% or above', 'Fully tested, 100% functional'],
  },
  good: {
    label: 'Good',
    short: 'Light signs of use',
    blurb: 'Light scratches on the body, screen clean. 85%+ battery health.',
    detail: ['Hairline scratches on the screen, not visible when on', 'Light marks or scuffs on the frame and back', 'Battery health 85% or above', 'Fully tested, 100% functional'],
  },
  fair: {
    label: 'Fair',
    short: 'Visible wear, works perfectly',
    blurb: 'Noticeable scratches or dents. Same 12-month warranty. 80%+ battery health.',
    detail: ['Visible scratches on the screen, no cracks', 'Scuffs, dents or chips on the body', 'Battery health 80% or above', 'Fully tested, 100% functional'],
  },
};

export const CONDITION_ORDER: Condition[] = ['excellent', 'good', 'fair'];

export function conditionLabel(c: Condition) {
  return CONDITIONS[c].label;
}

export function savingsPct(price: number, rrp: number) {
  if (!rrp || rrp <= price) return 0;
  return Math.round(((rrp - price) / rrp) * 100);
}

export function pluralise(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
