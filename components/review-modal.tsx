"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Star, Camera, X, Loader2 } from "lucide-react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

const MAX_IMAGES = 5

interface ReviewProduct {
  id: string
  name: string
  imageUrl?: string
}

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  product: ReviewProduct | null
  orderId: string
  customerName: string
  onSuccess?: () => void
}

export default function ReviewModal({
  isOpen,
  onClose,
  product,
  orderId,
  customerName,
  onSuccess
}: ReviewModalProps) {
  const [reviewData, setReviewData] = useState({
    name: customerName,
    rating: 5,
    comment: "",
    images: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen || !product) return null

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const remainingSlots = MAX_IMAGES - reviewData.images.length
    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    filesToProcess.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        if (result) {
          setReviewData(prev => ({
            ...prev,
            images: [...prev.images, result].slice(0, MAX_IMAGES)
          }))
        }
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ""
  }

  const removeImage = (index: number) => {
    setReviewData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewData.name.trim() || !reviewData.comment.trim()) {
      alert("Please fill in your name and review")
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, "productReviews"), {
        productId: product.id,
        orderId: orderId,
        name: reviewData.name.trim(),
        rating: reviewData.rating,
        comment: reviewData.comment.trim(),
        images: reviewData.images,
        isApproved: false,
        isVerifiedPurchase: true,
        createdAt: serverTimestamp(),
      })

      // Reset form
      setReviewData({
        name: customerName,
        rating: 5,
        comment: "",
        images: [],
      })

      onSuccess?.()
      onClose()
      alert("Thank you for your review! It will be visible after approval.")
    } catch (err) {
      console.error("Error submitting review:", err)
      alert("Failed to submit review. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <h2 className="text-xl font-bold text-white">Write a Review</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-5 border-b border-slate-700 flex items-center gap-4">
          <Image
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            width={64}
            height={64}
            className="rounded-lg object-cover"
          />
          <div>
            <p className="font-semibold text-white">{product.name}</p>
            <p className="text-sm text-slate-400">Order: {orderId}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={star <= reviewData.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
            <input
              type="text"
              value={reviewData.name}
              onChange={(e) => setReviewData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Your Review</label>
            <textarea
              value={reviewData.comment}
              onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Share your experience with this product..."
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Add Photos (optional, max {MAX_IMAGES})
            </label>
            <div className="flex flex-wrap gap-3">
              {reviewData.images.map((img, index) => (
                <div key={index} className="relative w-20 h-20 group">
                  <Image
                    src={img}
                    alt={`Review ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {reviewData.images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-500 hover:border-purple-500 hover:text-purple-500 transition"
                >
                  <Camera size={24} />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
