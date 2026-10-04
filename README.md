# BuyUpon

The CashMyMobile **buy** side: a standalone storefront where customers buy
certified pre-owned iPhone and Samsung Galaxy phones by network, condition
and price. It is deliberately separate from the sell site
(`../python-backend-frontend`) and the sell admin panel (`../adminpanelcmm`).

```
BuyUpon/
├── frontend/        Customer storefront (Vite + React 18 + TypeScript + Tailwind)  ← built
├── admin/           Admin panel (same stack, shares frontend/src types + catalogue) ← built
├── backend/         BuyUpon API (Node 20 + TypeScript + Express + MongoDB)          ← built
└── API_CONTRACT.md  Endpoints the storefront and admin expect from the backend (implemented)
```

## Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:3003
npm run build      # type-check + production build to dist/
```

`.env` (copied from `.env.example`) sets `VITE_API_BASE_URL`, the BuyUpon backend
that every page reads from: the catalogue, mega menu, instant search, featured
showcase, reviews, delivery options, contact details and PayPal client ID all come
from the API. There is no local or mock data.

Pages: home, shop (facet filters, price range, sort, pagination, search),
product (variant picker, specs, reviews, related), basket, checkout, order
confirmation, grading guide, FAQ, contact, 404.

Design rules live in `frontend/DESIGN_SYSTEM.md`.

### Catalogue data

The catalogue lives in the `buyupon` database and is managed in the admin. The
initial import source is `backend/src/data/catalogue.json` (device names from the
sell site's `devices` collection, with photos copied from its S3 URLs by the seed).

## Admin panel

```bash
cd admin
npm install
npm run dev        # http://localhost:3004
npm run build      # type-check + production build to dist/
```

The admin imports the storefront's `types.ts` and `data/catalog.ts` through the
`@store` alias (`../frontend/src`), so product and order shapes cannot drift.
Product images are relative paths served by the storefront, resolved against
`VITE_STOREFRONT_URL` (default `http://localhost:3003`), so run the storefront
alongside it in mock mode.

`.env` (copied from `.env.example`) sets `VITE_API_BASE_URL`. The admin reads and
writes only through the backend (`/api/buy/admin/*`, bearer token from the emailed
sign-in code); there is no local or demo data. Settings → System shows the live
backend, database, email and PayPal status.

Screens: dashboard (revenue/orders/AOV with period comparison, daily chart, status
mix, top sellers, stock by grade, attention tiles), orders (filters, bulk move to
packing, CSV export) and order detail (status flow with tracking, refunds, notes,
timeline, emails, edit delivery details), products (list, editor with storage ×
network × grade price/stock matrix, price generator, featured, draft/archive),
inventory & pricing (every variant inline-editable, low/out-of-stock views, bulk
price rules), customers (derived from orders, lifetime value, notes), reviews
(moderation + public replies), enquiries (inbox with reply templates), newsletter
(subscribers + CSV export), settings (store, delivery, networks, storages,
condition copy, featured rail, PayPal mode, notifications, team roles, data reset),
activity log, and ⌘K global search.

Order statuses shared by both apps: `confirmed → packing → dispatched → delivered`,
plus `cancelled` and `returned`.

## Backend

```bash
cd backend
npm install
npm run seed        # first time: products, roles, settings, owner admins
npm run dev         # http://localhost:8010
```

See `backend/README.md`. It uses the sell backend's Atlas cluster, Brevo key and
JWT secret but writes only to its own `buyupon` database. Both frontends switch
to it with `VITE_USE_MOCK=false` and `VITE_API_BASE_URL=http://localhost:8010`
(already set in their `.env`). The backend runs with `NODE_ENV=production`: sign-in codes are only ever emailed and checkout needs real PayPal credentials. Run all three together: `buyupon-backend`,
`buyupon-frontend`, `buyupon-admin` in `.claude/launch.json`.
