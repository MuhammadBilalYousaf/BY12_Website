# BY12 Search Console and Google Analytics setup

Account access was verified in the authenticated in-app browser on 15 November 2026. This supersedes the access limitation recorded in `SEO-RELEASE.md`; the project service account itself was not granted any new permissions.

## Verified Google configuration

- Search Console domain property: `sc-domain:bilalyousaf12.store`.
- The existing sitemap URL `https://www.bilalyousaf12.store/sitemap.xml` was resubmitted. Google displayed **Sitemap submitted successfully**, with a submitted date of 15 November 2026. Its historical last-read/discovered-page data must not be mistaken for a new crawl.
- The indexed homepage record still reflected the earlier apex canonical. Google's new live smartphone test successfully fetched the www homepage, allowed indexing and read `https://www.bilalyousaf12.store/` as the declared canonical. Its indexing request was accepted. This is a crawl request, not proof of completed indexing or a Google-selected canonical change.
- Coffeeno's live test detected one valid Product snippets item, two valid Merchant listings items and one valid Breadcrumbs item. Optional non-critical warnings remain; no mandatory structured-data errors were shown. Its indexing request was accepted.
- GA4 account `306668739`, property `512618134` (`by12-b3606`), web stream `12972361201` (`BY12`), measurement ID `G-VQXGFCDSEL` were verified in the UI.
- The web stream's previously blank website URL was updated to `https://www.bilalyousaf12.store`.
- Enhanced measurement was already off. It remains off, allowing the app to own manual pageviews without duplicate history-based pageviews. No automatic form-field collection was enabled.

## Website integration

The Google tag loads after interaction-ready hydration on the production www host. Local previews do not send Analytics events. Public storefront route changes produce manual `page_view` events; size query changes do not inflate pageviews. Admin, sign-in, account, order-history and order-lookup routes are excluded, and navigating to them sets the GA disable flag.

Implemented ecommerce events:

- `view_item` for the actual selected product variant and current price.
- `add_to_cart` / `remove_from_cart` for explicit adds, removals and quantity changes. These calls are outside React state updaters to avoid Strict Mode duplicate effects.
- `view_cart` once for a populated cart visit, after cart loading.
- `begin_checkout` once for a populated checkout visit, after cart loading.
- `purchase` only after `createOrder` returns success with an order ID, with per-session/order deduplication. Failed submissions and confirmation-page reloads do not create purchases. For COD, this represents an accepted order, not collected payment. Cancellation/refund reconciliation is a separate reporting concern.

Values use PKR. Order-level discounts are allocated in cents, including split quantities where rounding requires it, so item totals match the discounted merchandise value. Shipping and tax are separate from purchase value. Free testers remain free. Analytics never changes product/cart/order prices.

Only public product IDs, names, brands, categories, selected sizes, quantities and prices enter ecommerce item payloads. Form values, email, phone, address, card data and account identifiers are not copied. Page URLs omit query strings/fragments; external referrers retain only their origin. Google signals and ad personalization are disabled in the tag configuration.

Analytics errors and blocked browser storage are contained so shopping does not depend on tracking. Ad blockers and network failures can still prevent delivery; a queued event alone is not proof that a report received it.

## Validation record

The combined suite passed 38 tests, including nine Analytics tests for route exclusions, actual variant/sale prices, discount rounding/free samples, invalid inputs, production-only collection, private-route disabling, payload field limits, failed-order handling and purchase deduplication. Standalone TypeScript validation passed.

Production deployment, live event delivery, final reporting settings and additional URL-request results are recorded after verification. A real order will not be submitted just to generate a purchase event.

The implementation follows Google's [manual pageview guidance](https://developers.google.com/analytics/devguides/collection/ga4/views) and [ecommerce event specification](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce).
