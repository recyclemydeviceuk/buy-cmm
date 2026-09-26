import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Accordion } from '../ui/Accordion';

const ITEMS = [
  { q: 'What condition are the phones in?', a: 'Each one was sold to us, which we tested on 40 points, wiped, repaired if needed and graded by hand. Functionally it is as good as new. The grade only describes cosmetic wear.' },
  { q: 'Is it unlocked?', a: 'Choose “Unlocked” on the product page and it works with any UK SIM. Network-locked phones are cheaper and only work on that network until unlocked.' },
  { q: 'What if something goes wrong?', a: 'A 12-month warranty covers any hardware fault that isn’t accidental damage. We collect, repair or replace, and return it free. You also have 30 days to return it for a full refund.' },
  { q: 'How do you check the battery?', a: 'With the manufacturer’s own diagnostics. Excellent phones have 90%+ battery health, Good 85%+, Fair 80%+. Anything lower gets a new battery before sale.' },
];

export function FaqTeaser() {
  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <p className="eyebrow text-brand-600">Good to know</p>
        <h2 className="mt-3 text-3xl md:text-[2.6rem] md:leading-[1.08]">Questions people ask before they buy</h2>
        <p className="mt-4 text-ink-3">Straight answers, no fine print. If it isn’t here, ask us.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/faq" className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-semibold hover:border-ink">
            All questions <ArrowRight size={15} />
          </Link>
          <Link to="/contact" className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-ink-3 hover:text-ink">
            Get in touch
          </Link>
        </div>
      </div>
      <div className="lg:col-span-8">
        <Accordion items={ITEMS} defaultOpen={0} />
      </div>
    </div>
  );
}
