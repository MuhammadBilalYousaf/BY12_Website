# BY12 SEO changes — 15 November 2026

This batch is local and has not been deployed. It implements the technical foundations from the [SEO audit](<D:/BY12/Perfume Brand/SEO/BY12-SEO-Audit-2026-11-15.md>).

## What changed

- Product, shop, category, blog and deal pages receive public data on the server; their existing interactive components retain gallery, filtering, cart, wishlist and review behavior.
- One canonical origin: `https://www.bilalyousaf12.store`. Existing production already serves that host. The app configuration permanently redirects the non-www host. Hosting-level redirects must be checked after deployment because they can run before application redirects.
- Product SEO fields now drive unique server metadata; duplicate root descriptions and repeated title suffixes are removed.
- Men/Women routes serve actual collections. Empty categories are noindex and excluded from the sitemap. Legacy category query links redirect to collection routes; internal search works and is noindex.
- Missing products, published articles and active deals resolve on the server. Parent blog/shop loading boundaries were removed so missing-resource and redirect decisions can set the HTTP status before streaming begins. Backend errors remain server errors rather than false 404s.
- Blog lookup checks publication status. Sitemap uses the same published-status field as the editor, includes useful stockouts and real category/blog/deal URLs, excludes private utility URLs, and uses real modification dates where available.
- The duplicate static robots file is removed. Utility HTML remains crawlable so noindex can be read. Order confirmation and tracking pages are noindex. Admin/API paths remain disallowed; authentication is still required for private data.
- ProductGroup JSON-LD describes each size's price, stock, sale image and SKU. `?size=30` opens the 30ml selection and uses the base product canonical. JSON-LD serialization escapes `<` to prevent stored content from terminating its script tag.
- Product display-name edits keep the existing document ID and URL, preserving review references. Existing document IDs were not migrated and no catalog documents were edited.
- Product section headings, homepage heading/copy, tester size disclosures, About metadata and authenticity wording were adjusted. Unverified founding-year/hours/price-range/storefront claims are not emitted. No scent notes or reviews were invented.
- Organization profiles/logo references align with existing footer links; missing icon references are removed; a dedicated 1200×630 share image is generated locally by Next.js.
- Date display for server-seeded blog/deal content uses Asia/Karachi to avoid a server/browser day mismatch.
- Small existing TypeScript errors in product modal/admin props and tester preference handling were corrected. Production builds no longer skip type validation. No dependencies were installed or upgraded.

## Shopping behavior and limits

The existing product images, 3D story, sizes, inventory, order/payment code and catalog prices were retained. The selected size is initialized before hydration rather than by a later effect. Cart and checkout calculations were not rewritten. Local browser QA covers size selection → add to cart → checkout summary, without submitting an order; the test basket is then cleared.

Server rendering depends on Firebase Admin access in the deployment environment. The existing local `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` and project configuration were verified with a read-only public-catalog query. They must remain server-only and available in production. React cache deduplicates data reads within each request; no cross-request price/stock cache is introduced. Retained browser subscriptions continue refreshing catalog data.

This is not a guarantee of unchanged behavior under every possible device, backend outage or account state. Final deployment verification should check the hosting redirect, live environment, representative shopping pages and Search Console URL Inspection.

## Verification commands

Final results: production webpack build passed with TypeScript validation enabled; standalone TypeScript check passed; **11/11 unit tests** and **22/22 HTTP smoke checks** passed. The final HTTP checks confirm genuine product/blog/deal/category 404s and 308 redirects for the preferred host and existing aliases.

Browser QA: desktop Men collection has its own H1/canonical and relevant products. Coffeeno 30ml selected at Rs.2,499 enters the cart at that price; checkout shows Rs.2,499 subtotal plus Rs.250 delivery, total Rs.2,749. No order was submitted, and the local basket was cleared. Final 390px mobile checks show no horizontal document overflow on the homepage/product sample. A final desktop screenshot is saved at [homepage-desktop.jpg](<D:/BY12/Perfume Brand/Prefume Website by BY12/SEO-verification/homepage-desktop.jpg>).

Browser logging also exposed Firebase permission failures in the existing custom visitor/cart interaction tracker. Shopping UI and the tested cart/checkout summary still worked. Analytics collection is therefore **not verified**, and Firestore security rules were not relaxed. Real order submission, payment/fulfillment, signed-in account flows, full 3D animation coverage and every device combination were not exercised.

```powershell
node node_modules/typescript/bin/tsc --noEmit --incremental false
node --test scripts/seo-unit.test.cjs
node node_modules/next/dist/bin/next build --webpack
node node_modules/next/dist/bin/next start --port 3100 --hostname 127.0.0.1
node scripts/seo-smoke.mjs http://127.0.0.1:3100
git -c core.whitespace=cr-at-eol diff --check
```

The unit checks cover variant selection/sales/stock, safe structured data, canonical/noindex metadata and a mocked rename operation that must never create/delete the product document. HTTP smoke checks cover raw server HTML, real 404s, permanent aliases, sitemap/robots, direct size selection, noindex and the share image. Results are written to `SEO-verification/smoke-results.json`.

## Remaining work

The next local content/internal-linking batch is documented in [SEO-PHASE-2.md](./SEO-PHASE-2.md), including the buying guides, size comparisons, verified-content handling and tracking limitations.

Search Console ownership/submission and Google-selected canonical/indexing checks, verified GA4 ecommerce reporting, real field performance measurements, editorial product-note verification and blog rewrites, earned-link outreach, and any eligible Business Profile work remain separate follow-ups. None of those accounts or campaigns was changed. Number-one rankings are not guaranteed by these technical changes.

The webpack production build is the compiler path verified here. The installed baseline-browser-mapping package reports that its bundled browser data is old; no dependency update was needed for this SEO batch.
