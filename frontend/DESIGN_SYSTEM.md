# BuyUpon storefront design system

Warm, containerised, one accent colour. Everything is defined in
`tailwind.config.js` and `src/index.css`; use those tokens, not raw hex values.
Inspiration: Back Market (centred editorial hero, pill search, white product
cards), phonebox.co.uk (bold colour-block tiles), Reboxed ("£x off new" badges).

## Colour

| Token | Value | Use |
| --- | --- | --- |
| `brand-600` | `#D01A2A` | CashMyMobile red. Primary buttons, serif accent words, "New in" badges, the trade-in block. |
| `brand-700` / `brand-50` | `#B01524` / `#FFF1F2` | Hover state / tinted error panels |
| `ink` | `#0B0C10` | Headings, body text, dark sections, dark buttons, selected chips |
| `ink-2` / `ink-3` / `ink-4` | `#3A3F47` / `#6E737C` / `#A2A6AD` | Secondary text, captions, placeholders |
| `line` / `line-2` | `#E7E4DE` / `#F0EDE7` | Warm borders and dividers |
| `cream` / `cream-2` | `#F6F3EE` / `#FBF9F5` | Hero, page headers, image wells, alternate section bands. There is no grey anywhere. |
| `tint-mint / sky / lilac / peach / lemon` | pastel tiles | Category, budget and showcase tiles; icon backgrounds. One tint per tile, never gradients. |
| `success` | `#127A4A` | "Free", "Verified purchase", checkmarks |

Sections alternate white → cream → ink (dark). Red is reserved for the primary
call to action, one accent word per heading and the trade-in block.

## Type

- **Plus Jakarta Sans** for everything (`font-sans` / `font-display`), headings
  700 with `tracking-tightest`.
- **Instrument Serif italic** (`.serif-accent`) for one accent word in a
  heading, the hero, and step numbers. Never for body copy.
- Body 400–500, 15px, 1.65 line height. Eyebrows use `.eyebrow` (11px, 700,
  0.2em tracking).

## Layout

- Container: max 1280px, 20px gutter on phones, 40px on desktop.
- Header: **fixed, floating glass pill** (`.glass`: white 60–85% + 24px blur,
  hairline border, soft shadow) inside a 1180px container, 16px from the top.
  `Layout` reserves `pt-[92px] md:pt-[104px]`; the home hero pulls itself under
  the header with a negative margin.
- Nav is three items only: **Buy a phone** (mega menu), **How it works**, and
  **Get in touch** as a dark pill button. Search and basket are icon buttons.
- Mega menu (`layout/MegaMenu.tsx`): brand rail (iPhone / Samsung, hover to
  switch) + quick picks, four generation columns listing **every** model with
  thumbnail and from-price (built from the catalogue in `data/menu.ts`), and a
  featured tile on the right. Panels drop 10px below the pill with a 28px radius.
- Radii: cards `rounded-3xl` (28px), hero tiles `rounded-[32px]`, buttons and
  chips `rounded-full`.
- Shadows: `shadow-card` on hover lift, `shadow-float` for panels, `shadow-glass`
  for the header. Cards lift 4px on hover.

## Components

- `ui/`: `Button` (pill; primary red, dark, light, secondary, ghost), `Badge`
  (pill), `Rating`/`Stars` (amber), `Field`/`TextArea`/`Select` (rounded-2xl),
  `Accordion` (card variant), `Skeleton`, `Section` (`tone` white/cream/ink),
  `SectionHeading`, `PageHeader` (cream band for inner pages).
- `product/`: `ProductCard` (4:5 cream well, "£x off new" ink badge, "New in"
  red badge, storage range, stars, "Starting at" price, arrow on hover),
  `ProductGrid`, `ProductRail`, `FilterPanel` (card, custom checkboxes, dual
  range), `VariantPicker` (chips with price, grade cards A/B/C).
- `home/`: `Hero` (centred headline with serif accent, pill search, quick
  chips), `DeviceShowcase` (five devices on tinted tiles in an arc),
  `TrustStrip` (overlapping white card), `BrandSplit` (ink iPhone tile + sky
  Samsung tile), `BudgetTiles`, `HowItWorks` (dark band with stats),
  `ConditionGuide`, `TradeInBanner` (red block), `Testimonials` (rating card +
  reviews), `FaqTeaser`.
- `layout/`: `Header`, `MegaMenu`, `Footer` (dark), `AddedToast`.

## Imagery

Only real device photos from the catalogue (`public/phones/`). On tinted or
cream surfaces they use `.product-img` (`mix-blend-multiply`) so white
backgrounds disappear. On dark or red surfaces use the transparent cutouts in
`public/stage/`. No stock photos, no 3D stage, no illustrations.
