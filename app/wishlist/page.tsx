"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useWishlist } from "@/lib/contexts"
import { Heart, ArrowLeft } from "lucide-react"
import ProductCard from "@/components/product-card"
import { FadeInSection, FadeInStagger, FadeInItem } from "@/components/animated-section"

export default function WishlistPage() {
  const { wishlist, isLoading, clearWishlist, wishlistCount } = useWishlist()
  const router = useRouter()

  const handleClearWishlist = () => {
    if (confirm("Are you sure you want to clear your wishlist?")) {
      clearWishlist()
    }
  }

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
              <span>Back</span>
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Wishlist</h1>
                <p className="text-slate-400">
                  {wishlistCount === 0
                    ? "Your wishlist is empty"
                    : `${wishlistCount} ${wishlistCount === 1 ? "item" : "items"} in your wishlist`}
                </p>
              </div>

              {wishlistCount > 0 && (
                <button
                  onClick={handleClearWishlist}
                  className="text-sm text-red-400 hover:text-red-300 font-medium transition"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
          </FadeInSection>

          {/* Empty State */}
          {wishlistCount === 0 ? (
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
                  <Heart size={48} className="text-slate-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Your Wishlist is Empty</h2>
              <p className="text-slate-400 mb-6">
                Save your favorite items to your wishlist and shop them later!
              </p>
              <Link
                href="/shop"
                className="inline-block px-6 py-3 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition shadow-lg shadow-accent/25"
              >
                Start Shopping
              </Link>
            </div>
            </FadeInSection>
          ) : (
            /* Wishlist Grid - Using ProductCard component */
            <FadeInStagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {wishlist.map((product) => (
                <FadeInItem key={product.id}>
                  <ProductCard product={product} />
                </FadeInItem>
              ))}
            </FadeInStagger>
          )}

          {/* Continue Shopping */}
          {wishlistCount > 0 && (
            <FadeInSection delay={0.3}>
            <div className="mt-12 text-center">
              <Link
                href="/shop"
                className="inline-block px-6 py-3 border-2 border-accent text-accent rounded-lg font-semibold hover:bg-accent/10 transition"
              >
                Continue Shopping
              </Link>
            </div>
            </FadeInSection>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}