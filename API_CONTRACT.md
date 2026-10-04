# BuyUpon API contract

Implemented by `backend/` (Node + Express + MongoDB). The storefront in `frontend/`
talks to it through one interface, `src/api/types.ts` (`StorefrontApi`), whose
HTTP adapter (`src/api/http/adapter.ts`) calls the endpoints below at
`VITE_API_BASE_URL`.

All JSON is camelCase. Prices are whole GBP including VAT. Types are in
`frontend/src/types.ts` and are the source of truth for shapes.

Base path: `{VITE_API_BASE_URL}/api/buy`

| Method | Path | Query / body | Returns |
| --- | --- | --- | --- |
| GET | `/products` | `ProductQuery` as query string: repeatable `brand`, `series`, `network`, `condition`, `storage`; `minPrice`, `maxPrice`, `search`, `sort` (`popular`, `price-asc`, `price-desc`, `newest`), `page`, `pageSize` | `Paged<Product>`; `fromPrice` on each item must be the lowest in-stock price that satisfies the variant-level filters |
| GET | `/products/facets` | same query | `Facets` with model counts per value (not variant counts) and the in-stock `priceRange` |
| GET | `/products/featured` | | `Product[]` (home page rail and hero showcase, order set in admin Settings → Featured) |
| GET | `/products/menu` | | `MenuProduct[]`: every active product with `id, slug, brand, name, series, image, fromPrice, rrp, releaseYear, rating, reviewCount, storages` (mega menu, instant search, sitemap) |
| GET | `/reviews/recent` | `limit` (≤ 24) | `{ items: Review[], total, average }` of approved reviews, newest first (home page) |
| GET | `/products/:slug` | | `Product` with every variant, or 404 |
| GET | `/products/:slug/related` | | `Product[]` (up to 4, same series) |
| GET | `/products/:id/reviews` | | `Review[]` |
| POST | `/checkout` | `CheckoutRequest` | `Order` (201). `paymentToken` is a PSP token; the backend never receives raw card data |
| GET | `/orders/:orderNumber` | | `Order` or 404 |
| POST | `/newsletter` | `{ email }` | `{ ok: true }` |
| POST | `/contact` | `{ name, email, message, orderNumber? }` | `{ ok: true }`; sends an acknowledgement and an admin alert |
| POST | `/products/:id/reviews` | `{ author, email, rating, title, body, orderNumber? }` | `{ ok: true, status: 'pending' }`; `verified` is set when the order number matches the email and product |
| GET | `/config` | | Public store config: enabled delivery options, networks, grade copy, PayPal mode and client id |

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

---

# Admin API contract

The admin panel in `admin/` talks to the backend through `admin/src/api/types.ts`
(`AdminApi`); its HTTP adapter (`admin/src/api/http/adapter.ts`) calls the
endpoints below. Shapes are in
`admin/src/types.ts`, which extends the storefront types.

Base path: `{VITE_API_BASE_URL}/api/buy/admin`. Every request except `/auth/*`
carries `Authorization: Bearer <token>`; a `401` sends the admin back to login.
List endpoints take `page` / `pageSize` and return `Paged<T>`; `all` is treated as
"no filter". Errors are JSON `{ message }` with a non-2xx status.

## Auth (email OTP, same model as the sell admin)

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| POST | `/auth/request-otp` | `{ email }` | `{ ok: true }` · `401` if the email is not an admin or is suspended. In development with `OTP_DEV_ECHO=true` (or when the email fails to send) the response also carries `devCode` |
| POST | `/auth/verify-otp` | `{ email, code }` | `{ token, user: AdminUser }` |
| GET | `/auth/me` | | `AdminUser` |
| POST | `/auth/logout` | | `204` |

## Dashboard and search

| Method | Path | Query | Returns |
| --- | --- | --- | --- |
| GET | `/dashboard` | `range` = `7d` \| `30d` \| `90d` | `DashboardStats` (revenue/orders/AOV with previous-period comparison, daily series, top products, stock by grade, status counts) |
| GET | `/search` | `q` | `SearchHit[]` across orders, products, customers, enquiries (max 14) |

## Products, variants, pricing

| Method | Path | Query / body | Returns |
| --- | --- | --- | --- |
| GET | `/products` | `ProductListQuery` (`search`, `brand`, `series`, `status`, `stock` = `in`/`low`/`out`, `featured`, `sort`) | `Paged<AdminProduct>`; archived products are excluded unless `status` is set |
| GET | `/products/series` | | `[{ brand, series, count }]` |
| GET | `/products/:id` | | `AdminProduct` with the full variant matrix |
| POST | `/products` | `ProductInput` | `AdminProduct` (201); `409` on duplicate slug |
| PATCH | `/products/:id` | `Partial<ProductInput>` | `AdminProduct`. `featured` keeps `settings.featuredSlugs` in sync |
| DELETE | `/products/:id` | | `204`. Products that appear in any order are archived, not deleted |
| GET | `/variants` | `VariantListQuery` (`search`, `brand`, `network`, `condition`, `storage`, `stock`, `sort`) | `Paged<VariantRow> & { summary }` — one row per storage × network × condition |
| PATCH | `/variants` | `{ updates: VariantUpdate[] }` | `{ updated }` |
| POST | `/pricing/preview` | `PriceRule` | `{ affected, sampleBefore, sampleAfter }` |
| POST | `/pricing/apply` | `PriceRule` | `{ affected }` |

`PriceRule`: `mode` (`percent` \| `fixed`), `amount`, optional `brand`, `series`,
`condition`, `network`, and `roundTo` (`9` rounds to £…9). Prices never drop below £10.

## Orders

Order statuses are `confirmed → packing → dispatched → delivered`, plus `cancelled`
and `returned`. `paymentStatus` is `paid`, `partially-refunded` or `refunded`.

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| GET | `/orders` | `OrderListQuery` (`search`, `status` incl. `open` = confirmed+packing, `paymentStatus`, `delivery`, `flagged`, `from`, `to`, `sort`) | `Paged<AdminOrder>` |
| GET | `/orders/:orderNumber` | | `AdminOrder` with `events` timeline |
| POST | `/orders/:orderNumber/status` | `StatusChange` (`status`, optional `tracking`, `note`, `notifyCustomer`) | `AdminOrder`. `cancelled`/`returned` restock the lines and refund the remaining balance via PayPal |
| POST | `/orders/:orderNumber/notes` | `{ note }` | `AdminOrder` |
| POST | `/orders/:orderNumber/tracking` | `{ carrier, number, url? }` | `AdminOrder` |
| POST | `/orders/:orderNumber/refund` | `{ amount, reason }` | `AdminOrder`; amount ≤ remaining balance |
| POST | `/orders/:orderNumber/emails` | `{ kind: confirmation \| dispatched \| invoice }` | `AdminOrder` |
| PATCH | `/orders/:orderNumber` | `{ flagged? , customer? }` | `AdminOrder` |

## Customers (derived from orders, keyed by lower-cased email)

| Method | Path | Returns |
| --- | --- | --- |
| GET | `/customers` (`CustomerListQuery`) | `Paged<Customer>` |
| GET | `/customers/:email` | `{ customer, orders, reviews, enquiries }` |
| PATCH | `/customers/:email` (`{ notes }`) | `Customer` |

## Reviews, enquiries, newsletter

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| GET | `/reviews` | `ReviewListQuery` (`status`, `rating`, `productId`, `search`) | `Paged<AdminReview> & { counts }` |
| PATCH | `/reviews/:id` | `{ status? , reply? }` | `AdminReview`. Approving/rejecting recalculates the product's public `rating` |
| DELETE | `/reviews/:id` | | `204` |
| GET | `/enquiries` | `EnquiryListQuery` | `Paged<Enquiry> & { counts }` |
| PATCH | `/enquiries/:id` | `{ status?, reply?, assignee? }` | `Enquiry`; a `reply` emails the customer and sets `repliedAt` |
| GET | `/subscribers` | `SubscriberListQuery` | `Paged<Subscriber> & { counts }` |
| POST | `/subscribers` | `{ email }` | `Subscriber` |
| PATCH | `/subscribers/:id` | `{ status }` | `Subscriber` |
| DELETE | `/subscribers/:id` | | `204` |

Storefront `POST /api/buy/products/:id/reviews` creates reviews as `pending`;
only `approved` reviews are returned by `GET /products/:id/reviews`.

## Settings, team, activity

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| GET | `/settings` | | `Settings` (store details, delivery options, networks, storages, condition copy, featured slugs, low-stock threshold, PayPal mode/client ID, admin notifications) |
| PATCH | `/settings` | `Partial<Settings>` | `Settings`. The storefront should read delivery options, networks and condition copy from here |
| GET | `/admins` | | `AdminUser[]` (`roleId`, `status` = `active` \| `suspended`) |
| POST | `/admins` | `{ email, name, roleId }` | `AdminUser` |
| PATCH | `/admins/:id` | `{ name?, roleId?, status? }` | `AdminUser`. An admin cannot change their own role or suspend themselves; at least one active Owner must remain |
| DELETE | `/admins/:id` | | `204`; the last owner cannot be removed |
| GET | `/roles` | | `Role[]` with `members` count |
| POST | `/roles` | `RoleInput` (`name`, `description`, `permissions`, `color`) | `Role` (201) |
| PATCH | `/roles/:id` | `Partial<RoleInput>` | `Role`. `role_owner` is immutable |
| DELETE | `/roles/:id` | | `204`; built-in roles and roles with members cannot be deleted |
| GET | `/activity` | `ActivityQuery` (`search`, `actor`, `targetType`) | `Paged<ActivityEntry>` — every mutating admin call is logged with the actor |
| GET | `/system` | | Backend environment, database name, email and PayPal status, live collection counts (Settings → System) |

**Permissions.** A role is a named set of permission keys (see
`admin/src/lib/permissions.ts`): `dashboard.view`, `orders.view`, `orders.manage`,
`orders.refund`, `orders.export`, `products.view`, `products.edit`,
`products.delete`, `inventory.edit`, `pricing.rules`, `customers.view`,
`customers.edit`, `reviews.manage`, `enquiries.manage`, `subscribers.manage`,
`settings.view`, `settings.edit`, `team.view`, `team.manage`, `activity.view`.
Three built-in roles ship (`role_owner` = everything and locked, `role_manager` =
everything except `team.manage`, `role_staff` = fulfilment, stock, reviews,
enquiries); any number of custom roles can be created. `/auth/verify-otp` and
`/auth/me` return the user's resolved `role` so the UI can hide what the role
cannot do. The backend must enforce the same keys on every endpoint; the UI only
hides controls.
