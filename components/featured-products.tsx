"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import ProductCard from "./product-card"
import type { Product } from "@/lib/types"
import { ChevronRight } from "lucide-react"
import { collection, query, where, onSnapshot, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { FadeInSection, FadeInStagger, FadeInItem } from "@/components/animated-section"

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Query for featured products from Firebase (simplified - no orderBy)
    const q = query(
      collection(db, "products"),
      where("featured", "==", true),
      limit(6)
    )
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const featuredProducts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]
        
        // Sort on client side instead
        featuredProducts.sort((a, b) => {
          const getDate = (timestamp: any): Date => {
            if (!timestamp) return new Date(0)
            if (timestamp.toDate) return timestamp.toDate()
            if (timestamp instanceof Date) return timestamp
            return new Date(timestamp)
          }
          
          const dateA = getDate(a.createdAt)
          const dateB = getDate(b.createdAt)
          return dateB.getTime() - dateA.getTime()
        })
        
        setProducts(featuredProducts)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching featured products:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <FadeInSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6 backdrop-blur-sm">
            <span className="text-accent text-sm font-medium tracking-wide uppercase">✨ Handpicked for You</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Featured{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent">
              Collection
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Explore our most loved fragrances, curated for discerning tastes
          </p>
        </FadeInSection>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
            <p className="mt-4 text-slate-400">Loading featured products...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <FadeInStagger className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-12">
              {products.map((product) => (
                <FadeInItem key={product.id}>
                  <ProductCard product={product} />
                </FadeInItem>
              ))}
            </FadeInStagger>

            <FadeInSection delay={0.3}>
              <div className="text-center">
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent/90 text-slate-900 font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
                >
                  View All Products 
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </FadeInSection>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex flex-col items-center gap-4 px-8 py-8 bg-slate-800/50 border border-slate-700 rounded-2xl backdrop-blur-sm">
              <p className="text-slate-300 text-lg">No featured products available at the moment.</p>
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-slate-900 font-semibold rounded-xl transition-all duration-300"
              >
                Browse All Products 
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
