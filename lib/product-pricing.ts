import type { Product, SizeVariant } from "@/lib/types"

export function calculateSalePrice(price: number, saleType?: "percent" | "amount", saleValue?: number) {
  if (!saleType || !saleValue) return price
  return Math.max(0, saleType === "percent" ? Math.round(price * (1 - saleValue / 100)) : price - saleValue)
}

export function variantPrice(variant: SizeVariant) {
  return variant.onSale ? calculateSalePrice(variant.price, variant.saleType, variant.saleValue) : variant.price
}

export function defaultSelection(product: Product, requestedSize?: number) {
  if (product.isTester) return { size: product.testerSize || product.size || 5, price: product.price }
  const variants = product.sizeVariants || []
  const variant = variants.find(item => item.size === requestedSize) || variants.find(item => item.stock > 0) || variants[0]
  return variant ? { size: variant.size, price: variantPrice(variant) } : { size: product.size, price: product.price }
}
