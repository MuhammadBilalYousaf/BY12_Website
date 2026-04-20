"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, Heart, Eye, Star } from "lucide-react"
import type { Product } from "@/lib/types"
import { useCart, useWishlist } from "@/lib/contexts"
import Toast from "./toast"
import ProductDetailsModal from "./product-details-modal"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [showModal, setShowModal] = useState(false)
  const isWishlisted = isInWishlist(product.id)
  const router = useRouter()
  
  // Review stats state
  const [reviewStats, setReviewStats] = useState({ rating: product.rating || 0, count: product.reviews || 0 })

  // Fetch real review stats
  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        const q = query(
          collection(db, "productReviews"),
          where("productId", "==", product.id),
          where("isApproved", "==", true)
        )
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          const reviews = snapshot.docs.map(doc => doc.data())
          const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0)
          setReviewStats({
            rating: total / reviews.length,
            count: reviews.length
          })
        }
      } catch (err) {
        // Silently fail - use product defaults
      }
    }
    
    fetchReviewStats()
  }, [product.id, product.rating, product.reviews])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!inStock) {
      setToastMessage("Product is out of stock")
      setShowToast(true)
      return
    }
    
    addItem(product)
    setToastMessage(`${product.name} added to cart!`)
    setShowToast(true)
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isWishlisted) {
      removeFromWishlist(product.id)
      setToastMessage(`${product.name} removed from wishlist`)
    } else {
      addToWishlist(product)
      setToastMessage(`${product.name} added to wishlist`)
    }
    setShowToast(true)
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/product/${product.id}`)
  }

  const calculateSalePrice = (price: number, saleType?: "percent" | "amount", saleValue?: number) => {
    if (!saleType || !saleValue) return price
    const salePrice = saleType === "percent"
      ? Math.round(price * (1 - saleValue / 100))
      : Math.max(0, price - saleValue)
    return salePrice
  }

  const primaryVariant = product.sizeVariants?.[0]
  const originalPrice = primaryVariant?.price ?? product.price
  const hasSale = Boolean(primaryVariant?.onSale) && (primaryVariant?.saleValue ?? 0) > 0
  const displayPrice = hasSale
    ? calculateSalePrice(originalPrice, primaryVariant?.saleType, primaryVariant?.saleValue)
    : originalPrice
  const primaryVariantImages = (primaryVariant?.images ?? []).filter((img): img is string => typeof img === "string" && img.trim().length > 0)
  const cardPrimaryImage = hasSale && primaryVariant?.saleImageUrl
    ? primaryVariant.saleImageUrl
    : primaryVariantImages[0] || product.imageUrl
  const cardHoverImage = primaryVariantImages[1]
  const formattedDisplayPrice = displayPrice.toFixed(2)
  const formattedOriginalPrice = originalPrice.toFixed(2)
  const saveAmount = Math.max(0, originalPrice - displayPrice)
  const saleBadgeLabel = hasSale
    ? primaryVariant?.saleType === "percent"
      ? `${primaryVariant.saleValue}% OFF`
      : `SAVE Rs. ${primaryVariant?.saleValue}`
    : ""
  const stockCount = (product as any).stock
  const inStock = product.inStock ?? (stockCount !== undefined ? stockCount > 0 : true)


  return (
    <>
      <div 
        className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1"
        style={{
          background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.9) 0%, rgba(30, 41, 59, 0.95) 100%)',
          boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Sale Badge - Top Left Corner */}
        {hasSale && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-lg shadow-red-500/30">
              <span className="hidden sm:inline">SALE </span>{saleBadgeLabel}
            </div>
          </div>
        )}

        {/* Featured Badge - Positioned based on sale status */}
        {product.featured && (
          <div className={`absolute ${hasSale ? 'top-10 sm:top-14 left-2 sm:left-3' : 'top-2 right-2 sm:top-3 sm:right-3'} z-10`}>
            <div className="bg-gradient-to-r from-accent to-yellow-500 text-slate-900 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg shadow-accent/30">
              Featured
            </div>
          </div>
        )}

        {/* Out of Stock Badge */}
        {!inStock && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
            <div className="bg-slate-700/90 backdrop-blur-sm text-slate-300 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border border-slate-600">
              Out of Stock
            </div>
          </div>
        )}

        {/* Image Container */}
        <Link href={`/product/${product.id}`} className="block relative overflow-hidden">
          <div className="aspect-square relative">
            {cardPrimaryImage ? (
              <>
                {/* Primary Image */}
                <Image
                  src={cardPrimaryImage}
                  alt={product.altText || product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={`object-cover transition-all duration-700 ease-in-out group-hover:scale-110 ${
                    Boolean(cardHoverImage)
                      ? "group-hover:opacity-0"
                      : ""
                  }`}
                  loading="lazy"
                />
                {/* Secondary Image (shown on hover) */}
                {cardHoverImage && (
                  <Image
                    src={cardHoverImage}
                    alt={`${product.altText || product.name} - alternate view`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-110"
                    loading="lazy"
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-center p-4 rounded">
                {product.altText || product.name}
              </div>
            )}
            
            {/* Overlay Actions - Hidden on mobile, shown on hover for desktop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 hidden md:flex items-center justify-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleQuickView}
                className="p-2 sm:p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-accent hover:border-accent hover:text-slate-900 transition-all duration-300 transform hover:scale-110"
                aria-label="Quick view"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`p-2 sm:p-3 rounded-full transition-all duration-300 transform hover:scale-110 backdrop-blur-sm border ${isWishlisted
                    ? "bg-red-500 border-red-500 text-white"
                    : "bg-white/10 border-white/20 text-white hover:bg-red-500 hover:border-red-500"
                }`}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" fill={isWishlisted ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className="p-2 sm:p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-accent hover:border-accent hover:text-slate-900 transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-3 sm:p-4">
          <Link href={`/product/${product.id}`}>
            <p className="text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1 uppercase tracking-wide">{product.brand}</p>
            <h3 className="font-semibold text-white mb-1 sm:mb-2 line-clamp-1 hover:text-accent transition text-xs sm:text-base">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] sm:text-sm font-semibold text-white">{reviewStats.rating.toFixed(1)}</span>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-500 hidden sm:inline">({reviewStats.count} reviews)</span>
          </div>

          {/* Price Section */}
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <div className="flex flex-col gap-0.5 sm:gap-1">
              {hasSale ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                    <span className="text-sm sm:text-xl font-bold text-accent">Rs. {formattedDisplayPrice}</span>
                    <span className="text-[10px] sm:text-sm text-slate-500 line-through">
                      Rs. {formattedOriginalPrice}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-green-400 font-semibold hidden sm:block">
                    Save Rs. {saveAmount.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-sm sm:text-xl font-bold text-accent">Rs. {formattedDisplayPrice}</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className="p-2 sm:p-2.5 bg-accent hover:bg-accent/90 text-slate-900 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20 hover:shadow-accent/30 relative z-20"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          {/* Stock Status */}
          {inStock && stockCount !== undefined && stockCount < 10 && (
            <p className="text-[10px] sm:text-xs text-orange-400 font-semibold">Only {stockCount} left!</p>
          )}
          {!inStock && (
            <p className="text-[10px] sm:text-xs text-red-400 font-semibold">Out of stock</p>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}

      {/* Quick View Modal */}
      {showModal && <ProductDetailsModal product={product} onClose={() => setShowModal(false)} />}
    </>
  )
}
