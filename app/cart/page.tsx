"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useCart, useAuth } from "@/lib/contexts"
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag, Loader2 } from "lucide-react"
import Toast from "@/components/toast"
import { useCoupons } from "@/lib/hooks/use-coupons"
import { FadeInSection } from "@/components/animated-section"
import { toSlug } from "@/lib/utils"

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total, itemCount, discount, appliedCoupon, applyDiscount, removeDiscount } = useCart()
  const { user } = useAuth()
  const { validateCoupon } = useCoupons()
  const router = useRouter()
  
  const [couponCode, setCouponCode] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error">("success")
  const [isValidating, setIsValidating] = useState(false)

  const handleApplyCoupon = async () => {
    const code = couponCode.toUpperCase().trim()
    
    if (!code) {
      setToastMessage("Please enter a coupon code")
      setToastType("error")
      setShowToast(true)
      return
    }

    setIsValidating(true)
    
    try {
      // Pass user email for personalized/email-restricted coupons
      const result = await validateCoupon(code, total, user?.email || undefined)
      
      if (result.valid && result.discountAmount !== undefined) {
        applyDiscount(code, result.discountAmount)
        setToastMessage(`Coupon "${code}" applied successfully! You saved Rs.${result.discountAmount.toFixed(2)}`)
        setToastType("success")
        setShowToast(true)
      } else {
        setToastMessage(result.error || "Invalid coupon code")
        setToastType("error")
        setShowToast(true)
      }
    } catch (error) {
      setToastMessage("Error validating coupon")
      setToastType("error")
      setShowToast(true)
    }
    
    setIsValidating(false)
  }

  const handleRemoveCoupon = () => {
    removeDiscount()
    setCouponCode("")
    setToastMessage("Coupon removed")
    setToastType("error")
    setShowToast(true)
  }

  const FREE_SHIPPING_THRESHOLD = 4000
  const shippingAmount = total > FREE_SHIPPING_THRESHOLD ? 0 : 250
  const finalTotal = total - discount + shippingAmount

  const getItemHref = (item: { product: { isDeal?: boolean; dealId?: string; id: string; name: string } }) => {
    if (item.product.isDeal) {
      const dealRouteId = toSlug(item.product.name) || item.product.dealId || item.product.id
      return `/deals/${dealRouteId}`
    }

    return `/product/${item.product.id}`
  }

  const handleCheckout = () => {
    // Allow guest checkout - no sign-in required
    router.push("/checkout")
  }

  // Safe check for items array
  const cartItems = items || []
  const hasItems = cartItems.length > 0

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <FadeInSection delay={0.1}>
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-400 hover:text-accent transition mb-4"
            >
              <ArrowLeft size={20} />
              <span>Continue Shopping</span>
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Shopping Cart</h1>
                <p className="text-slate-400">
                  {hasItems
                    ? `${itemCount} ${itemCount === 1 ? "item" : "items"} in your cart`
                    : "Your cart is empty"}
                </p>
              </div>

              {hasItems && (
                <button
                  onClick={clearCart}
                  className="text-sm text-red-400 hover:text-red-300 font-medium transition"
                >
                  Clear Cart
                </button>
              )}
            </div>
          </div>
          </FadeInSection>

          {/* Empty Cart */}
          {!hasItems ? (
            <FadeInSection delay={0.2}>
            <div 
              className="rounded-2xl p-12 text-center"
              style={{
                background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center">
                  <ShoppingBag size={48} className="text-slate-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
              <p className="text-slate-400 mb-6">Add some products to get started!</p>
              <Link
                href="/shop"
                className="inline-block px-6 py-3 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition shadow-lg shadow-accent/25"
              >
                Start Shopping
              </Link>
            </div>
            </FadeInSection>
          ) : (
            <FadeInSection delay={0.2}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  const selectedVariant = item.selectedSize
                    ? item.product.sizeVariants?.find((variant) => variant.size === item.selectedSize)
                    : undefined
                  const originalUnitPrice = selectedVariant?.price ?? item.product.originalPrice ?? item.product.price
                  const currentUnitPrice = item.selectedPrice ?? item.product.price
                  const hasDiscountedPrice = originalUnitPrice > currentUnitPrice

                  return (
                  <div
                    key={item.product.id}
                    className="rounded-xl p-4 md:p-6 flex gap-4 md:gap-6"
                    style={{
                      background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {/* Product Image */}
                    <Link href={getItemHref(item)} className="flex-shrink-0">
                      <Image
                        src={item.product.imageUrl || "/placeholder.jpg"}
                        alt={item.product.altText || item.product.name}
                        width={96}
                        height={96}
                        loading="lazy"
                        className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={getItemHref(item)}>
                        <h3 className="font-semibold text-white mb-1 hover:text-accent transition line-clamp-1">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-slate-400 mb-1">{item.product.category}</p>
                      {item.selectedSize && (
                        <p className="text-sm text-accent mb-2">Size: {item.selectedSize}ml</p>
                      )}

                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-slate-600 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                            disabled={item.quantity === 1}
                            className="p-2 hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-white"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 font-semibold text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                            className="p-2 hover:bg-slate-700 transition text-white"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            {hasDiscountedPrice && (
                              <p className="text-xs text-slate-500 line-through">
                                Rs. {(originalUnitPrice * item.quantity).toFixed(2)}
                              </p>
                            )}
                            <p className="text-xl font-bold text-accent">
                              Rs. {(currentUnitPrice * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.selectedSize)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400"
                            aria-label="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div 
                  className="rounded-2xl p-6 sticky top-4"
                  style={{
                    background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                  {/* Coupon Section */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-white mb-2">
                      Have a coupon code?
                    </label>
                    
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-green-400" />
                          <span className="text-sm font-semibold text-green-400">
                            {appliedCoupon}
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-xs text-red-400 hover:text-red-300 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 w-full">
                        <input
                          type="text"
                          placeholder="Enter code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && !isValidating && handleApplyCoupon()}
                          className="flex-1 min-w-0 px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500 text-sm"
                          disabled={isValidating}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={isValidating}
                          className="px-3 py-2 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition whitespace-nowrap flex-shrink-0 text-sm disabled:opacity-50 flex items-center gap-2"
                        >
                          {isValidating ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Checking...
                            </>
                          ) : (
                            "Apply"
                          )}
                        </button>
                      </div>
                    )}
                    
                    {/* Coupon Help Text */}
                    <p className="mt-2 text-xs text-slate-500">
                      Enter a valid coupon code to get discounts
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal ({itemCount} items)</span>
                      <span className="font-semibold text-white">Rs. {total.toFixed(2)}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Discount</span>
                        <span className="font-semibold">-Rs. {discount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-slate-400">
                      <span>Shipping</span>
                      <span className="font-semibold text-white">Rs. {shippingAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-700 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-white">Total</span>
                      <div className="text-right">
                        {discount > 0 && (
                          <div className="text-sm text-slate-500 line-through">
                            Rs. {total.toFixed(2)}
                          </div>
                        )}
                        <span className="text-2xl font-bold text-accent">Rs. {finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {discount > 0 && (
                      <div className="mt-2 text-sm text-green-400 font-semibold text-right">
                        You save Rs. {discount.toFixed(2)}!
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition mb-4 shadow-lg shadow-accent/25"
                  >
                    Proceed to Checkout
                  </button>

                  {/* Guest Checkout Info */}
                  {!user && (
                    <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                      <p className="text-xs text-blue-300">
                        You can checkout as a guest or{" "}
                        <Link href="/sign-in" className="underline font-semibold hover:text-blue-200">
                          sign in
                        </Link>{" "}
                        for faster checkout
                      </p>
                    </div>
                  )}

                  <Link
                    href="/shop"
                    className="block text-center text-sm text-accent hover:underline"
                  >
                    Continue Shopping
                  </Link>

                  {/* Benefits */}
                  <div className="mt-6 pt-6 border-t border-slate-700 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-400 text-xs">✓</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Free Shipping</p>
                        <p className="text-xs text-slate-400">On orders over Rs.4000</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-400 text-xs">✓</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Secure Payment</p>
                        <p className="text-xs text-slate-400">Your data is protected</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-400 text-xs">✓</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Easy Returns</p>
                        <p className="text-xs text-slate-400">7-days return policy</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </FadeInSection>
          )}
        </div>
      </main>
      <Footer />
      
      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  )
}
