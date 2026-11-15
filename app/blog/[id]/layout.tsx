import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPublishedBlog } from "@/lib/catalog"
import { pageMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const post = await getPublishedBlog(id)
  if (!post) notFound()
  return pageMetadata({ title: post.title, description: post.excerpt || post.content, path: `/blog/${id}`, image: post.imageUrl, type: "article" })
}

export default async function BlogLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await getPublishedBlog(id)) notFound()
  return children
}
