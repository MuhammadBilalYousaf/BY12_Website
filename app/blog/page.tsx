import { getPublishedBlogs } from "@/lib/catalog"
import BlogListClient from "@/components/blog-list-client"
export const dynamic = "force-dynamic"
export default async function BlogPage() {
  return <BlogListClient initialPosts={await getPublishedBlogs()} />
}
