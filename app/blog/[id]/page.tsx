import { notFound } from "next/navigation"
import { getPublishedBlog, getProducts } from "@/lib/catalog"
import BlogPageClient from "@/components/blog-page-client"

export const dynamic = "force-dynamic"

export default async function BlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPublishedBlog(id)
  if (!post) notFound()
  const products = (await getProducts()).filter(product => !product.isTester).slice(0, 4)
  return <BlogPageClient key={post.id} initialPost={post} recommendedProducts={products.map(({ id, name }) => ({ id, name }))} />
}
