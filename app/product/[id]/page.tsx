"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart, useWishlist } from "@/lib/contexts"
import type { Product } from "@/lib/types"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import PageBreadcrumb from "@/components/page-breadcrumb"
import { ProductSchema, BreadcrumbSchema } from "@/components/seo-schemas"
import Toast from "@/components/toast"
import { FadeInSection, FadeInStagger, FadeInItem } from "@/components/animated-section"
import { Star, ShoppingCart, Heart, Share2, Package, Truck, Shield, User } from "lucide-react"
import { doc, getDoc, collection, query, where, onSnapshot, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useProductReviews } from "@/lib/hooks/use-product-reviews"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = React.use(params)
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<number | undefined>(undefined)
  const [selectedPrice, setSelectedPrice] = useState<number | undefined>(undefined)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success")
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  // Fetch product reviews
  const { reviews, stats: reviewStats, loading: reviewsLoading } = useProductReviews(id)

  // Fetch product from Firebase
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRef = doc(db, "products", id)
        const productSnap = await getDoc(productRef)
        
        if (productSnap.exists()) {
          const productData = productSnap.data()
          setProduct({ 
            id: productSnap.id, 
            ...productData,
            inStock: productData.inStock ?? (productData.stock > 0)
          } as Product)
        } else {
          setProduct(null)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  // Fetch related products when product is loaded
  useEffect(() => {
    if (!product) return

    // Set default selected size and price when product loads
    if (product.sizeVariants && product.sizeVariants.length > 0) {
      // Find first variant with stock available
      const availableVariant = product.sizeVariants.find(v => v.stock > 0) || product.sizeVariants[0]
      const defaultPrice = availableVariant.onSale
        ? calculateSalePrice(availableVariant.price, availableVariant.saleType, availableVariant.saleValue)
        : availableVariant.price
      setSelectedSize(availableVariant.size)
      setSelectedPrice(defaultPrice)
    } else if (product.size) {
      setSelectedSize(product.size)
      setSelectedPrice(product.price)
    }

    const q = query(
      collection(db, "products"),
      where("category", "==", product.category),
      limit(5)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const products = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Product))
          .filter((p) => p.id !== product.id)
          .slice(0, 4)
        
        setRelatedProducts(products)
      },
      (error) => {
        console.error("Error fetching related products:", error)
      }
    )

    return () => unsubscribe()
  }, [product])

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mb-4"></div>
            <p className="text-slate-400">Loading product...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Redirect if product not found
  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Product Not Found</h1>
            <p className="text-slate-400 mb-6">The product you're looking for doesn't exist.</p>
            <Link
              href="/shop"
              className="px-6 py-3 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition shadow-lg shadow-accent/25"
            >
              Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Check if product is in wishlist
  const inWishlist = isInWishlist(product.id)

  const handleAddToCart = () => {
    const currentStock = getSelectedVariantStock()
    
    if (currentStock <= 0) {
      setToastMessage("This size is out of stock")
      setToastType("error")
      setShowToast(true)
      return
    }

    if (quantity > currentStock) {
      setToastMessage(`Only ${currentStock} items available for this size`)
      setToastType("error")
      setShowToast(true)
      return
    }

    // Use selected size/price or fall back to default
    const sizeToAdd = selectedSize ?? product.size
    const priceToAdd = selectedPrice ?? product.price

    console.log(`🛒 Adding to cart: ${product.name}, size: ${sizeToAdd}ml, price: ${priceToAdd}, quantity: ${quantity}`)

    addItem(product, quantity, sizeToAdd, priceToAdd)
    setToastMessage(`✓ ${product.name} (${quantity}x${sizeToAdd ? ` - ${sizeToAdd}ml` : ''}) added to cart!`)
    setToastType("success")
    setShowToast(true)
    setQuantity(1)
  }

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id)
      setToastMessage(`${product.name} removed from wishlist`)
      setToastType("error")
      setShowToast(true)
    } else {
      addToWishlist(product)
      setToastMessage(`✓ ${product.name} added to wishlist`)
      setToastType("success")
      setShowToast(true)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      setToastMessage("Link copied to clipboard!")
      setToastType("info")
      setShowToast(true)
    }
  }

  const handleSizeChange = (size: number) => {
    const variant = product?.sizeVariants?.find(v => v.size === size)
    if (variant) {
      setSelectedSize(size)
      setSelectedImageIndex(0)
      setSelectedPrice(
        variant.onSale
          ? calculateSalePrice(variant.price, variant.saleType, variant.saleValue)
          : variant.price
      )
    }
  }

  // Get selected variant's stock
  const getSelectedVariantStock = () => {
    if (product.sizeVariants && product.sizeVariants.length > 0 && selectedSize) {
      const variant = product.sizeVariants.find(v => v.size === selectedSize)
      return variant?.stock ?? 0
    }
    return product.stock ?? 0
  }

  const calculateSalePrice = (price: number, saleType?: "percent" | "amount", saleValue?: number) => {
    if (!saleType || !saleValue) return price
    const salePrice = saleType === "percent"
      ? Math.round(price * (1 - saleValue / 100))
      : Math.max(0, price - saleValue)
    return salePrice
  }

  const selectedVariant = selectedSize
    ? product.sizeVariants?.find(v => v.size === selectedSize)
    : product.sizeVariants?.[0]
  const originalPrice = selectedVariant?.price ?? product.price
  const hasSale = Boolean(selectedVariant?.onSale) && (selectedVariant?.saleValue ?? 0) > 0
  const selectedVariantSaleImage = hasSale ? selectedVariant?.saleImageUrl?.trim() : ""
  const selectedVariantImages = (selectedVariant?.images ?? []).filter((img): img is string => typeof img === "string" && img.trim().length > 0)
  const displayPrice = hasSale
    ? calculateSalePrice(originalPrice, selectedVariant?.saleType, selectedVariant?.saleValue)
    : (selectedPrice ?? originalPrice)
  const saveAmount = Math.max(0, originalPrice - displayPrice)
  const selectedStock = getSelectedVariantStock()
  const inStock = selectedStock > 0

  return (
    <>
      {/* SEO Schemas */}
      <ProductSchema
        name={product.name}
        description={product.description || `${product.name} - Premium fragrance by ${product.brand || 'BY12'}`}
        image={product.imageUrl || '/placeholder.svg'}
        price={product.price}
        brand={product.brand}
        category={product.category}
        inStock={inStock}
        rating={reviewStats.totalReviews > 0 ? reviewStats.averageRating : product.rating}
        reviewCount={reviewStats.totalReviews > 0 ? reviewStats.totalReviews : product.reviews}
        sku={product.id}
        url={`https://bilalyousaf12.store/product/${product.id}`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Shop", url: "/shop" },
          { name: product.category, url: `/shop?category=${product.category}` },
          { name: product.name }
        ]}
      />
      
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <PageBreadcrumb 
            items={[
              { label: "Shop", href: "/shop" },
              { label: product.category, href: `/shop?category=${product.category}` },
              { label: product.name }
            ]} 
          />
        </div>

        {/* Product Details */}
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
            {/* Images */}
            <FadeInSection delay={0.1}>
            <div className="md:sticky md:top-24 self-start">
              {(() => {
                // Keep gallery variant-specific; fallback only for older products without variant galleries
                const baseImages = selectedVariantImages
                const allImages = selectedVariantSaleImage
                  ? [selectedVariantSaleImage, ...baseImages.filter((img) => img !== selectedVariantSaleImage)]
                  : baseImages
                const currentImage = allImages[selectedImageIndex] || allImages[0] || null

                return (
                  <>
                    <div
                      className="bg-slate-800/50 rounded-2xl overflow-hidden mb-4 aspect-square relative border border-slate-700 cursor-pointer"
                      onClick={() => currentImage && setLightboxImage(currentImage)}
                    >
                      {/* Featured Badge */}
                      {product.featured && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="bg-accent text-slate-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                            <Star size={16} className="fill-slate-900" />
                            Featured
                          </div>
                        </div>
                      )}

                      {currentImage ? (
                        <Image
                          src={currentImage}
                          alt={product.altText || product.name}
                          fill
                          priority
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-700/50 text-slate-400 text-center p-4 rounded">
                          {product.altText || product.name}
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Strip */}
                    {allImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {allImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition ${
                              idx === selectedImageIndex
                                ? 'border-accent ring-2 ring-accent/30'
                                : 'border-slate-600 hover:border-slate-400'
                            }`}
                          >
                            <Image
                              src={img}
                              alt={`${product.name} - Image ${idx + 1}`}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
            </FadeInSection>

            {/* Info */}
            <FadeInSection delay={0.2}>
            <div>
              <div className="mb-4">
                <span className="text-sm font-semibold text-accent uppercase">{product.brand}</span>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 mt-2">{product.name}</h1>

                {/* Rating */}
                {(product.rating || reviewStats.totalReviews > 0) && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={i < Math.floor(reviewStats.totalReviews > 0 ? reviewStats.averageRating : (product.rating || 0)) ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-400">
                      {reviewStats.totalReviews > 0 
                        ? `${reviewStats.averageRating.toFixed(1)} (${reviewStats.totalReviews} reviews)`
                        : `${(product.rating || 0).toFixed(1)} (${product.reviews || 0} reviews)`
                      }
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-8 pb-8 border-b border-slate-700">
                {product.description ? (
                  <div 
                    className="text-slate-300 text-lg mb-6 leading-relaxed prose prose-lg prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p className="text-slate-400 text-lg mb-6 leading-relaxed">No description available.</p>
                )}

                {/* Size Selection */}
                {product.sizeVariants && product.sizeVariants.length > 1 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-400 mb-3">Select Size</h4>
                    <div className="flex flex-wrap gap-3">
                      {product.sizeVariants.map((variant) => {
                        const isOutOfStock = variant.stock <= 0
                        const variantHasSale = Boolean(variant.onSale) && (variant.saleValue ?? 0) > 0
                        const variantSalePrice = variantHasSale
                          ? calculateSalePrice(variant.price, variant.saleType, variant.saleValue)
                          : variant.price
                        return (
                          <button
                            key={variant.size}
                            onClick={() => !isOutOfStock && handleSizeChange(variant.size)}
                            disabled={isOutOfStock}
                            className={`px-4 py-3 rounded-lg border-2 transition-all ${
                              isOutOfStock
                                ? "border-slate-700 text-slate-500 cursor-not-allowed opacity-60"
                                : selectedSize === variant.size
                                  ? "border-accent bg-accent/20 text-accent"
                                  : "border-slate-600 text-slate-300 hover:border-slate-500"
                            }`}
                          >
                            <div className="text-lg font-bold">{variant.size}ml</div>
                            <div className="text-sm flex items-center gap-2">
                              <span>Rs.{variantSalePrice.toFixed(0)}</span>
                              {variantHasSale && (
                                <span className="text-xs text-slate-500 line-through">Rs.{variant.price.toFixed(0)}</span>
                              )}
                            </div>
                            <div className={`text-xs mt-1 ${isOutOfStock ? 'text-red-400' : 'text-green-400'}`}>
                              {isOutOfStock ? 'Out of stock' : `${variant.stock} in stock`}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {/* Price */}
                <div className="flex items-baseline gap-3 flex-wrap">
                  <div className="text-4xl font-bold text-accent">Rs.{displayPrice.toFixed(2)}</div>
                  {hasSale && (
                    <span className="text-lg text-slate-500 line-through">Rs.{originalPrice.toFixed(2)}</span>
                  )}
                  {selectedSize && <span className="text-slate-400">/ {selectedSize}ml</span>}
                  {hasSale && (
                    <span className="text-sm text-green-400 font-semibold">Save Rs.{saveAmount.toFixed(2)}</span>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="mb-8 pb-8 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Product Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Category</p>
                    <p className="font-semibold text-white">{product.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Brand</p>
                    <p className="font-semibold text-white">{product.brand}</p>
                  </div>
                  {selectedSize && (
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Selected Size</p>
                      <p className="font-semibold text-white">{selectedSize} ml</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Status</p>
                    <p className={`font-semibold ${product.status === "Active" ? 'text-green-400' : 'text-red-400'}`}>
                      {product.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Stock {selectedSize && `(${selectedSize}ml)`}</p>
                    <p className={`font-semibold ${inStock ? 'text-green-400' : 'text-red-400'}`}>
                      {inStock ? `${selectedStock} available` : 'Out of stock'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stock Status Alert */}
              {inStock && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 font-semibold text-sm">
                    ✓ {selectedStock} in stock {selectedSize && `for ${selectedSize}ml`} - Order now!
                  </p>
                </div>
              )}

              {!inStock && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 font-semibold">Out of Stock {selectedSize && `for ${selectedSize}ml`}</p>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex gap-3 mb-8">
                <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded transition text-lg font-bold text-white disabled:opacity-50"
                    disabled={!inStock || quantity <= 1}
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold text-base text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedStock, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded transition text-lg font-bold text-white disabled:opacity-50"
                    disabled={!inStock || quantity >= selectedStock}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 px-6 py-2.5 bg-accent text-slate-900 rounded-lg font-semibold text-base hover:bg-accent/90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/25"
                >
                  <ShoppingCart size={18} />
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pb-8 border-b border-slate-700">
                <button
                  onClick={handleWishlistToggle}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 border-2 ${
                    inWishlist
                      ? "border-red-500 bg-red-500/20 text-red-400"
                      : "border-slate-600 text-white hover:border-accent hover:bg-accent/10"
                  }`}
                  aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />
                  {inWishlist ? "Saved" : "Save"}
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 px-4 py-3 border-2 border-slate-600 text-white rounded-lg font-semibold hover:border-accent hover:bg-accent/10 transition flex items-center justify-center gap-2"
                >
                  <Share2 size={20} />
                  Share
                </button>
              </div>

              {/* Shipping Info */}
              <div className="space-y-3 text-sm mt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Truck size={20} className="text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Free Shipping</p>
                    <p className="text-slate-400">On orders over Rs.4000</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Fast Delivery</p>
                    <p className="text-slate-400">Arrives in 3-5 business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Easy Returns</p>
                    <p className="text-slate-400">7-days return policy</p>
                  </div>
                </div>
              </div>
            </div>
            </FadeInSection>
          </div>

          {/* Customer Reviews Section */}
          <FadeInSection delay={0.1}>
          <div className="border-t border-slate-700 pt-12 mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Customer <span className="text-accent">Reviews</span>
              </h2>
              {reviewStats.totalReviews > 0 && (
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 sm:px-4 py-2 rounded-lg w-fit">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(reviewStats.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}
                      />
                    ))}
                  </div>
                  <span className="text-white font-semibold text-sm sm:text-base">{reviewStats.averageRating.toFixed(1)}</span>
                  <span className="text-slate-400 text-xs sm:text-sm">({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'})</span>
                </div>
              )}
            </div>

            {reviewsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700">
                <Star className="mx-auto text-slate-600 mb-4" size={48} />
                <p className="text-slate-400 mb-2">No reviews yet</p>
                <p className="text-sm text-slate-500">Be the first to review this product after purchase!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-slate-800/50 rounded-xl p-5 border border-slate-700"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {review.image ? (
                        <Image
                          src={review.image}
                          alt={review.name}
                          width={48}
                          height={48}
                          loading="lazy"
                          className="rounded-full object-cover ring-2 ring-accent/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center ring-2 ring-accent/30">
                          <User size={24} className="text-accent" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-white">{review.name}</p>
                            <p className="text-xs text-accent">{review.role || "Customer"}</p>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>
                    
                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {review.images.map((img: string, idx: number) => (
                          <Image
                            key={idx}
                            src={img}
                            alt={`Review photo ${idx + 1}`}
                            width={64}
                            height={64}
                            loading="lazy"
                            className="object-cover rounded-lg cursor-pointer hover:opacity-80 hover:scale-105 transition border border-slate-600"
                            onClick={() => setLightboxImage(img)}
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      {review.createdAt && (
                        <p className="text-xs text-slate-500">
                          {review.createdAt.toDate?.()?.toLocaleDateString() || "Recently"}
                        </p>
                      )}
                      {review.isVerifiedPurchase && (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </FadeInSection>

          {/* You May Also Like Section */}
          {relatedProducts.length > 0 && (
            <FadeInSection delay={0.1}>
            <div className="border-t border-slate-700 pt-12">
              <h2 className="text-3xl font-bold text-white mb-8">You May Also <span className="text-accent">Like</span></h2>
              <FadeInStagger className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <FadeInItem key={relatedProduct.id}>
                    <ProductCard product={relatedProduct} />
                  </FadeInItem>
                ))}
              </FadeInStagger>
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

      {/* Lightbox Modal for Review Images */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center overflow-hidden"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl sm:text-2xl hover:bg-white/20 transition z-20"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxImage(null)
            }}
          >
            ✕
          </button>
          <div 
            className="relative w-[90vw] h-[80vh] sm:w-[85vw] sm:h-[85vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImage}
              alt={product?.altText || product?.name || "Product image"}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 90vw, 85vw"
            />
          </div>
        </div>
      )}
    </>
  )
}
