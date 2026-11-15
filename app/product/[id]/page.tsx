import ProductPageClient from "@/components/product-page-client"
import { getProduct, getProducts } from "@/lib/catalog"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function ProductPage({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ size?: string }>
}) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const product = await getProduct(id)
  if (!product) notFound()
  const relatedProducts = (await getProducts()).filter(item => item.id !== product.id && item.category === product.category).slice(0, 4)
  const size = Number(query.size) || undefined
  return <ProductPageClient key={product.id + ":" + (size || "")} initialProduct={product} initialSize={size} initialRelatedProducts={relatedProducts} />
}
