"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Search, CheckCircle, XCircle, Star, Trash2, Eye, Package, MessageSquare, Image as ImageIcon, ThumbsUp, BadgeCheck, ChevronDown, ChevronUp, Reply, X } from "lucide-react"
import { collection, query, onSnapshot, orderBy, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Link from "next/link"

interface ProductReview {
  id: string
  productId: string
  productName: string
  name: string
  email?: string
  role: string
  image: string
  images?: string[]
  rating: number
  title?: string
  comment: string
  pros?: string[]
  cons?: string[]
  isApproved: boolean
  isVerifiedPurchase?: boolean
  isFeatured?: boolean
  helpfulCount?: number
  orderId?: string
  adminResponse?: string
  adminResponseDate?: any
  createdAt: any
}

export default function AdminProductReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending">("all")
  const [filterRating, setFilterRating] = useState<number | "all">("all")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [expandedReview, setExpandedReview] = useState<string | null>(null)
  const [imageModal, setImageModal] = useState<{ images: string[], index: number } | null>(null)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [adminResponse, setAdminResponse] = useState("")

  useEffect(() => {
    const q = query(collection(db, "productReviews"), orderBy("createdAt", "desc"))
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reviewsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ProductReview[]
        setReviews(reviewsData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching reviews:", err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "approved" && review.isApproved) ||
      (filterStatus === "pending" && !review.isApproved)

    const matchesRating = filterRating === "all" || review.rating === filterRating

    return matchesSearch && matchesStatus && matchesRating
  })

  const handleToggleApproval = async (review: ProductReview) => {
    try {
      await updateDoc(doc(db, "productReviews", review.id), {
        isApproved: !review.isApproved,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error("Error updating review:", err)
    }
  }

  const handleToggleFeatured = async (review: ProductReview) => {
    try {
      await updateDoc(doc(db, "productReviews", review.id), {
        isFeatured: !review.isFeatured,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error("Error updating review:", err)
    }
  }

  const handleSubmitResponse = async (reviewId: string) => {
    if (!adminResponse.trim()) return
    
    try {
      await updateDoc(doc(db, "productReviews", reviewId), {
        adminResponse: adminResponse.trim(),
        adminResponseDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      setRespondingTo(null)
      setAdminResponse("")
    } catch (err) {
      console.error("Error submitting response:", err)
    }
  }

  const handleDeleteResponse = async (reviewId: string) => {
    try {
      await updateDoc(doc(db, "productReviews", reviewId), {
        adminResponse: null,
        adminResponseDate: null,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error("Error deleting response:", err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return
    
    setIsDeleting(id)
    try {
      await deleteDoc(doc(db, "productReviews", id))
    } catch (err) {
      console.error("Error deleting review:", err)
    } finally {
      setIsDeleting(null)
    }
  }

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0"

  // Rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length
  }))

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Product Reviews</h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage customer reviews for products • {reviews.length} total reviews
            </p>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, product, title, or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Star className="text-purple-400" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{reviews.length}</p>
                <p className="text-sm text-gray-400">Total Reviews</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Star className="text-yellow-400 fill-yellow-400" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{averageRating}</p>
                <p className="text-sm text-gray-400">Avg Rating</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="text-green-400" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {reviews.filter((r) => r.isApproved).length}
                </p>
                <p className="text-sm text-gray-400">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <XCircle className="text-orange-400" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {reviews.filter((r) => !r.isApproved).length}
                </p>
                <p className="text-sm text-gray-400">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <ImageIcon className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {reviews.filter((r) => r.images && r.images.length > 0).length}
                </p>
                <p className="text-sm text-gray-400">With Photos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-6">
          <h3 className="text-white font-semibold mb-3">Rating Distribution</h3>
          <div className="space-y-2">
            {ratingCounts.map(({ rating, count }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-white text-sm">{rating}</span>
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-gray-400 text-sm w-10">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-lg">
            <Star className="mx-auto text-gray-500 mb-4" size={48} />
            <p className="text-gray-400">No product reviews found</p>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-300">Reviewer</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-300">Product</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-300">Rating</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-300">Review</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-300">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {review.image ? (
                            <Image src={review.image} alt={review.name} width={40} height={40} className="rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                              {review.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white">{review.name}</p>
                            <p className="text-xs text-gray-400">{review.role || "Customer"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-gray-400" />
                          <span className="text-white">{review.productName || "Unknown"}</span>
                        </div>
                        {review.orderId && (
                          <p className="text-xs text-gray-500 mt-1">Order: {review.orderId}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 max-w-xs">
                        <p className="text-gray-300 text-sm line-clamp-2">{review.comment}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            review.isApproved
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {review.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleApproval(review)}
                            className={`p-2 rounded-lg transition ${
                              review.isApproved
                                ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                                : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            }`}
                            title={review.isApproved ? "Unapprove" : "Approve"}
                          >
                            {review.isApproved ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          </button>
                          {review.productId && (
                            <Link
                              href={`/product/${review.productId}`}
                              target="_blank"
                              className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition"
                              title="View Product"
                            >
                              <Eye size={16} />
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(review.id)}
                            disabled={isDeleting === review.id}
                            className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition disabled:opacity-50"
                            title="Delete"
                          >
                            {isDeleting === review.id ? (
                              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
