# BY12 Search Console and Google Analytics setup

Latest owner evidence, 16 November: the Windsor Search Console screenshot shows `sc-domain:bilalyousaf12.store` ticked and the success message “ChatGPT can now see your data.” The owner's connection/selection step is complete according to that UI. Two subsequent `get_connectors` calls failed at the ChatGPT/Windsor transport layer, before any account list or report was returned. This is not an empty account list or evidence of missing Google permission; do not ask the owner to reconnect based on these errors. Reporting remains unverified until the tool transport recovers and actual rows are obtained. The connection-list limitation in the earlier update below is historical.

Subsequent reporting update, 16 November: Windsor.ai now exposes the correct GA4 property `512618134` (`by12-b3606`). The last-seven-day overview, one wider 28-day read and a recent event read completed with empty data; these are not measured zero-traffic results or a final Realtime validation. Search Console remains absent from the connected-account list after a recheck; the owner was given the actual provider connection link and instructions to authorize/select the property and Finish. See [SEO-GROWTH-REVIEW.md](SEO-GROWTH-REVIEW.md) for current evidence and limitations. Earlier in-app Realtime observations below remain historical verified results.

Account access was verified in the authenticated in-app browser on 15 November 2026. This supersedes the access limitation recorded in `SEO-RELEASE.md`; the project service account itself was not granted any new permissions.

## Verified Google configuration

- Search Console domain property: `sc-domain:bilalyousaf12.store`.
- The existing sitemap URL `https://www.bilalyousaf12.store/sitemap.xml` was resubmitted. Google displayed **Sitemap submitted successfully**, with a submitted date of 15 November 2026. Its historical last-read/discovered-page data must not be mistaken for a new crawl.
- The indexed homepage record still reflected the earlier apex canonical. Google's new live smartphone test successfully fetched the www homepage, allowed indexing and read `https://www.bilalyousaf12.store/` as the declared canonical. Its indexing request was accepted. This is a crawl request, not proof of completed indexing or a Google-selected canonical change.
- Coffeeno's live test detected one valid Product snippets item, two valid Merchant listings items and one valid Breadcrumbs item. Optional non-critical warnings remain; no mandatory structured-data errors were shown. Its indexing request was accepted.
- GA4 account `306668739`, property `512618134` (`by12-b3606`), web stream `12972361201` (`BY12`), measurement ID `G-VQXGFCDSEL` were verified in the UI.
- The web stream's previously blank website URL was updated to `https://www.bilalyousaf12.store`.
- Enhanced measurement was already off. It remains off, allowing the app to own manual pageviews without duplicate history-based pageviews. No automatic form-field collection was enabled.
- Reporting settings were saved successfully: Pakistan / Pakistan Time (GMT+05:00), Pakistani Rupee (Rs), Beauty & Fitness, Small (1–10 employees, confirmed by the owner), and the Drive sales / Understand web and/or app traffic objectives.

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

Live verification exposed duplicate screen-view events caused by the existing animated page wrapper briefly remounting previous route children. The helper now validates the expected route for item/cart/checkout views and deduplicates screen-view events for the current visit across component remounts. A real return visit and repeated cart add/remove actions still count. The page-transition animation itself was not changed.

## Validation record

The suite covers 40 tests, including eleven Analytics tests for route exclusions, actual variant/sale prices, discount rounding/free samples, invalid inputs, production-only collection, private-route disabling, payload field limits, failed-order handling, purchase deduplication and animated-route remounts. Standalone TypeScript validation passed on the initial integration; the final Vercel production build also runs TypeScript validation.

Production deployment, live event delivery, final reporting settings and additional URL-request results are recorded after verification. A real order will not be submitted just to generate a purchase event.

## Recorded account and live results

- Google explicitly accepted indexing requests for the homepage, Coffeeno, Ravla and both buying guides (five confirmed requests).
- An indexing request for `/shop/men` was initiated, but its final confirmation was not observed before browser control became unresponsive. `/shop/women` has not yet received a manual request in this session. Both are available in the submitted sitemap. Do not count these two collection requests as confirmed.
- GA4 Realtime received `page_view`, `view_item`, `add_to_cart`, `view_cart` and `begin_checkout` from an actual live-store test. It displayed an active user in Pakistan and the Coffeeno page title. These were QA visits, not evidence of new customers.
- The test began with an empty guest basket, added Coffeeno 30ml at Rs. 2,499, entered checkout with Rs. 250 shipping (Rs. 2,749 total), then removed the test item. The empty basket was verified afterward. No personal form data or order was submitted.
- The initial live QA exposed duplicate view events from animated route remounts. Those historical QA counts are not revised by the fix. The fix passed 40 tests and a Vercel production build with TypeScript validation; it was promoted as `dpl_DceKmfsRXHkJdjBmGDqB17KtUJcJ` (`bilalyousaf12store-co1fswjy6-bilal-yousafs-projects.vercel.app`), source commit `38d2602`.
- The first Analytics release (`dpl_9Rt9oHRTU34tnm3194sYqTpD4CaL`) passed all 31 live HTTP SEO checks. Final-release results are saved separately in `SEO-verification/google-setup-final-smoke.json`.
- The final release also passed all 31 public HTTP checks after a targeted homepage recheck. The first homepage request had a transport-level fetch failure; the recheck confirmed HTTP 200, one description, a server-rendered H1 and the correct normalized www canonical. The original failure remains in the JSON report's recheck history. The root canonical's serialization without a trailing slash normalizes to the same root URL.
- Browser control subsequently timed out and reset repeatedly. A final post-fix Realtime count comparison and the remaining Google-screen checks were not completed. The purchase event's success/failure and deduplication behavior was tested with isolated mocks; a real purchase receipt in Analytics is not claimed.
- Reporting settings displayed `Success.` after saving PKR, Pakistan Time, the owner-confirmed employee range and the business objectives. Screenshots are saved locally in `SEO-verification/search-console-sitemap-success.jpg`, `homepage-indexing-requested.jpg`, `coffeeno-indexing-requested.jpg` and `ga4-pkr-pakistan-settings.jpg`.

No Google account permissions, API secrets, advertising links or project service-account grants were created. Search Console indexing and ranking changes still depend on Google's subsequent processing. The optional product/merchant structured-data warnings should be reviewed separately using verified shipping/return/product facts.

The implementation follows Google's [manual pageview guidance](https://developers.google.com/analytics/devguides/collection/ga4/views) and [ecommerce event specification](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce).
