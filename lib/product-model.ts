type ModelProduct = { id?: string; modelUrl?: string; modelSize?: number }

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

export function resolveProductModel(product: ModelProduct, selectedSize?: number) {
  const url = typeof product.modelUrl === "string" ? product.modelUrl.trim() : ""
  if (!isProductModelUrl(url) || (product.modelSize && selectedSize && product.modelSize !== selectedSize)) return null
  return { url, size: product.modelSize }
}
