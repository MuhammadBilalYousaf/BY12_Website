import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProducts } from "@/lib/catalog"
import ShopPageClient from "@/components/shop-page-client"
import { CATEGORIES, categoryPath, pageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

async function collection(slug: string) {
  const category = CATEGORIES.find(item => item.toLowerCase() === slug)
  if (!category) notFound()
  const products = await getProducts()
  return { category, products, hasProducts: products.some(product => !product.isTester && product.category === category) }
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category, hasProducts } = await collection((await params).category)
  return pageMetadata({ title: `Perfumes for ${category} in Pakistan | BY12`, description: `Explore BY12 inspired perfumes for ${category.toLowerCase()}. Compare scent profiles, sizes and current prices, with delivery across Pakistan.`, path: categoryPath(category), noindex: !hasProducts })
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category, products } = await collection((await params).category)
  return <ShopPageClient key={category} initialProducts={products} initialCategory={category} />
}
