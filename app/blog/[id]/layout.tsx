import type { Metadata } from "next"
import { adminDb } from "@/lib/firebase-admin"

interface BlogLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  
  // Default metadata
  let metadata: Metadata = {
    title: "Blog Post",
    description: "Read this article from BY12 Perfumes blog.",
  }

  try {
    if (adminDb) {
      const blogDoc = await adminDb.collection("blogs").doc(id).get()
      
      if (blogDoc.exists) {
        const blog = blogDoc.data()
        
        if (blog) {
          const title = `${blog.title} | BY12 Blog`
          const description = blog.excerpt || 
            blog.content?.replace(/<[^>]*>/g, "").substring(0, 160) || 
            `Read "${blog.title}" on BY12 Perfumes blog.`
          
          metadata = {
            title,
            description,
            keywords: [
              "perfume blog",
              blog.category || "fragrance",
              ...(blog.tags || []),
              "BY12",
            ].join(", "),
            alternates: {
              canonical: `https://bilalyousaf12.store/blog/${id}`,
            },
            authors: blog.author ? [{ name: blog.author }] : undefined,
            openGraph: {
              title,
              description,
              type: "article",
              url: `https://bilalyousaf12.store/blog/${id}`,
              publishedTime: blog.createdAt?.toDate?.()?.toISOString(),
              modifiedTime: blog.updatedAt?.toDate?.()?.toISOString(),
              authors: blog.author ? [blog.author] : undefined,
              images: blog.imageUrl ? [
                {
                  url: blog.imageUrl,
                  width: 1200,
                  height: 630,
                  alt: blog.title,
                }
              ] : ["/logo.png"],
            },
            twitter: {
              card: "summary_large_image",
              title,
              description,
              images: blog.imageUrl ? [blog.imageUrl] : ["/logo.png"],
            },
          }
        }
      }
    }
  } catch (error) {
    console.error("Error generating blog metadata:", error)
  }

  return metadata
}

export default function BlogPostLayout({ children }: BlogLayoutProps) {
  return children
}
