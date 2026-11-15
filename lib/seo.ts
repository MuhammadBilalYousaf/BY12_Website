import type { Metadata } from "next"
import type { Deal } from "@/lib/types"
import { toSlug } from "@/lib/utils"

export const SITE_URL = "https://www.bilalyousaf12.store"
export const SITE_NAME = "BY12 Perfumes"
export const CATEGORIES = ["Men", "Women", "Unisex"] as const

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).href
}

export function plainText(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim()
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c")
}

export function isoDate(value: any): string | undefined {
  if (!value) return undefined
  const date = value.toDate ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

export function categoryPath(category: string) {
  return CATEGORIES.some(item => item === category) ? `/shop/${category.toLowerCase()}` : "/shop"
}

export function dealPath(deal: Pick<Deal, "id" | "title">) {
  return `/deals/${toSlug(deal.title) || deal.id}`
}

export function pageMetadata({ title, description, path, image, type = "website", noindex = false }: {
  title: string; description: string; path: string; image?: string; type?: "website" | "article"; noindex?: boolean
}): Metadata {
  const fullTitle = /\bBY12\b/i.test(title) ? title : `${title} | ${SITE_NAME}`
  const images = [{ url: absoluteUrl(image || "/opengraph-image"), alt: title }]
  return {
    title: { absolute: fullTitle },
    description: plainText(description).slice(0, 170),
    alternates: { canonical: absoluteUrl(path) },
    ...(noindex ? { robots: { index: false, follow: true, googleBot: { index: false, follow: true } } } : {}),
    openGraph: { title: fullTitle, description: plainText(description).slice(0, 170), type, url: absoluteUrl(path), siteName: SITE_NAME, images },
    twitter: { card: "summary_large_image", title: fullTitle, description: plainText(description).slice(0, 170), images: images.map(item => item.url) },
  }
}
