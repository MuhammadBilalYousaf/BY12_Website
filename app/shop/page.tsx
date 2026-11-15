import type { Metadata } from "next"
import { permanentRedirect } from "next/navigation"
import { getProducts } from "@/lib/catalog"
import ShopPageClient from "@/components/shop-page-client"
import { CATEGORIES, categoryPath, pageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"
type Query = { category?: string; search?: string }

export async function generateMetadata({ searchParams }: { searchParams: Promise<Query> }): Promise<Metadata> {
  const query = await searchParams
  return pageMetadata({ title: "Buy Perfumes Online in Pakistan | BY12", description: "Shop BY12 inspired perfumes for men and women. Compare Coffeeno and Ravla, current prices and bottle sizes. Cash on Delivery across Pakistan.", path: "/shop", noindex: Boolean(query.search) })
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams
  const category = CATEGORIES.find(item => item.toLowerCase() === query.category?.toLowerCase())
  if (category) permanentRedirect(categoryPath(category))
  return <ShopPageClient initialProducts={await getProducts()} initialSearch={query.search || ""} />
}
