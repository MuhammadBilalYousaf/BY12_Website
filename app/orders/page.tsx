"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Eye, 
  ShoppingBag,
  ArrowLeft,
  Search,
  Star
} from "lucide-react"
import { useAuth } from "@/lib/contexts"
import { useUserProfile } from "@/lib/hooks/use-user-profile"
import ReviewModal from "@/components/review-modal"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ReviewProduct {
  id: string
  name: string
  imageUrl?: string
}

interface ReviewModalState {
  isOpen: boolean
  product: ReviewProduct | null
  orderId: string
  customerName: string
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { orders, ordersLoading, getOrderStats } = useUserProfile()
  const [filter, setFilter] = useState<"all" | "Pending" | "Processing" | "Completed" | "Cancelled">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [reviewedProducts, setReviewedProducts] = useState<Set<string>>(new Set())
  const [reviewModal, setReviewModal] = useState<ReviewModalState>({
    isOpen: false,
    product: null,
    orderId: "",
    customerName: "",
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in?redirect=/orders")
    }
  }, [user, authLoading, router])

  // Fetch reviewed products for completed orders
  useEffect(() => {
    const fetchReviewedProducts = async () => {
      if (!orders.length) return
      
      const completedOrders = orders.filter(o => o.status === "Completed")
      if (!completedOrders.length) return

      try {
        const reviewed = new Set<string>()
        for (const order of completedOrders) {
          const reviewsRef = collection(db, "productReviews")
          const reviewQuery = query(reviewsRef, where("orderId", "==", order.orderId))
          const reviewSnapshot = await getDocs(reviewQuery)
          reviewSnapshot.forEach(doc => {
            const data = doc.data()
            if (data.productId) reviewed.add(`${order.orderId}-${data.productId}`)
          })
        }
        setReviewedProducts(reviewed)
      } catch (err) {
        console.error("Error fetching reviewed products:", err)
      }
    }

    fetchReviewedProducts()
  }, [orders])

  const openReviewModal = (order: any, item: any) => {
    setReviewModal({
      isOpen: true,
      product: {
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
      },
      orderId: order.orderId,
      customerName: order.customerName || "",
    })
  }

  const handleReviewSuccess = () => {
    // Add to reviewed products set
    if (reviewModal.product) {
      setReviewedProducts(prev => new Set([...prev, `${reviewModal.orderId}-${reviewModal.product!.id}`]))
    }
  }

  const orderStats = getOrderStats()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
      case "Processing":
        return "text-blue-400 bg-blue-400/10 border-blue-400/30"
      case "Completed":
        return "text-green-400 bg-green-400/10 border-green-400/30"
      case "Cancelled":
        return "text-red-400 bg-red-400/10 border-red-400/30"
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock size={16} />
      case "Processing":
        return <Truck size={16} />
      case "Completed":
        return <CheckCircle size={16} />
      case "Cancelled":
        return <XCircle size={16} />
      default:
        return <Package size={16} />
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === "all" || order.status === filter
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/profile"
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">My Orders</h1>
              <p className="text-gray-400">Track and manage your orders</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <button
              onClick={() => setFilter("all")}
              className={`p-4 rounded-xl border transition ${
                filter === "all"
                  ? "bg-purple-500/20 border-purple-500"
                  : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
              }`}
            >
              <p className="text-2xl font-bold text-white">{orderStats.total}</p>
              <p className="text-sm text-gray-400">All Orders</p>
            </button>
            <button
              onClick={() => setFilter("Pending")}
              className={`p-4 rounded-xl border transition ${
                filter === "Pending"
                  ? "bg-yellow-500/20 border-yellow-500"
                  : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
              }`}
            >
              <p className="text-2xl font-bold text-yellow-400">{orderStats.pending}</p>
              <p className="text-sm text-gray-400">Pending</p>
            </button>
            <button
              onClick={() => setFilter("Processing")}
              className={`p-4 rounded-xl border transition ${
                filter === "Processing"
                  ? "bg-blue-500/20 border-blue-500"
                  : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
              }`}
            >
              <p className="text-2xl font-bold text-blue-400">{orderStats.processing}</p>
              <p className="text-sm text-gray-400">Processing</p>
            </button>
            <button
              onClick={() => setFilter("Completed")}
              className={`p-4 rounded-xl border transition ${
                filter === "Completed"
                  ? "bg-green-500/20 border-green-500"
                  : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
              }`}
            >
              <p className="text-2xl font-bold text-green-400">{orderStats.completed}</p>
              <p className="text-sm text-gray-400">Completed</p>
            </button>
            <button
              onClick={() => setFilter("Cancelled")}
              className={`p-4 rounded-xl border transition ${
                filter === "Cancelled"
                  ? "bg-red-500/20 border-red-500"
                  : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
              }`}
            >
              <p className="text-2xl font-bold text-red-400">{orderStats.cancelled}</p>
              <p className="text-sm text-gray-400">Cancelled</p>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by order ID or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Orders List */}
        {ordersLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-slate-700">
            <Package size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || filter !== "all" ? "No orders found" : "No orders yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filter !== "all"
                ? "Try adjusting your search or filter"
                : "When you place orders, they'll appear here"}
            </p>
            {!searchTerm && filter === "all" && (
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <ShoppingBag size={18} />
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition"
              >
                {/* Order Header */}
                <div className="bg-slate-700/30 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{order.orderId}</p>
                      <p className="text-sm text-gray-400">
                        Placed on {order.createdAt?.toDate?.()?.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }) || "—"}
                      </p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 border w-fit ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Order Total</p>
                    <p className="text-xl font-bold text-white">Rs. {order.total?.toFixed(2)}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <Image
                          src={item.imageUrl || "/placeholder.svg?height=80&width=80"}
                          alt={item.name}
                          width={80}
                          height={80}
                          loading="lazy"
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{item.name}</p>
                          <p className="text-sm text-gray-400">{item.brand}</p>
                          <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-white font-medium">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                          {/* Review button for completed orders */}
                          {order.status === "Completed" && (
                            reviewedProducts.has(`${order.orderId}-${item.id}`) ? (
                              <span className="text-xs text-green-400 flex items-center gap-1">
                                <CheckCircle size={14} /> Reviewed
                              </span>
                            ) : (
                              <button
                                onClick={() => openReviewModal(order, item)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-semibold hover:bg-purple-500/30 transition"
                              >
                                <Star size={12} /> Write Review
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address */}
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <p className="text-sm text-gray-400 mb-2">Shipping Address</p>
                    <p className="text-white">
                      {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/track-order?orderId=${order.orderId}&email=${encodeURIComponent(order.customerEmail || user?.email || "")}`}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      <Eye size={16} />
                      Track Order
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal(prev => ({ ...prev, isOpen: false }))}
        product={reviewModal.product}
        orderId={reviewModal.orderId}
        customerName={reviewModal.customerName}
        onSuccess={handleReviewSuccess}
      />
    </div>
  )
}
