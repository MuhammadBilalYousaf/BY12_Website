import type { CartItem, Product } from "@/lib/types"
import { defaultSelection } from "@/lib/product-pricing"

// Verified against the existing BY12 web stream in Google Analytics.
export const GA_MEASUREMENT_ID = "G-VQXGFCDSEL"
export const GA_HOST = "www.bilalyousaf12.store"
const DISABLE_KEY = "ga-disable-G-VQXGFCDSEL"
type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; [DISABLE_KEY]?: boolean }
type EcommerceEvent = "view_item" | "add_to_cart" | "remove_from_cart" | "view_cart" | "begin_checkout"
export type AnalyticsItem = { item_id: string; item_name: string; item_brand: string; item_category: string; item_variant?: string; price: number; quantity: number; discount?: number }
let configured = false
let navigationPath = ""
const viewedEvents = new Set<string>()
const sentOrders = new Set<string>()

// Never measure account/admin/order-lookup URLs or include query strings/fragments.
export function analyticsPath(input: string): string | null {
  const path = input.split(/[?#]/)[0]
  return /^(?:\/|\/(?:shop(?:\/(?:men|women|unisex))?|testers|about|contact|privacy|terms|refund|cart|checkout|guides|blog|deals)|\/(?:product|blog|deals|guides)\/[a-zA-Z0-9_-]+)$/.test(path) ? path : null
}

function analytics() {
  if (typeof window === "undefined") return null
  const target = window as AnalyticsWindow
  if (navigationPath !== window.location.pathname) {
    navigationPath = window.location.pathname
    viewedEvents.clear()
  }
  const path = analyticsPath(window.location.pathname)
  const enabled = window.location.hostname === GA_HOST && !!path
  target[DISABLE_KEY] = !enabled
  if (!enabled) return null
  target.dataLayer ||= []
  target.gtag ||= function () { target.dataLayer!.push(arguments) }
  if (!configured) {
    target.gtag("js", new Date())
    target.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: `https://${GA_HOST}${path}`,
      page_referrer: safeReferrer(document.referrer),
    })
    configured = true
  }
  target.gtag("set", { page_location: `https://${GA_HOST}${path}` })
  return target.gtag
}

function safeReferrer(value: string) {
  try { const url = new URL(value); return /^https?:$/.test(url.protocol) ? url.origin : "" } catch { return "" }
}

export function syncAnalyticsPage() {
  try {
    const gtag = analytics()
    if (!gtag) return false
    if (viewedEvents.has("page_view")) return true
    gtag("event", "page_view", { send_to: GA_MEASUREMENT_ID, page_location: `https://${GA_HOST}${analyticsPath(window.location.pathname)}`, page_title: document.title })
    viewedEvents.add("page_view")
    return true
  } catch { return false }
}

export function analyticsItem(product: Product, quantity = 1, size?: number, price?: number): AnalyticsItem | null {
  const selected = defaultSelection(product, size)
  const amount = price ?? selected.price
  const volume = size ?? selected.size
  if (!product.id || !Number.isInteger(quantity) || quantity < 1 || !Number.isFinite(amount) || amount < 0 || !Number.isSafeInteger(Math.round(amount * 100) * quantity)) return null
  return { item_id: product.id, item_name: product.name, item_brand: product.brand || "BY12", item_category: product.category, ...(volume ? { item_variant: `${volume}ml` } : {}), price: Math.round(amount * 100) / 100, quantity }
}

export function ecommercePayload(cart: Pick<CartItem, "product" | "quantity" | "selectedSize" | "selectedPrice">[], discount = 0) {
  const items = cart.map(item => analyticsItem(item.product, item.quantity, item.selectedSize, item.selectedPrice)).filter((item): item is AnalyticsItem => !!item)
  const subtotal = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0)
  const valueCents = Math.max(0, subtotal - Math.min(subtotal, Math.max(0, Number.isFinite(discount) ? Math.round(discount * 100) : 0)))
  const allocations = items.map(item => subtotal ? Math.round(item.price * 100) * item.quantity * valueCents / subtotal : 0)
  const cents = allocations.map(Math.floor)
  const remaining = valueCents - cents.reduce((sum, amount) => sum + amount, 0)
  allocations.map((amount, index) => ({ index, remainder: amount - cents[index] })).sort((a, b) => b.remainder - a.remainder).slice(0, remaining).forEach(({ index }) => cents[index]++)
  const discounted = items.flatMap((item, index) => {
    const net = cents[index]
    const low = Math.floor(net / item.quantity)
    const remainder = net % item.quantity
    // Split rounding pennies so item totals exactly match discounted order value.
    const row = (quantity: number, cents: number) => ({ ...item, quantity, price: cents / 100, ...(discount > 0 ? { discount: Math.max(0, Math.round(item.price * 100) - cents) / 100 } : {}) })
    return [...(item.quantity > remainder ? [row(item.quantity - remainder, low)] : []), ...(remainder ? [row(remainder, low + 1)] : [])]
  })
  return { currency: "PKR", value: valueCents / 100, items: discounted }
}

export function recordEcommerce(event: EcommerceEvent, cart: Parameters<typeof ecommercePayload>[0], discount = 0) {
  try {
    const payload = ecommercePayload(cart, discount)
    if (!payload.items.length) return false
    const gtag = analytics()
    if (!gtag) return false
    const path = window.location.pathname
    // The animated page wrapper can briefly remount the previous page's children.
    if (event === "view_cart" && path !== "/cart") return false
    if (event === "begin_checkout" && path !== "/checkout") return false
    if (event === "view_item" && payload.items.some(item => path !== `/product/${item.item_id}`)) return false
    const isView = event === "view_item" || event === "view_cart" || event === "begin_checkout"
    const key = event === "view_item" ? `${event}:${JSON.stringify(payload.items)}` : event
    if (isView && viewedEvents.has(key)) return true
    gtag("event", event, { send_to: GA_MEASUREMENT_ID, ...payload })
    if (isView) viewedEvents.add(key)
    return true
  } catch { return false }
}

// Called with createOrder's result; failed orders and confirmation-page reloads cannot create revenue.
export function recordOrderResult(result: { success: boolean; orderId?: string }, cart: Parameters<typeof ecommercePayload>[0], totals: { discount: number; shipping: number; tax: number }) {
  try {
    const id = result.success && result.orderId
    if (!id || sentOrders.has(id)) return false
    if (![totals.shipping, totals.tax].every(value => Number.isFinite(value) && value >= 0)) return false
    let previous: string[] = []
    try { const saved = JSON.parse(sessionStorage.getItem("by12_ga_orders") || "[]"); if (Array.isArray(saved)) previous = saved.filter(value => typeof value === "string") } catch {}
    if (previous.includes(id)) return false
    const payload = ecommercePayload(cart, totals.discount)
    if (!payload.items.length) return false
    const gtag = analytics()
    if (!gtag) return false
    gtag("event", "purchase", { send_to: GA_MEASUREMENT_ID, ...payload, transaction_id: id, shipping: totals.shipping, tax: totals.tax })
    sentOrders.add(id)
    try { sessionStorage.setItem("by12_ga_orders", JSON.stringify([...previous, id].slice(-50))) } catch {}
    return true
  } catch { return false }
}
