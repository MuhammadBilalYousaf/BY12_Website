"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Search, Package, Truck, CheckCircle, XCircle, Clock, Star, Camera, X } from "lucide-react"
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Order, OrderItem } from "@/lib/hooks/use-orders"
import { FadeInSection } from "@/components/animated-section"

const MAX_IMAGES = 5

function TrackOrderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState("")
  const [email, setEmail] = useState("")
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [autoTrackAttempted, setAutoTrackAttempted] = useState(false)
  
  // Review state - now per product with multiple images
  const [reviewingProduct, setReviewingProduct] = useState<OrderItem | null>(null)
  const [reviewedProducts, setReviewedProducts] = useState<Set<string>>(new Set())
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewData, setReviewData] = useState({
    name: "",
    rating: 5,
    comment: "",
    images: [] as string[], // Product images
  })
  const multipleFileInputRef = useRef<HTMLInputElement>(null)

  // Auto-fill order ID from URL and auto-track if email is provided
  useEffect(() => {
    const urlOrderId = searchParams.get("orderId")
    const urlEmail = searchParams.get("email")
    
    if (urlOrderId && !autoTrackAttempted) {
      setOrderId(urlOrderId)
      
      // If email is also provided, auto-track the order
      if (urlEmail) {
        setEmail(urlEmail)
        setAutoTrackAttempted(true)
        // Trigger auto-track after state is set
        setTimeout(() => {
          autoTrackOrder(urlOrderId, urlEmail)
        }, 100)
      }
    }
  }, [searchParams, autoTrackAttempted])

  // Auto-track order function (doesn't require form submission)
  const autoTrackOrder = async (orderIdParam: string, emailParam: string) => {
    setError("")
    setLoading(true)
    setOrder(null)

    try {
      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, where("orderId", "==", orderIdParam.toUpperCase().trim()))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setError("Order not found. Please check your Order ID.")
        setLoading(false)
        return
      }

      const orderDoc = querySnapshot.docs[0]
      const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order

      if (orderData.customerEmail.toLowerCase() !== emailParam.toLowerCase().trim()) {
        setError("Email doesn't match our records.")
        setLoading(false)
        return
      }

      setOrder(orderData)
      setReviewData(prev => ({ ...prev, name: orderData.customerName || "" }))
      
      // Check which products have already been reviewed
      if (orderData.status === "Completed") {
        const reviewsRef = collection(db, "productReviews")
        const reviewQuery = query(reviewsRef, where("orderId", "==", orderData.orderId))
        const reviewSnapshot = await getDocs(reviewQuery)
        const reviewed = new Set<string>()
        reviewSnapshot.forEach(doc => {
          const data = doc.data()
          if (data.productId) reviewed.add(data.productId)
        })
        setReviewedProducts(reviewed)
      }
    } catch (err: any) {
      console.error("Error tracking order:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setOrder(null)
    setReviewingProduct(null)
    setReviewedProducts(new Set())

    try {
      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, where("orderId", "==", orderId.toUpperCase().trim()))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setError("Order not found. Please check your Order ID.")
        setLoading(false)
        return
      }

      const orderDoc = querySnapshot.docs[0]
      const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order

      if (orderData.customerEmail.toLowerCase() !== email.toLowerCase().trim()) {
        setError("Email doesn't match our records.")
        setLoading(false)
        return
      }

      setOrder(orderData)
      setReviewData(prev => ({ ...prev, name: orderData.customerName || "" }))
      
      // Check which products have already been reviewed
      if (orderData.status === "Completed") {
        const reviewsRef = collection(db, "productReviews")
        const reviewQuery = query(reviewsRef, where("orderId", "==", orderData.orderId))
        const reviewSnapshot = await getDocs(reviewQuery)
        const reviewed = new Set<string>()
        reviewSnapshot.forEach(doc => {
          const data = doc.data()
          if (data.productId) reviewed.add(data.productId)
        })
        setReviewedProducts(reviewed)
      }
    } catch (err: any) {
      console.error("Error tracking order:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle size={48} className="text-green-500" />
      case "Shipped": return <Truck size={48} className="text-purple-500" />
      case "Processing": return <Package size={48} className="text-blue-500" />
      case "Pending": return <Clock size={48} className="text-yellow-500" />
      case "Cancelled": return <XCircle size={48} className="text-red-500" />
      default: return <Package size={48} className="text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-500/20 text-green-400 border-green-500"
      case "Shipped": return "bg-purple-500/20 text-purple-400 border-purple-500"
      case "Processing": return "bg-blue-500/20 text-blue-400 border-blue-500"
      case "Pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500"
      case "Cancelled": return "bg-red-500/20 text-red-400 border-red-500"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500"
    }
  }

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "Pending": return 20
      case "Processing": return 45
      case "Shipped": return 75
      case "Completed": return 100
      case "Cancelled": return 0
      default: return 0
    }
  }

  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const remainingSlots = MAX_IMAGES - reviewData.images.length
    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    filesToProcess.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} is too large. Image size should be less than 2MB`)
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setReviewData(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string].slice(0, MAX_IMAGES)
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeProductImage = (index: number) => {
    setReviewData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const openReviewForm = (product: OrderItem) => {
    setReviewingProduct(product)
    setReviewData({
      name: order?.customerName || "",
      rating: 5,
      comment: "",
      images: [],
    })
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order || !reviewingProduct || !reviewData.name.trim() || !reviewData.comment.trim()) {
      return
    }

    setReviewLoading(true)

    try {
      // Add to productReviews collection (for product-specific reviews)
      await addDoc(collection(db, "productReviews"), {
        productId: reviewingProduct.id,
        productName: reviewingProduct.name,
        name: reviewData.name.trim(),
        email: order.customerEmail || "", // Add email for profile matching
        role: "Verified Buyer",
        rating: reviewData.rating,
        comment: reviewData.comment.trim(),
        image: "",
        images: reviewData.images || [],
        orderId: order.orderId,
        isApproved: false,
        isVerifiedPurchase: true,
        isFeatured: false,
        helpfulCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Also add to testimonials collection (for homepage testimonials)
      await addDoc(collection(db, "testimonials"), {
        name: reviewData.name.trim(),
        email: order.customerEmail || "", // Add email for profile matching
        role: "Verified Buyer",
        rating: reviewData.rating,
        comment: reviewData.comment.trim(),
        image: "",
        images: reviewData.images || [],
        orderId: order.orderId,
        productId: reviewingProduct.id,
        productName: reviewingProduct.name,
        isApproved: false,
        isFeatured: false,
        source: "review",
        verifiedPurchase: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Mark product as reviewed
      setReviewedProducts(prev => new Set([...prev, reviewingProduct.id]))
      setReviewingProduct(null)
    } catch (err) {
      console.error("Error submitting review:", err)
      alert("Failed to submit review. Please try again.")
    } finally {
      setReviewLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <FadeInSection delay={0.1}>
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Track Your Order</h1>
            <p className="text-slate-400">Enter your order details to track your shipment</p>
          </div>
          </FadeInSection>

          {/* Tracking Form */}
          <FadeInSection delay={0.2}>
          <div 
            className="rounded-2xl p-6 md:p-8 mb-8"
            style={{
              background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Order ID *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="ORD-XXXXXXXX"
                    required
                    className="w-full px-4 py-3 pl-12 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                  />
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent/25"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-900 border-t-transparent"></div>
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Track Order
                  </>
                )}
              </button>
            </form>
          </div>
          </FadeInSection>

          {/* Order Details */}
          {order && (
            <div className="space-y-6">
              {/* Status Card */}
              <div 
                className="rounded-2xl p-6 md:p-8"
                style={{
                  background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="mb-4">{getStatusIcon(order.status)}</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Order Status</h2>
                  <span className={`px-4 py-2 rounded-full font-semibold text-sm border-2 ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {order.status !== "Cancelled" && (
                  <div className="mb-8">
                    <div className="relative">
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-accent transition-all duration-500" style={{ width: `${getProgressPercentage(order.status)}%` }}></div>
                      </div>
                      <div className="flex justify-between mt-4 text-xs">
                        <div className="text-center">
                          <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${order.status === "Pending" || order.status === "Processing" || order.status === "Shipped" || order.status === "Completed" ? "bg-accent" : "bg-slate-600"}`}></div>
                          <span className="text-slate-400">Pending</span>
                        </div>
                        <div className="text-center">
                          <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${order.status === "Processing" || order.status === "Shipped" || order.status === "Completed" ? "bg-accent" : "bg-slate-600"}`}></div>
                          <span className="text-slate-400">Processing</span>
                        </div>
                        <div className="text-center">
                          <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${order.status === "Shipped" || order.status === "Completed" ? "bg-accent" : "bg-slate-600"}`}></div>
                          <span className="text-slate-400">Shipped</span>
                        </div>
                        <div className="text-center">
                          <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${order.status === "Completed" ? "bg-accent" : "bg-slate-600"}`}></div>
                          <span className="text-slate-400">Delivered</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t border-slate-700 pt-6">
                  <div>
                    <p className="text-slate-400 mb-1">Order ID</p>
                    <p className="font-semibold text-white">{order.orderId}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Order Date</p>
                    <p className="font-semibold text-white">{order.createdAt?.toDate?.()?.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Total Amount</p>
                    <p className="font-semibold text-accent">Rs.{order.total?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Payment Method</p>
                    <p className="font-semibold text-white">{order.paymentMethod}</p>
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
                <h3 className="text-lg font-bold text-white mb-4">Shipping Address</h3>
                <div className="text-sm text-slate-400 space-y-1">
                  <p className="text-white font-medium">{order.customerName}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>

              {/* Order Items with Review Option */}
              <div 
                className="rounded-xl p-6"
                style={{
                  background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h3 className="text-lg font-bold text-white mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 pb-4 border-b border-slate-700 last:border-0 last:pb-0">
                      <Image
                        src={item.imageUrl || "/placeholder.svg?height=60&width=60"}
                        alt={item.name}
                        width={64}
                        height={64}
                        loading="lazy"
                        className="object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-sm text-slate-400">Quantity: {item.quantity}</p>
                        <p className="text-sm font-semibold text-accent">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      {/* Review button for completed orders */}
                      {order.status === "Completed" && (
                        <div>
                          {reviewedProducts.has(item.id) ? (
                            <span className="text-xs text-green-400 flex items-center gap-1">
                              <CheckCircle size={14} /> Reviewed
                            </span>
                          ) : (
                            <button
                              onClick={() => openReviewForm(item)}
                              className="px-3 py-1.5 bg-accent/20 text-accent rounded-lg text-sm font-semibold hover:bg-accent/30 transition flex items-center gap-1"
                            >
                              <Star size={14} /> Review
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    setOrder(null)
                    setOrderId("")
                    setEmail("")
                  }}
                  className="flex-1 px-6 py-3 border-2 border-slate-600 text-white rounded-lg font-semibold hover:bg-slate-800 transition"
                >
                  Track Another Order
                </button>
                <button
                  onClick={() => router.push("/shop")}
                  className="flex-1 px-6 py-3 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition shadow-lg shadow-accent/25"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Review Modal - Simplified */}
      {reviewingProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div 
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{
              background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Review: {reviewingProduct.name}</h3>
                <button onClick={() => setReviewingProduct(null)} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-5">
                {/* Product Photos Upload */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Add Photos (Optional - up to {MAX_IMAGES})
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {reviewData.images.map((img, index) => (
                      <div key={index} className="relative">
                        <Image src={img} alt={`Product ${index + 1}`} width={80} height={80} className="object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeProductImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {reviewData.images.length < MAX_IMAGES && (
                      <button
                        type="button"
                        onClick={() => multipleFileInputRef.current?.click()}
                        className="w-20 h-20 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-accent hover:text-accent transition"
                      >
                        <Camera size={20} />
                        <span className="text-xs mt-1">Add</span>
                      </button>
                    )}
                    <input 
                      ref={multipleFileInputRef} 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleMultipleImageUpload} 
                      className="hidden" 
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Your Name *</label>
                  <input
                    type="text"
                    value={reviewData.name}
                    onChange={(e) => setReviewData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 bg-slate-800/50 text-white"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Your Rating *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star size={36} className={star <= reviewData.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Your Review *</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                    required
                    rows={4}
                    placeholder="Share your experience with this product..."
                    className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 bg-slate-800/50 text-white placeholder:text-slate-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewingProduct(null)}
                    className="flex-1 px-4 py-3 border border-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewLoading || !reviewData.name.trim() || !reviewData.comment.trim()}
                    className="flex-1 px-4 py-3 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {reviewLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-900 border-t-transparent"></div>
                    ) : (
                      <>
                        <Star size={18} /> Submit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
function TrackOrderLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<TrackOrderLoading />}>
      <TrackOrderContent />
    </Suspense>
  )
}