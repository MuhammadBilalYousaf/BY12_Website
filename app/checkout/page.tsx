"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useCart, useAuth } from "@/lib/contexts"
import { CreditCard, Truck, ShoppingBag, Banknote, Tag } from "lucide-react"
import Toast from "@/components/toast"
import { useOrders } from "@/lib/hooks/use-orders"
import { useCoupons } from "@/lib/hooks/use-coupons"
import { trackFormFieldChange, trackOrderCompletion, linkGuestInteractionsToEmail, clearGuestId } from "@/lib/tracking"
import { FadeInSection } from "@/components/animated-section"

export default function CheckoutPage() {
  const { items, total, clearCart, discount, appliedCoupon } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { createOrder } = useOrders()
  const { useCoupon } = useCoupons()

  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card")
  const trackingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })

  // Safe check for items array
  const cartItems = items || []
  const hasItems = cartItems.length > 0

  // Calculate totals with discount
  const subtotal = total
  const discountAmount = discount
  const FREE_SHIPPING_THRESHOLD = 4000
  const shippingAmount = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : 250
  const taxAmount = 0
  const finalTotal = subtotal - discountAmount + shippingAmount + taxAmount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Track form field changes with debouncing
    if (trackingTimeoutRef.current) {
      clearTimeout(trackingTimeoutRef.current)
    }

    trackingTimeoutRef.current = setTimeout(() => {
      if (formData.email) {
        trackFormFieldChange(
          formData.email.toLowerCase(),
          name,
          value,
          "checkout"
        ).catch(() => {
          // Silently fail - don't disrupt user experience
        })
      }
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("=== ORDER SUBMISSION STARTED ===")
    console.log("Timestamp:", new Date().toISOString())

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      console.log("❌ Validation Failed: Missing required contact fields")
      setToastMessage("Please fill in all required fields")
      setShowToast(true)
      return
    }

    if (!formData.address || !formData.city || !formData.state || !formData.country) {
      console.log("❌ Validation Failed: Missing required address fields")
      setToastMessage("Please fill in all address fields")
      setShowToast(true)
      return
    }

    // Validate card details only if payment method is card
    if (paymentMethod === "card") {
      if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
        console.log("❌ Validation Failed: Missing card payment details")
        setToastMessage("Please fill in all payment details")
        setShowToast(true)
        return
      }
    }

    console.log("✅ Form validation passed")
    console.log("Payment Method:", paymentMethod)
    console.log("Cart Items Count:", cartItems.length)
    console.log("Total Amount:", finalTotal)

    setIsSubmitting(true)

    try {
      // Prepare order data
      const orderData = {
        userId: user?.id || "guest",
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode || "",
          country: formData.country,
        },
        items: cartItems.map((item) => {
          console.log(`🛒 Cart item: ${item.product.name}, selectedSize: ${item.selectedSize}, selectedPrice: ${item.selectedPrice}`)
          return {
            id: item.product.id,
            name: item.product.name,
            price: item.selectedPrice ?? item.product.price,
            quantity: item.quantity,
            imageUrl: item.product.imageUrl,
            selectedSize: item.selectedSize,
            selectedPrice: item.selectedPrice,
          }
        }),
        subtotal: subtotal,
        shipping: shippingAmount,
        tax: taxAmount,
        total: finalTotal,
        paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : "Credit/Debit Card",
      }

      console.log("📦 Prepared Order Data:", {
        userId: orderData.userId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        itemsCount: orderData.items.length,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
      })

      console.log("🔄 Attempting to create order in Firebase...")

      // Create order in Firebase
      const result = await createOrder(orderData)

      if (result.success) {
        console.log("✅ ORDER CREATED SUCCESSFULLY IN FIREBASE!")
        console.log("Order ID:", result.orderId)
        console.log("Document ID:", result.id)

        // Track order completion
        await trackOrderCompletion(
          formData.email.toLowerCase(),
          result.orderId,
          finalTotal,
          user?.id,
          paymentMethod === "cod" ? "Cash on Delivery" : "Credit/Debit Card"
        ).catch(() => {
          // Silently fail - don't disrupt user experience
        })

        // Link all guest interactions (cart, etc.) to this email if user is not signed in
        if (!user) {
          await linkGuestInteractionsToEmail(formData.email.toLowerCase()).catch(() => {
            // Silently fail
          })
          // Clear guest ID after linking
          clearGuestId()
        }

        // Increment coupon usage if a coupon was applied
        if (appliedCoupon) {
          console.log("📍 Incrementing coupon usage for:", appliedCoupon)
          await useCoupon(appliedCoupon)
        }

        // Send order confirmation email to customer
        try {
          console.log("📧 Sending order confirmation email...")
          await fetch("/api/order-confirmation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: result.orderId,
              customerName: `${formData.firstName} ${formData.lastName}`,
              customerEmail: formData.email,
              customerPhone: formData.phone,
              shippingAddress: {
                street: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode || "",
                country: formData.country,
              },
              items: cartItems.map((item) => ({
                id: item.product.id,
                name: item.product.name,
                price: item.selectedPrice ?? item.product.price,
                quantity: item.quantity,
                imageUrl: item.product.imageUrl,
                selectedSize: item.selectedSize,
              })),
              subtotal: subtotal,
              shipping: shippingAmount,
              tax: taxAmount,
              discount: discountAmount,
              total: finalTotal,
              paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : "Credit/Debit Card",
              appliedCoupon: appliedCoupon,
            }),
          })
          console.log("✅ Order confirmation email sent!")
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError)
          // Don't block order completion if email fails
        }

        // Save order details to localStorage for confirmation page
        const orderDetails = {
          ...orderData,
          orderId: result.orderId,
          appliedCoupon: appliedCoupon,
          discount: discountAmount,
          orderDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        }

        localStorage.setItem("last_order", JSON.stringify(orderDetails))
        console.log("💾 Order saved to localStorage")

        // Show success message
        const paymentMethodText = paymentMethod === "cod" ? "Cash on Delivery" : "Card Payment"
        setToastMessage(`✅ Order placed successfully with ${paymentMethodText}!`)
        setShowToast(true)

        console.log("🧹 Clearing cart...")
        
        // Clear cart and redirect after 1.5 seconds
        setTimeout(() => {
          clearCart()
          console.log("✅ Cart cleared")
          console.log("🔄 Redirecting to order confirmation page...")
          router.push("/order-confirmation")
          console.log("=== ORDER SUBMISSION COMPLETED ===")
        }, 1500)
      } else {
        console.error("❌ ORDER CREATION FAILED!")
        console.error("Error:", result.error)
        setToastMessage(`Failed to place order: ${result.error}`)
        setShowToast(true)
        setIsSubmitting(false)
      }
    } catch (error: any) {
      console.error("❌ UNEXPECTED ERROR DURING ORDER CREATION!")
      console.error("Error Type:", error.name)
      console.error("Error Message:", error.message)
      console.error("Error Stack:", error.stack)
      setToastMessage("An unexpected error occurred. Please try again.")
      setShowToast(true)
      setIsSubmitting(false)
    }
  }

  // Redirect if cart is empty
  if (!hasItems) {
    console.log("⚠️ Cart is empty, showing empty cart message")
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
          <div className="max-w-7xl mx-auto px-4">
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
              <p className="text-slate-400 mb-6">Add some products before checkout</p>
              <button
                onClick={() => router.push("/shop")}
                className="px-6 py-3 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition shadow-lg shadow-accent/25"
              >
                Start Shopping
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <FadeInSection delay={0.1}>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Checkout</h1>
          </FadeInSection>

          <FadeInSection delay={0.2}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <div 
                  className="rounded-xl p-6"
                  style={{
                    background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Truck size={24} className="text-accent" />
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div 
                  className="rounded-xl p-6"
                  style={{
                    background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <h2 className="text-xl font-bold text-white mb-4">Shipping Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          State/Province *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          ZIP/Postal Code (Optional)
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Country *
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div 
                  className="rounded-xl p-6"
                  style={{
                    background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <h2 className="text-xl font-bold text-white mb-4">Payment Method</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-4 border-2 rounded-lg transition flex items-center justify-center gap-3 ${
                        paymentMethod === "card"
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-slate-600 hover:border-accent/50 text-white"
                      }`}
                    >
                      <CreditCard size={24} />
                      <div className="text-left">
                        <div className="font-semibold">Credit/Debit Card</div>
                        <div className="text-xs text-slate-400">Pay securely online</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-4 border-2 rounded-lg transition flex items-center justify-center gap-3 ${
                        paymentMethod === "cod"
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-slate-600 hover:border-accent/50 text-white"
                      }`}
                    >
                      <Banknote size={24} />
                      <div className="text-left">
                        <div className="font-semibold">Cash on Delivery</div>
                        <div className="text-xs text-slate-400">Pay when you receive</div>
                      </div>
                    </button>
                  </div>

                  {/* Card Payment Fields */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4 border-t border-slate-700 pt-6">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          required={paymentMethod === "card"}
                          className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          required={paymentMethod === "card"}
                          className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-white mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            required={paymentMethod === "card"}
                            className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-white mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            required={paymentMethod === "card"}
                            maxLength={4}
                            className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COD Information */}
                  {paymentMethod === "cod" && (
                    <div className="border-t border-slate-700 pt-6">
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex gap-3">
                          <Banknote className="text-blue-400 flex-shrink-0" size={24} />
                          <div>
                            <h3 className="font-semibold text-blue-200 mb-2">
                              Cash on Delivery
                            </h3>
                            <ul className="text-sm text-blue-300 space-y-1">
                              <li>• Pay in cash when your order is delivered</li>
                              <li>• Have exact change ready if possible</li>
                              <li>• No additional charges for COD</li>
                              <li>• Inspect the product before making payment</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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

                  {/* Applied Coupon */}
                  {appliedCoupon && (
                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-green-400" />
                        <span className="text-sm font-semibold text-green-400">
                          Coupon "{appliedCoupon}" applied
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => {
                      const selectedVariant = item.selectedSize
                        ? item.product.sizeVariants?.find((variant) => variant.size === item.selectedSize)
                        : undefined
                      const originalUnitPrice = selectedVariant?.price ?? item.product.originalPrice ?? item.product.price
                      const currentUnitPrice = item.selectedPrice ?? item.product.price
                      const hasDiscountedPrice = originalUnitPrice > currentUnitPrice

                      return (
                      <div key={item.product.id} className="flex gap-3">
                        <Image
                          src={item.product.imageUrl || "/placeholder.jpg"}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          loading="lazy"
                          className="object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm line-clamp-1">
                            {item.product.name}
                          </h3>
                          <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                          {hasDiscountedPrice && (
                            <p className="text-xs text-slate-500 line-through">
                              Rs. {(originalUnitPrice * item.quantity).toFixed(2)}
                            </p>
                          )}
                          <p className="text-sm font-bold text-accent">
                            Rs. {(currentUnitPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )})}
                  </div>

                  <div className="border-t border-slate-700 pt-4 space-y-3 mb-6">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span className="font-semibold text-white">Rs. {subtotal.toFixed(2)}</span>
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Discount</span>
                        <span className="font-semibold">-Rs. {discountAmount.toFixed(2)}</span>
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
                        {discountAmount > 0 && (
                          <div className="text-sm text-slate-500 line-through">
                            Rs. {(subtotal + shippingAmount).toFixed(2)}
                          </div>
                        )}
                        <span className="text-2xl font-bold text-accent">
                          Rs. {finalTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="mt-2 text-sm text-green-400 font-semibold text-right">
                        You save Rs. {discountAmount.toFixed(2)}!
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/25"
                  >
                    {isSubmitting 
                      ? "Processing..." 
                      : paymentMethod === "cod" 
                        ? "Place Order (COD)" 
                        : "Place Order & Pay"
                    }
                  </button>

                  <p className="text-xs text-slate-500 text-center mt-4">
                    By placing your order, you agree to our terms and conditions
                  </p>
                </div>
              </div>
            </div>
          </form>
          </FadeInSection>
        </div>
      </main>
      <Footer />

      {/* Toast Notification */}
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  )
}
