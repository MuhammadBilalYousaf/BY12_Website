"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import ProductCard from "@/components/product-card"
import Footer from "@/components/footer"
import PageBreadcrumb from "@/components/page-breadcrumb"
import type { Product } from "@/lib/types"
import { Sparkles, Package, Truck, ShoppingBag } from "lucide-react"
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { FadeInSection, FadeInStagger, FadeInItem } from "@/components/animated-section"

export default function TestersPage() {
  const [testers, setTesters] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<string>("featured")

  // Fetch testers from Firebase
  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("isTester", "==", true)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const testersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]

        // Sort based on selected option
        let sorted = [...testersData]
        if (sortBy === "price-low") {
          sorted = testersData.sort((a, b) => a.price - b.price)
        } else if (sortBy === "price-high") {
          sorted = testersData.sort((a, b) => b.price - a.price)
        } else if (sortBy === "newest") {
          // Sort by createdAt descending
          sorted = testersData.sort((a, b) => {
            const timeA = a.createdAt?.toDate?.() || new Date(0)
            const timeB = b.createdAt?.toDate?.() || new Date(0)
            return timeB.getTime() - timeA.getTime()
          })
        } else {
          // Featured - show products marked as featured first
          sorted = testersData.sort((a, b) => {
            if (a.featured === b.featured) return 0
            return a.featured ? -1 : 1
          })
        }

        setTesters(sorted)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching testers:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [sortBy])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      {/* Breadcrumb with proper margin */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Free Testers", href: "/testers" },
          ]}
        />
      </div>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-[#d4af37] mr-3" />
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  Free Fragrance Testers
                </h1>
                <Sparkles className="w-8 h-8 text-[#d4af37] ml-3" />
              </div>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                Discover our exclusive fragrances before committing to a full bottle. Request a free tester sample and experience the BY12 difference.
              </p>

              {/* Benefits Grid - Inline from left to right */}
              <div className="flex flex-col sm:flex-row gap-6 mt-12 w-full">
                <FadeInStagger className="w-full flex flex-col sm:flex-row gap-6">
                  <FadeInItem className="flex-1">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-[#d4af37] rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#d4af37]/20 h-full">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        <div className="flex-shrink-0">
                          <ShoppingBag className="w-10 h-10 text-[#d4af37]" />
                        </div>
                        <div className="text-center sm:text-left">
                          <h3 className="text-white font-semibold text-lg">Add to Cart</h3>
                          <p className="text-slate-400 text-sm mt-1">
                            Select your preferred testers
                          </p>
                        </div>
                      </div>
                    </div>
                  </FadeInItem>

                  <FadeInItem className="flex-1">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-[#d4af37] rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#d4af37]/20 h-full">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        <div className="flex-shrink-0">
                          <Package className="w-10 h-10 text-[#d4af37]" />
                        </div>
                        <div className="text-center sm:text-left">
                          <h3 className="text-white font-semibold text-lg">Checkout</h3>
                          <p className="text-slate-400 text-sm mt-1">
                            Only pay delivery, testers are free
                          </p>
                        </div>
                      </div>
                    </div>
                  </FadeInItem>

                  <FadeInItem className="flex-1">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-[#d4af37] rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#d4af37]/20 h-full">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        <div className="flex-shrink-0">
                          <Truck className="w-10 h-10 text-[#d4af37]" />
                        </div>
                        <div className="text-center sm:text-left">
                          <h3 className="text-white font-semibold text-lg">Receive</h3>
                          <p className="text-slate-400 text-sm mt-1">
                            Get testers to your doorstep
                          </p>
                        </div>
                      </div>
                    </div>
                  </FadeInItem>
                </FadeInStagger>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Testers Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto">
          {/* Header with Sort - One line layout */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Available Testers</h2>
              <p className="text-slate-400 mt-2">Browse and select your favorite fragrance samples</p>
            </div>
            <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
              <label className="text-slate-300 text-sm font-medium whitespace-nowrap">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 bg-transparent text-white border-none focus:outline-none focus:ring-0 cursor-pointer text-sm"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Testers Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin">
                <Sparkles className="w-12 h-12 text-[#d4af37]" />
              </div>
            </div>
          ) : testers.length > 0 ? (
            <FadeInStagger>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {testers.map((tester) => (
                  <FadeInItem key={tester.id}>
                    <ProductCard product={tester} />
                  </FadeInItem>
                ))}
              </div>
            </FadeInStagger>
          ) : (
            <div className="text-center py-20">
              <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No testers available at the moment</p>
              <p className="text-slate-500 text-sm mt-2">Check back soon for exciting new fragrances to try</p>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <FadeInSection>
            <h2 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-[#d4af37] mb-3">🎁 Request Testers</h3>
                <p className="text-slate-300">
                  Browse our collection of premium fragrances and select the testers you'd like to try. Each tester contains 5ml of the full fragrance.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#d4af37] mb-3">💳 Pay Only Shipping</h3>
                <p className="text-slate-300">
                  The tester samples are completely free! You only pay for delivery charges to get them shipped to you.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#d4af37] mb-3">⏱️ Limited Quantity</h3>
                <p className="text-slate-300">
                  Each fragrance has limited tester samples available. We prioritize based on request date, so request yours today!
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#d4af37] mb-3">⭐ Share Feedback</h3>
                <p className="text-slate-300">
                  After receiving your testers, we'd love to hear your feedback. Your reviews help us improve and create fragrances you'll love.
                </p>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      <Footer />
    </div>
  )
}
