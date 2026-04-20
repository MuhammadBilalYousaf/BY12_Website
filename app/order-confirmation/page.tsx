"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { CheckCircle, Package, Truck, Mail, MapPin, CreditCard, Banknote, Calendar } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl: string
}

interface OrderDetails {
  orderId: string
  orderDate: string
  items: OrderItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: "card" | "cod"
  appliedCoupon: string | null
  shippingAddress: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export default function OrderConfirmationPage() {
  const router = useRouter()
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get order details from localStorage
    const savedOrder = localStorage.getItem("last_order")
    
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder)
        setOrderDetails(order)
      } catch (error) {
        console.error("Failed to parse order:", error)
        router.push("/")
      }
    } else {
      // No order found, redirect to home
      router.push("/")
    }
    
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!orderDetails) {
    return null
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle size={48} className="text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Order Confirmed!
            </h1>
            <p className="text-slate-400">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          {/* Order Number & Date */}
          <div 
            className="rounded-2xl p-6 mb-6"
            style={{
              background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Order Number</p>
                <p className="text-lg font-bold text-accent">{orderDetails.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Order Date</p>
                <p className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar size={20} className="text-accent" />
                  {orderDetails.orderDate}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Items List */}
              <div 
                className="rounded-xl p-6"
                style={{
                  background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Package size={24} className="text-accent" />
                  Order Items
                </h2>
                <div className="space-y-4">
                  {orderDetails.items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-slate-700 last:border-0 last:pb-0">
                      <Image
                        src={item.imageUrl || "/placeholder.svg?height=80&width=80&query=perfume"}
                        alt={item.name}
                        width={80}
                        height={80}
                        loading="lazy"
                        className="object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{item.name}</h3>
                        <p className="text-sm text-slate-400">Quantity: {item.quantity}</p>
                        <p className="text-lg font-bold text-accent mt-2">
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
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
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin size={24} className="text-accent" />
                  Shipping Address
                </h2>
                <div className="space-y-2 text-white">
                  <p className="font-semibold">
                    {orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}
                  </p>
                  <p className="text-slate-400">{orderDetails.shippingAddress.address}</p>
                  <p className="text-slate-400">
                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state}{" "}
                    {orderDetails.shippingAddress.zipCode}
                  </p>
                  <p className="text-slate-400">{orderDetails.shippingAddress.country}</p>
                  <div className="pt-2 space-y-1">
                    <p className="flex items-center gap-2 text-sm text-slate-400">
                      <Mail size={16} className="text-accent" />
                      {orderDetails.shippingAddress.email}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-400">
                      <span>📞</span>
                      {orderDetails.shippingAddress.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div 
                className="rounded-xl p-6"
                style={{
                  background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  {orderDetails.paymentMethod === "cod" ? (
                    <Banknote size={24} className="text-accent" />
                  ) : (
                    <CreditCard size={24} className="text-accent" />
                  )}
                  Payment Method
                </h2>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                    {orderDetails.paymentMethod === "cod" ? (
                      <Banknote size={24} className="text-accent" />
                    ) : (
                      <CreditCard size={24} className="text-accent" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {orderDetails.paymentMethod === "cod" ? "Cash on Delivery" : "Credit/Debit Card"}
                    </p>
                    <p className="text-sm text-slate-400">
                      {orderDetails.paymentMethod === "cod"
                        ? "Pay when you receive your order"
                        : "Payment processed successfully"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div 
                className="rounded-xl p-6 sticky top-4"
                style={{
                  background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                {/* Applied Coupon */}
                {orderDetails.appliedCoupon && (
                  <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p className="text-sm font-semibold text-green-400">
                      Coupon "{orderDetails.appliedCoupon}" applied
                    </p>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-semibold text-white">Rs. {orderDetails.subtotal.toFixed(2)}</span>
                  </div>

                  {orderDetails.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span className="font-semibold">-Rs. {orderDetails.discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>Shipping</span>
                    <span className="font-semibold text-white">Rs. {orderDetails.shipping.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">Total Paid</span>
                    <span className="text-2xl font-bold text-accent">
                      Rs. {orderDetails.total.toFixed(2)}
                    </span>
                  </div>

                  {orderDetails.discount > 0 && (
                    <div className="mt-2 text-sm text-green-400 font-semibold text-right">
                      You saved Rs. {orderDetails.discount.toFixed(2)}!
                    </div>
                  )}
                </div>

                {/* Expected Delivery */}
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Truck className="text-blue-400 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-blue-200 text-sm mb-1">
                        Expected Delivery
                      </p>
                      <p className="text-sm text-blue-300">
                        3-5 business days
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    href="/shop"
                    className="block w-full py-3 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition text-center shadow-lg shadow-accent/25"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    href="/"
                    className="block w-full py-3 border-2 border-accent text-accent rounded-lg font-semibold hover:bg-accent/10 transition text-center"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next Section */}
          <div 
            className="rounded-xl p-6"
            style={{
              background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h2 className="text-xl font-bold text-white mb-4">What happens next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={24} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Order Confirmation</h3>
                  <p className="text-sm text-slate-400">
                    You'll receive an email confirmation shortly
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package size={24} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Order Processing</h3>
                  <p className="text-sm text-slate-400">
                    We'll prepare your order for shipment
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck size={24} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Delivery Updates</h3>
                  <p className="text-sm text-slate-400">
                    Track your order status via email updates
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Confirmation Email Notice */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              A confirmation email has been sent to{" "}
              <span className="font-semibold text-white">
                {orderDetails.shippingAddress.email}
              </span>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Order ID: {orderDetails.orderId} • Need help? Contact our support team
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}