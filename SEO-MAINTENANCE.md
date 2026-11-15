# BY12 SEO maintenance — 16 November 2026

The organization JSON-LD now references the existing public `/refund` page with `hasMerchantReturnPolicy` / `merchantReturnLink`. This follows Google's organization-level [return-policy option B](https://developers.google.com/search/docs/appearance/structured-data/return-policy). Linking the full policy preserves its eligibility conditions, exclusions and return-shipping exceptions. No shipping price, unconditional refund, free return or delivery-time claim was added to product offers.

Organization and WebSite descriptions now use the site's established inspired-perfume positioning instead of the older authentic-luxury wording. The changes affect structured data only: page design, public policy text, prices, stock, cart and checkout behavior are unchanged.

The public HTTP regression suite additionally verifies the return-policy page's SEO output and parses the organization's actual rendered JSON-LD, including the preferred-host policy link and entity ID.

## Validation and release

- Existing 40 SEO, Analytics, model and authentication tests passed.
- Standalone TypeScript validation passed. The Vercel production build also passed compilation and TypeScript validation.
- Released source commit: `30a88e9`. Promoted production deployment: `dpl_6CYfCbvHzzGbqsX2JBuJ8NyQthUV`, `bilalyousaf12store-k5fkc9bbs-bilal-yousafs-projects.vercel.app`.
- All 33 public HTTP regression checks passed after promotion. Evidence: `SEO-verification/maintenance-live-smoke.json`, including the new policy-page and organization JSON-LD checks.
- Google PageSpeed mobile and desktop diagnostics were requested, but both returned HTTP 429 (daily API quota exceeded). No performance score or Core Web Vitals pass is claimed. Responses are saved in `SEO-verification/pagespeed-mobile.json` and `pagespeed-desktop.json`.
- Current production rollback target before this change: `dpl_DceKmfsRXHkJdjBmGDqB17KtUJcJ`, `bilalyousaf12store-co1fswjy6-bilal-yousafs-projects.vercel.app`.

## Work that remains

The Men/Women manual indexing confirmations and post-fix GA4 Realtime count comparison remain unverified because native browser control repeatedly failed. Both collections are crawlable and in the submitted sitemap. Account setup and previously confirmed results are documented in [SEO-GOOGLE-SETUP.md](SEO-GOOGLE-SETUP.md).

Ongoing work includes mobile performance diagnostics, editorial review of the winter article, more first-hand product information, a backlink baseline and relevant earned coverage. No outreach or backlink purchases were performed. Google indexing and ranking outcomes remain dependent on subsequent processing and measured results; these changes do not establish a top-ranking result.
