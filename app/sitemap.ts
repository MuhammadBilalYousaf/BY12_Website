import type { MetadataRoute } from "next"
import { getProducts, getPublishedBlogs, getActiveDeals } from "@/lib/catalog"
import { absoluteUrl, categoryPath, dealPath, isoDate, CATEGORIES } from "@/lib/seo"
import { GUIDES } from "@/lib/buying-guide"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Backend failures must not silently publish an incomplete sitemap.
  const [products, blogs, deals] = await Promise.all([getProducts(), getPublishedBlogs(), getActiveDeals()])
  const staticPaths = ["/", "/shop", "/blog", "/guides", ...GUIDES.map(guide => `/guides/${guide.slug}`), "/deals", "/testers", "/about", "/contact", "/privacy", "/terms", "/refund"]
  const dated = (url: string, value: any) => {
    const modified = isoDate(value)
    return { url: absoluteUrl(url), ...(modified ? { lastModified: modified } : {}) }
  }
  const entries: MetadataRoute.Sitemap = [
    ...staticPaths.map(url => ({ url: absoluteUrl(url) })),
    ...CATEGORIES.filter(category => products.some(product => !product.isTester && product.category === category)).map(category => ({ url: absoluteUrl(categoryPath(category)) })),
    ...products.map(product => dated("/product/" + product.id, product.updatedAt || product.createdAt)),
    ...blogs.map(blog => dated("/blog/" + blog.id, blog.updatedAt || blog.createdAt)),
    ...deals.map(deal => dated(dealPath(deal), deal.updatedAt || deal.createdAt)),
  ]
  return [...new Map(entries.map(entry => [entry.url, entry])).values()]
}
