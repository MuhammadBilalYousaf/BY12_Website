# BY12 SEO maintenance — 16 November 2026

The organization JSON-LD now references the existing public `/refund` page with `hasMerchantReturnPolicy` / `merchantReturnLink`. This follows Google's organization-level [return-policy option B](https://developers.google.com/search/docs/appearance/structured-data/return-policy). Linking the full policy preserves its eligibility conditions, exclusions and return-shipping exceptions. No shipping price, unconditional refund, free return or delivery-time claim was added to product offers.

Organization and WebSite descriptions now use the site's established inspired-perfume positioning instead of the older authentic-luxury wording. The changes affect structured data only: page design, public policy text, prices, stock, cart and checkout behavior are unchanged.

The public HTTP regression suite additionally verifies the return-policy page's SEO output and parses the organization's actual rendered JSON-LD, including the preferred-host policy link and entity ID.

## Validation and release

- Existing 40 SEO, Analytics, model and authentication tests passed.
- Standalone TypeScript validation and production deployment verification are in progress.
- Current production rollback target before this change: `dpl_DceKmfsRXHkJdjBmGDqB17KtUJcJ`, `bilalyousaf12store-co1fswjy6-bilal-yousafs-projects.vercel.app`.

## Work that remains

The Men/Women manual indexing confirmations and post-fix GA4 Realtime count comparison remain unverified because native browser control repeatedly failed. Both collections are crawlable and in the submitted sitemap. Account setup and previously confirmed results are documented in [SEO-GOOGLE-SETUP.md](SEO-GOOGLE-SETUP.md).

Ongoing work includes mobile performance diagnostics, editorial review of the winter article, more first-hand product information, a backlink baseline and relevant earned coverage. No outreach or backlink purchases were performed. Google indexing and ranking outcomes remain dependent on subsequent processing and measured results; these changes do not establish a top-ranking result.
