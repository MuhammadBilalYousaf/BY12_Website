import type { Product } from "@/lib/types"
import { variantPrice } from "@/lib/product-pricing"

export const GUIDES = [
  {
    slug: "30ml-vs-50ml-perfume",
    title: "30ml vs 50ml Perfume: Compare BY12 Sizes and Prices",
    description: "Compare BY12 bottle sizes using current prices, price per ml and availability. Choose a 30ml or 50ml fragrance for your budget and routine.",
  },
  {
    slug: "inspired-perfumes-pakistan",
    title: "Inspired Perfumes in Pakistan: A Guide to Choosing BY12",
    description: "Understand what inspired means at BY12, how to read a product page and how to choose a size or available sample before ordering in Pakistan.",
  },
] as const

export function bottleOptions(product: Product) {
  if (product.isTester) {
    const size = product.testerSize || product.size
    return size && size > 0 ? [{ size, price: product.price, perMl: product.price / size, available: (product.testerQuantity || 0) > 0 }] : []
  }
  if (product.sizeVariants?.length) {
    return product.sizeVariants.filter(variant => Number.isFinite(variant.size) && variant.size > 0 && Number.isFinite(variant.price) && variant.price >= 0)
      .map(variant => { const price = variantPrice(variant); return { size: variant.size, price, perMl: price / variant.size, available: variant.stock > 0 } })
      .sort((a, b) => a.size - b.size)
  }
  return product.size && product.size > 0 ? [{ size: product.size, price: product.price, perMl: product.price / product.size, available: product.inStock ?? (product.stock || 0) > 0 }] : []
}

function fragranceName(name: string) {
  return name.split(/\s[-–—]\s/)[0].trim().toLowerCase()
}

export function matchingTesters(product: Product, products: Product[]) {
  if (product.isTester) return []
  return products.filter(item => item.isTester && fragranceName(item.name) === fragranceName(product.name))
}

export function listedNotes(product: Pick<Product, "fragranceNotes">) {
  const clean = (values?: string[]) => [...new Set((values || []).filter(value => typeof value === "string").map(value => value.trim()).filter(Boolean))]
  return { top: clean(product.fragranceNotes?.top), middle: clean(product.fragranceNotes?.middle), base: clean(product.fragranceNotes?.base) }
}

export function money(value: number) {
  return `Rs. ${value.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
