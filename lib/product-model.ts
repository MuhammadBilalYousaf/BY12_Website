type ModelVariant = { size: number; modelUrl?: string }
type ModelProduct = { id?: string; modelUrl?: string; modelSize?: number; sizeVariants?: ModelVariant[] }

/** Accept direct HTTPS links and same-site paths; HTTP is only for local previews. */
export function isProductModelUrl(value: string) {
  const link = value.trim()
  if (!link || /[\u0000-\u0020]/.test(link)) return false
  if (link.startsWith("/") && !link.startsWith("//")) return true
  try {
    const url = new URL(link)
    if (url.username || url.password) return false
    return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
  } catch { return false }
}

function cleanModelUrl(value: unknown) {
  return typeof value === "string" && isProductModelUrl(value) ? value.trim() : ""
}

export function resolveProductModel(product: ModelProduct, selectedSize?: number): { url: string; size?: number; fallbackUrl?: string } | null {
  const variants = Array.isArray(product.sizeVariants) ? product.sizeVariants : []
  const variantMatch = selectedSize
    ? variants.find((variant) => variant.size === selectedSize && cleanModelUrl(variant.modelUrl))
    : variants.find((variant) => cleanModelUrl(variant.modelUrl))
  const variantUrl = cleanModelUrl(variantMatch?.modelUrl)
  if (variantUrl) return { url: variantUrl, size: variantMatch?.size }

  const url = cleanModelUrl(product.modelUrl)
  if (!url || (product.modelSize && selectedSize && product.modelSize !== selectedSize)) return null
  const fallbackUrl = product.id === "coffeeno_impression_of_khamrah_qahwa" && selectedSize === 50 && url.startsWith("https://files.catbox.moe/")
    ? "/models/coffeeno-50ml.glb" : undefined
  return { url, size: product.modelSize, fallbackUrl }
}
