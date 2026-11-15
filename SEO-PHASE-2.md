# BY12 SEO phase 2 — buying content and internal links

Historical implementation record: the local-only statements below describe this batch before publication. Deployment is recorded in [SEO-RELEASE.md](SEO-RELEASE.md); the later product-copy, comparison-guide and winter-article release is recorded in [SEO-KEYWORD-RESEARCH.md](SEO-KEYWORD-RESEARCH.md).

Local implementation dated 15 November 2026. No deployment, catalog-document edits, customer-data changes or security-rule releases are part of this batch.

## Content delivered

- `/guides`: a buying-guide hub linked from the global footer, collections and product advice.
- `/guides/30ml-vs-50ml-perfume`: a practical size guide using the actual catalog's size prices, current sales, stock and calculated price per ml. It links to the appropriate size selections on real product pages. It makes no invented spray-count or wear-time promises.
- `/guides/inspired-perfumes-pakistan`: an explanation of BY12's inspired-fragrance positioning, how to read a product listing, sampling, size selection and purchase terms. It does not claim identical ingredients, a similarity percentage or universal performance.
- Product buying-advice sections with a size table, matching tester links, return/contact resources and relevant guide links. Actual catalog note fields appear only when provided. Related product links are now also present in the initial server HTML.
- Men/Women/shop buying advice and links to the guides/testers/return policy. Internal search pages do not receive this extra collection text.
- Existing blog pages now include a clearly separated product/size-guide resources box. Their original CMS article text has not been silently rewritten.
- New guide pages have unique metadata, canonical URLs, Article and breadcrumb structured data, and sitemap entries.

## Page intent

| Page | Purpose / seed search intent |
|---|---|
| Existing homepage | BY12 brand and commercial inspired-fragrance discovery |
| Existing Men/Women collections | Category shopping intent in Pakistan |
| Size guide | Compare 30ml vs 50ml, price per ml and upfront spend |
| Inspired-fragrance guide | Explain what “inspired” means in the BY12 catalog and how to choose |
| Existing product pages | A specific BY12 fragrance, size, current price and availability |

These are page-intent choices, not measured search-volume or rank data. The added links connect supporting information to the actual product/category pages. The approach follows [Google's ecommerce navigation guidance](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure) and [helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

## Product-content accuracy

The old 3D story selected hardcoded fragrance notes from the product's gender/name. Its men's check could also match the word “women”. Those inferred pyramids were removed. Only catalog-supplied note/ingredient strings can now produce the note overlays; absent data uses neutral chapter copy. Note text is not presented as an ingredient/allergen declaration. Bottle geometry, assembly timing and cart callbacks remain the existing implementation.

The new size tables derive sale-adjusted prices and stock independently for each variant. They do not change the actual cart price or inventory. Delivery is explicitly separate from price per ml. Matching samples are found from real related catalog products by fragrance name; no guessed product URL is generated.

## 3D asset availability

During browser checks the remote Coffeeno GLB failed to load. A separate public-asset request failed DNS resolution for `files.catbox.moe` in this environment. This does not establish that the host is unavailable in every location.

The existing `public/models/coffeeno-50ml.glb` asset is used for recovery. It is 1,220,820 bytes, retains its `Assembly` clip, and matches the supplied `Products 3D/coffeeno-50ml.glb` artifact byte-for-byte (SHA-256 `78213d19a4d7b65fd1eeba85efeb6095a43490d3ad42d58efb82748e15d0f731`). Its saved source validation report has zero errors/warnings. Equality with the inaccessible remote file was not asserted.

The original remote URL is retained. Only the Coffeeno 50ml selection using the legacy Catbox source receives this local recovery URL, and it is used only after the primary fetch fails. Other products, different-size models and replacement hosts are not redirected to this asset. No catalog model URL was edited.

The story explicitly registers GSAP's CSS plugin alongside ScrollTrigger. Its initial note/ingredient/particle targets are flattened into DOM elements; previously empty nested arrays could receive animation state and cause invalid-property warnings. Chapter timing and model geometry are preserved.

## Tracking investigation and handling

Observed browser failures were direct Firestore queries/writes to `customerInteractions`. A read-only inspection of the deployed rules found no explicit `match /customerInteractions` block. That finding does not by itself describe all catch-all rule behavior, but it is consistent with the permission-denied responses observed in the browser. No rules were edited or published.

The frontend now records a permission denial for the requesting guest/authenticated identity, reports one clear warning and stops repeating those denied interaction queries/writes for that identity during the page session. A late guest response cannot disable a newly signed-in identity. Transient network errors do not permanently disable attempts. This handling does not grant access and is not a substitute for working analytics.

Tracking remains unverified until the backend rule/collection design and real event collection are reviewed. Private interaction records were not opened up for public access. Firebase documents that client queries must satisfy the deployed rules: [Firestore rules and queries](https://firebase.google.com/docs/firestore/security/rules-query).

## Validation

The targeted test suite now covers size comparison, sale calculations, invalid volumes, sample matching, absent note data, permission backoff and an authentication race, as well as the phase-1 SEO cases. Production build, HTTP checks and browser verification results are recorded after completion below.

- Targeted unit tests: 20/20 passed.
- Browser checks: guide size links selected Coffeeno 30ml, with no mismatched 50ml story displayed. Adding that selection produced Rs. 2,499 + Rs. 250 shipping = Rs. 2,749; the test item was removed and the cart was empty afterward. No order was submitted.
- Responsive checks: at a 390px viewport, the guide and product-advice tables fit their containers without page overflow. A 1440px desktop check also had no page overflow.
- Coffeeno 50ml recovered to the local GLB and reached its visible canvas-ready state. Full assembly choreography has not been exhaustively reviewed.
- One intermediate HTTP run encountered a Firestore `ECONNRESET` and a 500 response for the Women collection. This was a network-backed catalog request, not a content assertion failure. Final verification is rerun below; live database availability remains a dependency.

The changes remain local. Search Console indexing/canonical selection, GA4 event delivery, external link acquisition and field performance are not established by these checks.

### Final recorded results

- `next build --webpack`: passed with TypeScript validation enabled after the animation-target correction.
- HTTP SEO checks: 30/30 passed on the final local production build. This includes the Women collection retry, all new guides, missing-guide 404, sitemap, structured data, direct size links and valid model bytes. Results: `SEO-verification/smoke-results.json`.
- Final Coffeeno 50ml browser reload: visible model-ready canvas; no GSAP invalid-property warnings in the fresh log window. The expected Firebase tracking-permission warning remained.
- Full guide screenshot: `SEO-verification/phase-2-buying-guide.jpg`. Browser viewport overrides were reset and the guide preview was left open.
- `git diff --check` with CRLF-aware whitespace checking: passed.

The local production preview runs at `http://127.0.0.1:3100`. No commit, push or deployment was performed.
