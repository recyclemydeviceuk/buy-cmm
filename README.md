# BuyUpon

The CashMyMobile **buy** side: a standalone storefront where customers buy
certified pre-owned iPhone and Samsung Galaxy phones by network, condition
and price. It is deliberately separate from the sell site
(`../python-backend-frontend`) and the sell admin panel (`../adminpanelcmm`).

```
BuyUpon/
├── frontend/        Customer storefront (Vite + React 18 + TypeScript + Tailwind)  ← built
├── backend/         BuyUpon API                                                    ← next
├── admin/           BuyUpon admin panel                                            ← later
└── API_CONTRACT.md  Endpoints the storefront expects from the backend
```

## Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:3003
npm run build      # type-check + production build to dist/
```

`.env` (copied from `.env.example`) controls the data source:

- `VITE_USE_MOCK=true` runs on the in-browser mock adapter with the real device
  catalogue (67 models, 2,150 storage/network/condition variants, real photos).
  Basket and orders persist in `localStorage`.
- `VITE_USE_MOCK=false` plus `VITE_API_BASE_URL` switches to the HTTP adapter
  described in `API_CONTRACT.md`.

Pages: home, shop (facet filters, price range, sort, pagination, search),
product (variant picker, specs, reviews, related), basket, checkout, order
confirmation, grading guide, FAQ, contact, 404.

Design rules live in `frontend/DESIGN_SYSTEM.md`.

### Catalogue data

`frontend/src/data/catalog.ts` is generated: device names and photos come from
the sell site's `devices` collection, prices and specs are mock values for
2026 UK refurbished pricing. Photos are copied into `frontend/public/phones/`.
When the backend exists this file is only used by the mock adapter.
