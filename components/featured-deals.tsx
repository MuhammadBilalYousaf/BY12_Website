"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Clock3, Flame } from "lucide-react"
import { useDeals } from "@/lib/hooks/use-deals"
import { FadeInItem, FadeInSection, FadeInStagger } from "@/components/animated-section"
import { toSlug } from "@/lib/utils"

function isDealActive(endDate: any) {
  if (!endDate) return true

  const parsedEndDate = endDate?.toDate ? endDate.toDate() : new Date(endDate)
  return parsedEndDate >= new Date()
}

export default function FeaturedDeals() {
  const { deals, loading } = useDeals()

  const featuredDeals = deals
    .filter((deal) => deal.featured && deal.isActive && isDealActive(deal.endDate))
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, 4)

  if (!loading && featuredDeals.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-12 right-16 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-16 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <FadeInSection className="text-center mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full mb-6 text-red-300 text-sm font-semibold">
            <Flame size={16} /> Limited-Time Picks
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5">
            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-accent to-yellow-400">Deals</span>
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Freshly selected discounts on premium fragrances. Claim before they expire.
          </p>
        </FadeInSection>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-xl overflow-hidden animate-pulse border border-slate-700/60 bg-slate-800/40">
                <div className="h-48 bg-slate-700/60" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-2/3 rounded bg-slate-700/70" />
                  <div className="h-3 w-full rounded bg-slate-700/70" />
                  <div className="h-8 w-full rounded bg-slate-700/70" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <FadeInStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredDeals.map((deal) => {
                const savingsAmount = Math.max(0, deal.originalPrice - deal.dealPrice)
                const savingsPercent = deal.originalPrice > 0
                  ? Math.round((savingsAmount / deal.originalPrice) * 100)
                  : 0
                const href = `/deals/${toSlug(deal.title) || deal.id}`
                const image = deal.images?.[0] || deal.imageUrl || "/placeholder.jpg"
                const endDateText = deal.endDate
                  ? (deal.endDate?.toDate ? deal.endDate.toDate() : new Date(deal.endDate)).toLocaleDateString()
                  : null

                return (
                  <FadeInItem key={deal.id}>
                    <article className="rounded-xl overflow-hidden border border-slate-700/70 bg-slate-800/50 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1">
                      <Link href={href} className="block relative h-48 overflow-hidden">
                        <Image
                          src={image}
                          alt={deal.title}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                          {deal.badge || `${savingsPercent}% OFF`}
                        </span>
                      </Link>

                      <div className="p-4">
                        <Link href={href} className="block mb-2">
                          <h3 className="text-white font-semibold line-clamp-2 hover:text-accent transition">
                            {deal.title}
                          </h3>
                        </Link>

                        <div className="mb-3">
                          <p className="text-xs text-slate-500 line-through">Rs. {deal.originalPrice.toFixed(2)}</p>
                          <div className="flex items-end justify-between gap-2">
                            <p className="text-lg font-bold text-accent">Rs. {deal.dealPrice.toFixed(2)}</p>
                            <p className="text-xs text-green-400 font-semibold">Save Rs. {savingsAmount.toFixed(2)}</p>
                          </div>
                        </div>

                        {endDateText && (
                          <p className="inline-flex items-center gap-1.5 text-xs text-slate-300 mb-4">
                            <Clock3 size={13} className="text-accent" /> Ends on {endDateText}
                          </p>
                        )}

                        <Link
                          href={href}
                          className="inline-flex w-full justify-center items-center px-4 py-2.5 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition"
                        >
                          View Deal
                        </Link>
                      </div>
                    </article>
                  </FadeInItem>
                )
              })}
            </FadeInStagger>

            <FadeInSection delay={0.2}>
              <div className="text-center mt-10">
                <Link
                  href="/deals"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 border border-accent/40 text-accent rounded-xl font-semibold hover:bg-accent/10 transition"
                >
                  See All Deals
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </FadeInSection>
          </>
        )}
      </div>
    </section>
  )
}
