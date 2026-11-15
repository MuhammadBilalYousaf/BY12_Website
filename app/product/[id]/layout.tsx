import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProduct } from "@/lib/catalog"
import { pageMetadata, plainText } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()
  return pageMetadata({
    title: product.metaTitle || product.name,
    description: plainText(product.metaDescription || product.description) || `Explore ${product.name} by BY12. Compare sizes, prices and availability. Cash on Delivery across Pakistan.`,
    path: `/product/${id}`,
    image: product.imageUrl,
  })
}

export default async function ProductLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await getProduct(id)) notFound()
  return children
}
