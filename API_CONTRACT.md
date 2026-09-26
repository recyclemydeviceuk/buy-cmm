# BuyUpon API contract

The storefront in `frontend/` talks to a backend through one interface,
`src/api/types.ts` (`StorefrontApi`). Today it runs on the in-browser mock
adapter (`src/api/mock/adapter.ts`, enabled by `VITE_USE_MOCK=true`). When the
BuyUpon backend exists, set `VITE_USE_MOCK=false` and `VITE_API_BASE_URL`, and
the HTTP adapter (`src/api/http/adapter.ts`) calls the endpoints below.

All JSON is camelCase. Prices are whole GBP including VAT. Types are in
`frontend/src/types.ts` and are the source of truth for shapes.

Base path: `{VITE_API_BASE_URL}/api/buy`

| Method | Path | Query / body | Returns |
| --- | --- | --- | --- |
| GET | `/products` | `ProductQuery` as query string: repeatable `brand`, `series`, `network`, `condition`, `storage`; `minPrice`, `maxPrice`, `search`, `sort` (`popular`, `price-asc`, `price-desc`, `newest`), `page`, `pageSize` | `Paged<Product>`; `fromPrice` on each item must be the lowest in-stock price that satisfies the variant-level filters |
| GET | `/products/facets` | same query | `Facets` with model counts per value (not variant counts) and the in-stock `priceRange` |
| GET | `/products/featured` | | `Product[]` (home page rail) |
| GET | `/products/:slug` | | `Product` with every variant, or 404 |
| GET | `/products/:slug/related` | | `Product[]` (up to 4, same series) |
| GET | `/products/:id/reviews` | | `Review[]` |
| POST | `/checkout` | `CheckoutRequest` | `Order` (201). `paymentToken` is a PSP token; the backend never receives raw card data |
| GET | `/orders/:orderNumber` | | `Order` or 404 |
| POST | `/newsletter` | `{ email }` | `{ ok: true }` |
| POST | `/contact` | `{ name, email, message }` | `{ ok: true }` |

Notes for the backend build:

- `Product.variants` is the full storage × network × condition matrix with
  `price` and `stock`. The storefront hides a variant when `stock` is 0.
- `condition` values are `excellent`, `good`, `fair` (buy-side grades). They
  are not the sell-site grades (`New / Excellent`, `Good`, `Broken / Faulty`).
- `network` values follow the sell site's networks collection; `Unlocked` is
  always first.
- Images: `Product.image` is a URL. The mock uses `/phones/*.webp` copied from
  the sell site's device catalogue; the backend should serve the same S3 URLs.
- Error responses: JSON `{ message }` with a non-2xx status. The HTTP adapter
  throws on any non-2xx.
