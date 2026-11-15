# BY12 content, performance, backlinks and reporting review — 16 November 2026

This work follows the keyword/content release in [SEO-KEYWORD-RESEARCH.md](SEO-KEYWORD-RESEARCH.md). It separates completed changes, measurements and account/editorial dependencies. It does not establish first-page rankings.

## Content review

All three remaining published articles were reviewed. Their revision plan is `seo-content/editorial-catalog.json`:

| Existing article ID | Issue found | Revised title and treatment |
|---|---|---|
| `EqfHPeAYkg0a3cZ8ZTrO` | All-day performance promise, universal application/layering advice and unsupported implied results. | How to Apply Perfume: A Practical BY12 Sample Guide. A consistent sampling/observation routine, use instructions, current products and size/sample resources. |
| `k0jKlmDSVGrIPvPPAAlX` | An asserted top-ten performance ranking, broad wear-time ranges and an extra body H1. | Long-Lasting Perfume in Pakistan: What to Check Before Buying. Distinguishes scent direction, inspiration and actual observations; removes the untested ranking and duplicate H1. |
| `SgQwBG6wp0NyPHyM63E4` | Generic oil-mixing recipes and ratios, a duplicate H1 and an implied universal route to finished perfume. | Making Perfume from Oils: What to Know Before You Start. Keeps the educational topic, explains materials versus notes and why intended use/material-specific information matters, citing primary IFRA guidance. |

The DIY review uses [IFRA's fragrance questions](https://ifrafragrance.org/about-fragrance/this-is-a-fragrance-2) and [standards explanation](https://ifrafragrance.org/understanding-standards). No BY12 certificate, formula, perfumer identity, oil concentration or testing history is invented. The other guides offer a practical purchasing/observation process rather than medical advice or a guaranteed performance result.

Only title, excerpt, body, tags, read-time and actual modification time are edited. Document IDs, publication state, original creation/author/image identity and all product/commercial fields are preserved. The editorial plan has a separate preview/rollback record; it cannot overwrite the previous keyword release's backup. A published plan's preview can no longer be regenerated over its original rollback copy.

## Speed baseline and fixes

The public PageSpeed mobile and desktop API requests again returned HTTP 429 (daily quota exceeded). Local browser control was previously unable to verify the current URL, so no Lighthouse, mobile-render, LCP/INP/CLS or Core Web Vitals pass is claimed.

Actual read-only HTTP/resource diagnostics were obtained with `node scripts/seo-performance.mjs before-speed-fixes`. Three samples per route were measured from this execution environment:

| Route | Median time to response headers | Median complete HTML response | Decoded bytes of script URLs listed in HTML |
|---|---:|---:|---:|
| Homepage | 594 ms | 956 ms | 1,254,948 |
| Shop | 453 ms | 622 ms | 1,223,315 |
| Coffeeno | 399 ms | 610 ms | 1,372,108 |
| Ravla | 533 ms | 721 ms | 1,372,108 |

These are environment-specific request timings, not browser visual-load or global latency measurements. The script sum includes listed assets such as legacy-browser polyfills; it is not a measurement of what every browser downloads. Decoded response bytes are distinct from compressed wire bytes. The JSON preserves individual samples, headers, URLs and limitations.

The original hero PNG is 4,705,834 bytes, but Next's 1080px AVIF output was already only 30,657 bytes at quality 75. The logo's 256px AVIF output was 8,488 bytes. Therefore the original PNG size was not treated as the amount each visit downloads. A direct unsupported quality-90 API request returned 400, but the actual Image component normalized its output to quality 75, so this is not evidence that the live hero was broken.

Concrete fixes:

- The homepage artwork is displayed only at desktop widths, but previously had an unconditional image preload. A media-scoped preload and responsive picture source now target desktop only; mobile has an inline transparent fallback inside the already-hidden artwork container. Desktop retains an eager, high-priority optimized image.
- The featured blog artwork is far below the homepage's first viewport. Its eager preload is replaced by native lazy loading, leaving first-viewport resources with priority.
- The optional below-fold WebGL story is split into a separate client chunk using `next/dynamic`. Product content, prices, schema and shopping controls remain server rendered. The same model resolver, GLB bytes, animation implementation and callbacks are retained. The story loads when its client component mounts; it is not claimed to wait for scrolling.

The changes follow [Next's Image/art-direction documentation](https://nextjs.org/docs/app/api-reference/components/image), [lazy-loading guidance](https://nextjs.org/docs/app/guides/lazy-loading), and Google's [LCP loading-priority guidance](https://web.dev/articles/optimize-lcp). A true browser/field performance baseline still requires an available measurement service or functioning browser capture.

### After-release measurement

The same HTTP/resource diagnostic ran after promotion, with evidence saved as `SEO-verification/performance-after-speed-fixes.json`:

| Route | After median headers | After median complete HTML | Script bytes before → after |
|---|---:|---:|---:|
| Homepage | 487 ms | 702 ms | 1,254,948 → 1,255,473 |
| Shop | 421 ms | 513 ms | 1,223,315 → 1,223,446 |
| Coffeeno | 406 ms | 587 ms | 1,372,108 → 1,247,198 |
| Ravla | 402 ms | 609 ms | 1,372,108 → 1,247,198 |

Both product pages' initial HTML-listed script payload decreased by **124,910 decoded bytes (9.1%)**. Optional story code still loads separately when mounted, so this is a loading-priority/code-splitting improvement, not a claim that a full visit downloads 9.1% less overall or that rendering is 9.1% faster. Homepage/shop payloads are essentially unchanged. Latencies varied; these few environment-specific samples do not establish that the code caused a global speed improvement. The live preload checks confirm that mobile no longer receives an unconditional desktop-artwork preload and the below-fold blog artwork no longer competes for preload priority.

## Backlink work

The researched opportunities, source links, fact sheet and complete ScentReviews submission draft are in [SEO-BACKLINK-BRIEF.md](SEO-BACKLINK-BRIEF.md). ScentReviews publishes a relevant ordinary/free perfume-house listing route. Basenotes publishes brand/product contribution guidance, with editorial review and account requirements. Neither constitutes an approved listing yet.

The owner explicitly approved sending the reviewed ScentReviews free-listing request. Its actual public contact form was inspected, and the one approved request was attempted through the same form service endpoint and fields. The public routing value was not printed or committed. No browser session, account credential, paid placement, review or additional message was used.

The submission returned HTML instead of the expected JSON confirmation, so acceptance/delivery is **unverified**, not successful. The original attempt record is `SEO-verification/scentreviews-submission.json`; no duplicate was sent. A subsequent read-only GET to the service returned HTTP 403 with a “Just a moment...” Cloudflare challenge. That probe identifies a current service barrier but does not retroactively establish the earlier POST's outcome. No challenge was bypassed. There is no approved/public listing or new verified backlink yet. Search sampling is not a full backlink-count baseline.

## Google reporting and Windsor.ai setup

The owner's explicitly invoked [Windsor.ai get-started skill](<C:/Users/SST/.codex/plugins/cache/openai-curated-remote/windsor-ai/4.2.4/skills/get-started/SKILL.md>) was followed. Windsor returned the existing GA4 connector `googleanalytics4`, selected property/account `512618134`, display name `by12-b3606`; this matches the previously verified BY12 property. Field discovery completed before report queries.

| Read | Selected fields | Returned result |
|---|---|---|
| Last seven complete days (`last_7d`) | Session source/medium, sessions, active users | Completed, empty data, 0 returned rows. |
| Wider recovery window (`last_28d`) | Same fields | Completed, empty data, 0 returned rows. |
| Recent event check including today (`last_1dT`) | Event name, event count | Completed, empty data, 0 returned rows. |

An empty completed pull is not a measured zero-traffic/zero-order result, a growth trend or a Realtime deduplication validation. No causes such as processing delay, caching or wrong configuration are asserted without evidence. The previously recorded Realtime QA receipt remains a separate observation.

Search Console was absent from Windsor's connected-account list both initially and after the owner asked to recheck. The actual connector catalog was consulted and its returned OAuth connection link and provider notes were given to the owner. Provider guidance requires the owner to authorize the Search Console permission, select the correct property and finish/save the selection. No authorization token or OAuth URL is copied into this repository. Connection must be rechecked after the owner finishes; it is not marked connected based on opening the link.

The existing Firebase service-account read-only Google API attempts also returned 403 PERMISSION_DENIED. No access grant, API secret or Google privacy setting was changed. The Windsor connector offers an appropriate path to owner-authorized reports without changing website credentials.

## Validation and release status

- All 50 tests passed, including actual hero markup and catalog backup/concurrency/rollback safeguards. Standalone TypeScript validation passed.
- The Vercel production build passed compilation and TypeScript validation. Source commit `28b1861` was promoted as `dpl_48FG3XnK1vunm4DMdog7dVN7TBhu`, `bilalyousaf12store-7x69fhje9-bilal-yousafs-projects.vercel.app`.
- All three editorial documents were published successfully at `2026-11-15T20:18:01.220Z` (16 November in Pakistan). IDs, publication state and original image/author/creation fields were not replaced; the narrow update payload changes copy fields and actual modification time only.
- All 44 live HTTP checks passed after one targeted assertion correction/recheck. The first run passed 43/44: the sample-guide title already contained BY12, but the test incorrectly demanded an extra BY12 suffix. The application output was correct. The assertion was fixed, and the recheck verified the title, single main heading, description and revised article section. The original failure and its reason remain in `SEO-verification/growth-review-live-smoke.json` under `rechecks`.
- The live checks also cover desktop-only hero preload media, deferred blog artwork, product descriptions/schema, all three reviewed article pages, canonical/sitemap/robots behavior, real 404s, size links, model bytes and anonymous upload rejection. No real order was submitted; a fresh browser interaction/visual pass remains unverified.
- Application rollback target before these changes: `dpl_46fArWuiSy4Q4zH9xiY3WhDz9agY`, `bilalyousaf12store-rk6cp2lm8-bilal-yousafs-projects.vercel.app`.
- Editorial preview: `node scripts/seo-catalog-patch.cjs --plan=editorial`. Apply the reviewed preview: append `--apply`. Revert only this editorial release, if its copy is still current: append `--rollback`. Original fields are in `SEO-verification/editorial-content-preview.json`. Application and CMS rollback are separate.
