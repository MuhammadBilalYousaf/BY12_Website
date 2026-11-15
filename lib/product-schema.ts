import type { Product } from "@/lib/types"
import { absoluteUrl, plainText } from "@/lib/seo"
import { variantPrice } from "@/lib/product-pricing"

export function productStructuredData(product: Product, rating = product.rating, reviewCount = product.reviews) {
  const url = absoluteUrl(`/product/${product.id}`)
  const common = {
    name: product.name,
    description: plainText(product.description || product.name).slice(0, 500),
    image: absoluteUrl(product.imageUrl || product.images?.[0] || "/logo.png"),
    brand: { "@type": "Brand", name: product.brand || "BY12" },
    category: product.category,
    ...(rating && reviewCount && rating >= 1 && rating <= 5 && reviewCount > 0 ? {
      aggregateRating: { "@type": "AggregateRating", ratingValue: rating, reviewCount, bestRating: 5, worstRating: 1 },
    } : {}),
  }
  function offer(price: number, stock: boolean, offerUrl: string) {
    return { "@type": "Offer", price, priceCurrency: "PKR", availability: stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: offerUrl, seller: { "@type": "Organization", "@id": absoluteUrl("/#organization"), name: "BY12 Perfumes" } }
  }
  const variants = product.isTester ? [] : product.sizeVariants || []
  if (variants.length > 1) {
    return {
      "@context": "https://schema.org", "@type": "ProductGroup", "@id": url + "#product-group", url,
      ...common, productGroupID: product.id, variesBy: "https://schema.org/size",
      hasVariant: variants.map(variant => {
        const variantUrl = `${url}?size=${variant.size}`
        const image = (variant.onSale && variant.saleImageUrl) || variant.images?.[0] || product.imageUrl || product.images?.[0] || "/logo.png"
        return { "@type": "Product", ...common, "@id": variantUrl + "#product", url: variantUrl, name: `${product.name} — ${variant.size}ml`, size: `${variant.size} ml`, sku: `${product.id}-${variant.size}ml`, image: absoluteUrl(image), inProductGroupWithID: product.id, offers: offer(variantPrice(variant), variant.stock > 0, variantUrl) }
      }),
    }
  }
  const variant = variants[0]
  const size = product.isTester ? product.testerSize || product.size : variant?.size || product.size
  const available = product.isTester ? (product.testerQuantity || 0) > 0 : variant ? variant.stock > 0 : product.inStock ?? (product.stock || 0) > 0
  return { "@context": "https://schema.org", "@type": "Product", "@id": url + "#product", url, ...common, sku: product.id, ...(size ? { size: `${size} ml` } : {}), offers: offer(variant ? variantPrice(variant) : product.price, available, url) }
}
