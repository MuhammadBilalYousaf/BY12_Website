"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/contexts"
import type { Product } from "@/lib/types"
import { Star, ShoppingCart, Heart, Share2, X } from "lucide-react"
import Toast from "@/components/toast"

interface ProductDetailsModalProps {
  product: Product
  onClose: () => void
}

export default function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [liked, setLiked] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product)
    }
    setShowToast(true)
    setQuantity(1)
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={handleBackdropClick}
      >
        <div className="bg-background rounded-lg max-w-6xl w-full my-8 relative max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-background rounded-full hover:bg-muted transition"
          >
            <X size={24} />
          </button>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* Images */}
              <div>
                <div className="bg-muted rounded-lg overflow-hidden h-96 md:h-[500px]">
                  <Image
                    src={product.imageUrl || "/placeholder.svg?height=600&width=500&query=luxury+perfume"}
                    alt={product.name}
                    width={500}
                    height={600}
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div>
                <div className="mb-4">
                  <span className="text-sm font-semibold text-accent uppercase">{product.category}</span>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{product.name}</h1>

                  {/* Rating */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                  </div>
                </div>

                <div className="mb-8 pb-8 border-b border-border">
                  <p className="text-gray-600 text-lg mb-4">{product.description}</p>
                  <div className="text-3xl font-bold text-accent">Rs. {product.price}</div>
                </div>

                {/* Notes */}
                <div className="mb-8 pb-8 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Fragrance Notes</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.notes.map((note) => (
                      <span key={note} className="px-4 py-2 bg-muted text-foreground rounded-full text-sm">
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Volume */}
                <div className="mb-8 pb-8 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Size</h3>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 border-2 border-primary text-primary rounded-lg font-semibold">
                      {product.volume}
                    </button>
                  </div>
                </div>

                {/* Quantity & Add to Cart */}
                <div className="flex gap-4 mb-8">
                  <div className="flex items-center gap-3 bg-muted rounded-lg p-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-border rounded"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-border rounded"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pb-8 border-b border-border">
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 border-2 ${
                      liked
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-foreground hover:border-accent"
                    }`}
                  >
                    <Heart size={20} fill={liked ? "currentColor" : "none"} />
                    {liked ? "Liked" : "Like"}
                  </button>
                  <button className="flex-1 px-4 py-3 border-2 border-border text-foreground rounded-lg font-semibold hover:border-accent transition flex items-center justify-center gap-2">
                    <Share2 size={20} />
                    Share
                  </button>
                </div>

                {/* Shipping */}
                <div className="space-y-2 text-sm">
                  <p className="text-green-600 font-semibold">Free shipping on orders over Rs.4000</p>
                  <p className="text-muted-foreground">Arrives in 3-5 business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={`${product.name} (${quantity}x) added to cart successfully!`}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  )
}