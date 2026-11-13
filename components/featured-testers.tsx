"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product } from "@/lib/types"
import ProductCard from "./product-card"
import { FadeInSection, FadeInStagger, FadeInItem } from "./animated-section"
import { Sparkles, ArrowRight } from "lucide-react"

export default function FeaturedTesters() {
  const [testers, setTesters] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

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
        
        // Sort by newest first, then limit to 4
        const sorted = testersData.sort((a, b) => {
          const timeA = a.createdAt?.toDate?.() || new Date(0)
          const timeB = b.createdAt?.toDate?.() || new Date(0)
          return timeB.getTime() - timeA.getTime()
        })
        
        setTesters(sorted.slice(0, 4))
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching featured testers:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  if (loading || testers.length === 0) {
    return null
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto">
        <FadeInSection>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-[#d4af37]" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Try Before You Buy
              </h2>
              <Sparkles className="w-6 h-6 text-[#d4af37]" />
            </div>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Discover our exclusive fragrance testers. Request your free 5ml samples and experience our premium scents risk-free. Only pay for delivery!
            </p>
          </div>

          {/* Testers Grid */}
          <FadeInStagger>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {testers.map((tester) => (
                <FadeInItem key={tester.id}>
                  <ProductCard product={tester} />
                </FadeInItem>
              ))}
            </div>
          </FadeInStagger>

          {/* Call to Action */}
          <div className="text-center">
            <Link
              href="/testers"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#d4af37] to-yellow-300 text-slate-900 rounded-lg font-bold hover:shadow-lg hover:shadow-[#d4af37]/50 transition-all hover:scale-105"
            >
              View All Testers
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Benefits Row */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FadeInStagger>
              <FadeInItem>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center hover:border-[#d4af37]/50 transition-colors">
                  <div className="text-3xl mb-3">🎁</div>
                  <h3 className="text-white font-semibold mb-2">Completely Free</h3>
                  <p className="text-slate-400 text-sm">
                    Get premium fragrance samples at no cost, pay only for delivery
                  </p>
                </div>
              </FadeInItem>

              <FadeInItem>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center hover:border-[#d4af37]/50 transition-colors">
                  <div className="text-3xl mb-3">📦</div>
                  <h3 className="text-white font-semibold mb-2">Easy Process</h3>
                  <p className="text-slate-400 text-sm">
                    Add testers to cart, checkout, and receive your samples at home
                  </p>
                </div>
              </FadeInItem>

              <FadeInItem>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center hover:border-[#d4af37]/50 transition-colors">
                  <div className="text-3xl mb-3">⭐</div>
                  <h3 className="text-white font-semibold mb-2">Quality Assured</h3>
                  <p className="text-slate-400 text-sm">
                    Same premium fragrances you'll find in our full bottles
                  </p>
                </div>
              </FadeInItem>
            </FadeInStagger>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
