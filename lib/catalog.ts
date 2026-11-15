import "server-only"
import { cache } from "react"
import { adminDb } from "@/lib/firebase-admin"
import type { Product, BlogPost, Deal } from "@/lib/types"
import { isoDate } from "@/lib/seo"

// Only public catalog fields cross the server/client boundary. No account or order data.
const productFields = ["name", "brand", "category", "price", "originalPrice", "onSale", "salePrice", "salePercentage", "size", "sizeVariants", "description", "imageUrl", "images", "modelUrl", "modelSize", "rating", "reviews", "stock", "inStock", "featured", "status", "isTester", "testerQuantity", "testerSize", "metaTitle", "metaDescription", "ogTitle", "ogDescription", "keywords", "altText", "fragranceLine", "fragranceNotes", "fragranceIngredients", "createdAt", "updatedAt"]
const blogFields = ["title", "excerpt", "content", "author", "authorBio", "authorImage", "readTime", "category", "imageUrl", "featured", "tags", "status", "createdAt", "updatedAt", "publishedAt", "metaTitle", "metaDescription"]
const dealFields = ["title", "description", "includedItems", "imageUrl", "images", "originalPrice", "dealPrice", "badge", "productId", "endDate", "isActive", "featured", "metaTitle", "metaDescription", "keywords", "altText", "createdAt", "updatedAt"]

function db() {
  if (!adminDb) throw new Error("Server catalog is unavailable. Check Firebase Admin configuration.")
  return adminDb
}

function serializable(value: any): any {
  if (value === undefined) return undefined
  if (value === null || typeof value !== "object") return value
  if (value.toDate || value instanceof Date) return isoDate(value)
  if (Array.isArray(value)) return value.map(serializable)
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined).map(([k, v]) => [k, serializable(v)]))
}

function publicRecord<T>(id: string, data: Record<string, any>, fields: string[]): T {
  return { ...Object.fromEntries(fields.filter(key => data[key] !== undefined).map(key => [key, serializable(data[key])])), id } as T
}

function normalizeProduct(id: string, data: Record<string, any>): Product {
  const product = publicRecord<Product>(id, data, productFields)
  product.inStock = product.isTester ? (product.testerQuantity || 0) > 0 : product.sizeVariants?.length
    ? product.sizeVariants.some(variant => variant.stock > 0) : product.inStock ?? (product.stock || 0) > 0
  return product
}

// React cache deduplicates reads within a request only. Prices/stock are never held in a cross-request cache.
export const getProducts = cache(async (): Promise<Product[]> => {
  const snapshot = await db().collection("products").select(...productFields).get()
  return snapshot.docs.map(doc => normalizeProduct(doc.id, doc.data())).sort(newestFirst)
})

export const getProduct = cache(async (id: string): Promise<Product | null> => {
  const doc = await db().collection("products").doc(id).get()
  return doc.exists ? normalizeProduct(doc.id, doc.data()!) : null
})

export const getPublishedBlogs = cache(async (): Promise<BlogPost[]> => {
  const snapshot = await db().collection("blogs").where("status", "==", "published").select(...blogFields).get()
  return snapshot.docs.map(doc => publicRecord<BlogPost>(doc.id, doc.data(), blogFields)).sort(newestFirst)
})

export const getPublishedBlog = cache(async (id: string): Promise<BlogPost | null> => {
  const doc = await db().collection("blogs").doc(id).get()
  if (!doc.exists || doc.data()?.status !== "published") return null
  return publicRecord<BlogPost>(doc.id, doc.data()!, blogFields)
})

export function isActiveDeal(deal: Deal) {
  return deal.isActive && (!deal.endDate || new Date(isoDate(deal.endDate) || 0).getTime() >= Date.now())
}

export const getActiveDeals = cache(async (): Promise<Deal[]> => {
  const snapshot = await db().collection("deals").where("isActive", "==", true).select(...dealFields).get()
  return snapshot.docs.map(doc => publicRecord<Deal>(doc.id, doc.data(), dealFields)).filter(isActiveDeal).sort(newestFirst)
})

function newestFirst(a: { createdAt?: any }, b: { createdAt?: any }) {
  return new Date(isoDate(b.createdAt) || 0).getTime() - new Date(isoDate(a.createdAt) || 0).getTime()
}
