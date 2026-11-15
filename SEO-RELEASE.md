# BY12 SEO production release — 15 November 2026

Historical phase-1/2 release record. The Google-account limitations below were subsequently superseded by the verified results in [SEO-GOOGLE-SETUP.md](SEO-GOOGLE-SETUP.md). Later maintenance is tracked in [SEO-MAINTENANCE.md](SEO-MAINTENANCE.md).

The phase-1 technical SEO and phase-2 buying-content changes were deployed to `https://www.bilalyousaf12.store` through the existing Vercel project. This release supersedes the earlier reports' local-only status.

## Release record

- Project: `bilalyousaf12.store`, `prj_6P925TdD9LpSK6DOyRNy54SF82l1`.
- Production build promoted: `dpl_DhKUURNLDpBxo3S7THyqF7zgz3Jg` (`bilalyousaf12store-7hv667eqk-bilal-yousafs-projects.vercel.app`).
- Previous production / rollback target: `dpl_9AsgybNVNbGyJwJ9TaNbphxvV1bF` (`bilalyousaf12store-bd4fgor0t-bilal-yousafs-projects.vercel.app`).
- The release preserves remote commits `ce5571d` and `2a753da`, including per-size model URLs and the upload fallback. The model resolver combines those changes with the narrowly scoped legacy Coffeeno recovery URL.
- The build command is explicitly `next build --webpack`, matching the compiler used in local verification. The Vercel production build passed compilation and TypeScript validation.
- `.vercelignore` excludes local environment files, editor configuration and local verification artifacts. Existing hosted credentials were used; none was replaced or printed.

## Changes made during release preparation

- The existing apex-to-www Vercel redirect now explicitly uses HTTP 308. Direct live verification returned `308` with `Location: https://www.bilalyousaf12.store/shop` for the apex `/shop` URL.
- The model-upload fallback requires a verified Firebase ID token and a matching `admins/{uid}` record with `role: admin`. The admin upload UI supplies its existing sign-in token. Anonymous requests return 401 before any file is read or forwarded.
- Payment and credential fields are excluded from legacy form-interaction tracking before any Firestore query/write. No Firestore security rule was relaxed.
- Whitespace inherited when moving the large client components was cleaned up.

## Verification

- 29 targeted tests passed: the SEO unit suite, per-size model tests and upload authentication tests.
- The production build passed on Vercel.
- Staged deployment URLs remained protected by Vercel authentication. Anonymous staging requests received login redirects, so that run did not exercise application responses. No protection was disabled and no new bypass credential was created.
- After promotion, the initial public HTTP run passed 30 of 31 checks. Its redirect check ran while the hosting setting was still propagating; a subsequent direct live request confirmed the intended 308 redirect.
- The final public HTTP verification is saved separately as `SEO-verification/live-smoke-results.json`. It checks raw HTML/metadata, canonical/schema output, category/deal aliases, actual missing-page 404s, sitemap/robots, direct size selection, guide links, the social image, hosted GLB bytes and anonymous upload rejection.
- No real customer order, email submission or model upload was performed. Interactive cart verification was completed locally in phase 2; an interactive production shopping test is not claimed here.

## Google account work still required

The source contains measurement ID `G-VQXGFCDSEL`, but no active Google Analytics initialization or ecommerce integration was found. A configured ID alone does not establish working reporting.

Read-only Search Console and Analytics Admin API checks using the project's existing service account both returned `403 PERMISSION_DENIED`. This does not establish whether the owner's personal Google account already has a verified Search Console property or GA4 stream. No account access, API enablement, property ownership or credential grant was changed.

Native browser automation also ended because the computer-use tool could not verify the current browser URL confidently. It was not retried through another UI mechanism. Account ownership, sitemap submission, Google-selected canonical/indexing status, stream settings, GA4 Realtime/DebugView and actual ecommerce event collection therefore remain unverified.

To continue, open the existing owner accounts in [Search Console](https://search.google.com/search-console) and [Google Analytics](https://analytics.google.com). For the correct verified BY12 property, submit `https://www.bilalyousaf12.store/sitemap.xml`, then inspect the homepage, Men/Women collections, both full-bottle products and the two guides. Verify the GA4 web stream before implementing ecommerce collection; its enhanced-measurement history setting must be checked to prevent duplicate manual pageviews.

The live robots policy advertises the sitemap. Sitemap availability is verified; Google submission, indexing and rankings are separate outcomes.

## Rollback

If a production regression is confirmed, restore the saved previous production deployment through the existing Vercel project:

```powershell
vercel rollback https://bilalyousaf12store-bd4fgor0t-bilal-yousafs-projects.vercel.app --yes
```

The preferred-domain 308 is a separate project-domain setting; the previous setting used the same www destination with a default temporary status.
