import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { useSeo } from '../lib/seo';
import { Hero } from '../components/home/Hero';
import { TrustStrip } from '../components/home/TrustStrip';
import { BrandSplit } from '../components/home/BrandSplit';
import { BudgetTiles } from '../components/home/BudgetTiles';
import { HowItWorks } from '../components/home/HowItWorks';
import { ConditionGuide } from '../components/home/ConditionGuide';
import { TradeInBanner } from '../components/home/TradeInBanner';
import { Testimonials } from '../components/home/Testimonials';
import { FaqTeaser } from '../components/home/FaqTeaser';
import { ClosingCta } from '../components/home/ClosingCta';
import { NewArrivals } from '../components/home/NewArrivals';
import { BestsellerSlider } from '../components/home/BestsellerSlider';
import { Section, SectionHeading } from '../components/ui/Section';

export default function Home() {
  useSeo({ description: 'Certified pre-owned iPhone and Samsung Galaxy phones, tested on 40 points and graded by hand. Up to 60% less than new, 12-month warranty, free next-day UK delivery.', canonical: '/' });
  const featured = useAsync(() => api.getFeatured(), []);
  const newest = useAsync(() => api.listProducts({ sort: 'newest', pageSize: 5 }), []);

  return (
    <>
      <Hero />
      <TrustStrip />

      <Section className="pb-6 md:pb-8">
        <SectionHeading eyebrow="Shop by brand" title={<>Two brands. <span className="serif-accent text-ink-3">Every</span> model worth owning.</>} blurb="Every iPhone and Galaxy from the last seven years, priced by storage, network and condition." />
        <BrandSplit />
      </Section>

      <Section className="pt-10 md:pt-12">
        <SectionHeading eyebrow="Most popular" title="Bestsellers this week" action={{ label: 'View all phones', to: '/shop' }} />
        <BestsellerSlider products={featured.data ?? []} loading={featured.loading} />
      </Section>

      <Section tone="cream">
        <SectionHeading eyebrow="Shop by budget" title="Start with what you want to spend" blurb="Prices include VAT and delivery. No hidden fees at checkout." align="center" />
        <BudgetTiles />
      </Section>

      <Section tone="ink">
        <HowItWorks />
      </Section>

      <Section id="grades">
        <SectionHeading eyebrow="Condition grades" title={<>Three grades. <span className="serif-accent text-ink-3">One honest</span> description each.</>} blurb="Cosmetic condition is the only thing that changes between grades. Every phone works perfectly and carries the same warranty." action={{ label: 'Full grading guide', to: '/how-it-works#grades' }} />
        <ConditionGuide />
      </Section>

      <Section className="pt-0">
        <SectionHeading eyebrow="Just landed" title="Newest models, freshly graded" action={{ label: 'See newest', to: '/shop?sort=newest' }} />
        <NewArrivals products={newest.data?.items ?? []} loading={newest.loading} />
      </Section>

      <Section className="pt-0">
        <TradeInBanner />
      </Section>

      <Section className="overflow-hidden">
        <SectionHeading eyebrow="Reviews" title={<>What <span className="serif-accent text-ink-3">12,400 customers</span> say</>} align="center" />
        <Testimonials />
      </Section>

      <Section>
        <FaqTeaser />
      </Section>

      <section className="container pb-4">
        <ClosingCta />
      </section>
    </>
  );
}
