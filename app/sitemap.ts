import { MetadataRoute } from "next"
import { adminDb } from "@/lib/firebase-admin"

const BASE_URL = "https://bilalyousaf12.store"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/deals`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/track-order`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/refund`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ]

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = []
  try {
    if (adminDb) {
      const productsSnapshot = await adminDb
        .collection("products")
        .where("inStock", "==", true)
        .get()

      productPages = productsSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          url: `${BASE_URL}/product/${doc.id}`,
          lastModified: data.updatedAt?.toDate?.()?.toISOString() || currentDate,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }
      })
    }
  } catch (error) {
    console.error("Error fetching products for sitemap:", error)
  }

  // Dynamic blog pages
  let blogPages: MetadataRoute.Sitemap = []
  try {
    if (adminDb) {
      const blogsSnapshot = await adminDb
        .collection("blogs")
        .where("isPublished", "==", true)
        .get()

      blogPages = blogsSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          url: `${BASE_URL}/blog/${doc.id}`,
          lastModified: data.updatedAt?.toDate?.()?.toISOString() || 
                       data.publishedAt?.toDate?.()?.toISOString() || 
                       currentDate,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }
      })
    }
  } catch (error) {
    console.error("Error fetching blogs for sitemap:", error)
  }

  return [...staticPages, ...productPages, ...blogPages]
}
