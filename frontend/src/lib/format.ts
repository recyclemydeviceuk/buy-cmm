import type { BasketLine, Condition } from '../types';

const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
const gbpExact = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 });

export const money = (n: number) => gbp.format(n);
export const moneyExact = (n: number) => gbpExact.format(n);

interface Grade {
  label: string;
  /** Badge shown on grade cards and tabs. */
  grade: string;
  short: string;
  blurb: string;
  detail: string[];
  /** The three things a buyer compares between grades. */
  facts: Array<[string, string]>;
  /** Typical saving against the launch price, where we quote one. */
  saving?: string;
}

export const CONDITIONS: Record<Condition, Grade> = {
  premium: {
    label: 'Premium',
    grade: 'A+',
    short: 'Original, boxed, never refurbished',
    blurb: 'An original phone that has never been refurbished, sent in its box. 90%+ battery health.',
    detail: ['Original device: never refurbished, no replaced parts', 'Comes in its box', 'Battery health 90% or above', 'Fully tested, 100% functional'],
    facts: [['Parts', 'All original'], ['Box', 'Included'], ['Battery', '90%+']],
  },
  excellent: {
    label: 'Excellent',
    grade: 'A',
    short: 'Looks like new',
    blurb: 'Near-flawless. No visible marks from 20cm away, 90%+ battery health.',
    detail: ['No scratches on the screen', 'Body may have micro-marks invisible at arm’s length', 'Battery health 90% or above', 'Fully tested, 100% functional'],
    facts: [['Screen', 'No scratches'], ['Body', 'Micro-marks only'], ['Battery', '90%+']],
    saving: '30–45%',
  },
  good: {
    label: 'Good',
    grade: 'B',
    short: 'Light signs of use',
    blurb: 'Light scratches on the body, screen clean. 85%+ battery health.',
    detail: ['Hairline scratches on the screen, not visible when on', 'Light marks or scuffs on the frame and back', 'Battery health 85% or above', 'Fully tested, 100% functional'],
    facts: [['Screen', 'Hairline, invisible when on'], ['Body', 'Light scuffs'], ['Battery', '85%+']],
    saving: '40–55%',
  },
  fair: {
    label: 'Fair',
    grade: 'C',
    short: 'Visible wear, works perfectly',
    blurb: 'Noticeable scratches or dents. Same 12-month warranty. 80%+ battery health.',
    detail: ['Visible scratches on the screen, no cracks', 'Scuffs, dents or chips on the body', 'Battery health 80% or above', 'Fully tested, 100% functional'],
    facts: [['Screen', 'Visible, no cracks'], ['Body', 'Scuffs, dents or chips'], ['Battery', '80%+']],
    saving: '50–65%',
  },
};

/** Best first. */
export const CONDITION_ORDER: Condition[] = ['premium', 'excellent', 'good', 'fair'];

export function conditionLabel(c: Condition) {
  return CONDITIONS[c]?.label ?? c;
}

/** "256GB · Deep Blue · Excellent": how a basket or order line is described everywhere. */
export function lineSpec(l: Pick<BasketLine, 'storage' | 'colour' | 'condition'>) {
  return [l.storage, l.colour, conditionLabel(l.condition)].filter(Boolean).join(' · ');
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
