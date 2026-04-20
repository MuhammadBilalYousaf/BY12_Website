"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { CalendarClock, ChevronLeft, ChevronRight, Flame, Sparkles, Truck } from "lucide-react"
import { FadeInSection } from "@/components/animated-section"
import type { Deal } from "@/lib/types"

interface DealDetailsExtrasProps {
  deals: Deal[]
  currentDealId: string
  onClaimDeal: (deal: Deal) => void
  getDealHref: (deal: Deal) => string
}

function isDealActive(deal: Deal, now: Date) {
  if (!deal.isActive) return false
  if (!deal.endDate) return true

  const endDate = deal.endDate?.toDate ? deal.endDate.toDate() : new Date(deal.endDate)
  return endDate >= now
}

export default function DealDetailsExtras({ deals, currentDealId, onClaimDeal, getDealHref }: DealDetailsExtrasProps) {
  const relatedDealsScrollRef = useRef<HTMLDivElement>(null)
  const now = new Date()
  const relatedDeals = deals
    .filter((item) => item.id !== currentDealId && isDealActive(item, now))
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
    .slice(0, 4)

  const scrollRelatedDeals = (direction: "left" | "right") => {
    const container = relatedDealsScrollRef.current
    if (!container) return

    const scrollAmount = Math.max(280, Math.floor(container.clientWidth * 0.8))
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <div className="mt-12 space-y-8">
      <FadeInSection>
        <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-accent/10 via-yellow-400/10 to-transparent border border-accent/20">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Why This Deal Is Worth <span className="text-accent">Claiming</span>
          </h2>
          <p className="text-slate-300 mb-6">Premium fragrances, limited-time pricing, and fast delivery to your doorstep.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl p-4 bg-slate-900/40 border border-slate-700/60">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mb-3">
                <Flame className="text-red-400" size={18} />
              </div>
              <h3 className="text-white font-semibold mb-1">Limited-Time Pricing</h3>
              <p className="text-sm text-slate-400">Deals are refreshed often and can expire quickly.</p>
            </div>

            <div className="rounded-xl p-4 bg-slate-900/40 border border-slate-700/60">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3">
                <Truck className="text-emerald-400" size={18} />
              </div>
              <h3 className="text-white font-semibold mb-1">Fast Shipping</h3>
              <p className="text-sm text-slate-400">Quick dispatch with tracked delivery support.</p>
            </div>

            <div className="rounded-xl p-4 bg-slate-900/40 border border-slate-700/60 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-3">
                <Sparkles className="text-accent" size={18} />
              </div>
              <h3 className="text-white font-semibold mb-1">Curated Selection</h3>
              <p className="text-sm text-slate-400">Only standout picks from our best fragrance lines.</p>
            </div>
          </div>
        </div>
      </FadeInSection>

      {relatedDeals.length > 0 && (
        <FadeInSection>
          <div className="border-t border-slate-700 pt-10">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <CalendarClock size={18} className="text-accent" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  More Deals You May <span className="text-accent">Love</span>
                </h2>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollRelatedDeals("left")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-800/70 text-white hover:border-accent hover:text-accent transition"
                  aria-label="Scroll related deals left"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRelatedDeals("right")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-800/70 text-white hover:border-accent hover:text-accent transition"
                  aria-label="Scroll related deals right"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div
              ref={relatedDealsScrollRef}
              className="-mx-4 px-4 overflow-x-auto pb-2 snap-x snap-mandatory md:mx-0 md:px-0"
            >
              <div className="flex gap-4 md:gap-5">
              {relatedDeals.map((deal) => {
                const primaryImage = deal.images?.[0] || deal.imageUrl || "/placeholder.jpg"
                const savings = Math.max(0, deal.originalPrice - deal.dealPrice)

                return (
                  <article
                    key={deal.id}
                    className="w-[82vw] max-w-[320px] shrink-0 snap-start rounded-xl overflow-hidden bg-slate-800/50 border border-slate-700/60 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 sm:w-[340px] md:w-[300px] lg:w-[280px]"
                  >
                    <Link href={getDealHref(deal)} className="block relative h-44 overflow-hidden">
                      <Image
                        src={primaryImage}
                        alt={deal.title}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        {deal.badge || "Deal"}
                      </span>
                    </Link>

                    <div className="p-4">
                      <Link href={getDealHref(deal)} className="block">
                        <h3 className="text-white font-semibold line-clamp-2 mb-2 hover:text-accent transition">
                          {deal.title}
                        </h3>
                      </Link>

                      <div className="mb-3">
                        <p className="text-xs text-slate-500 line-through">Rs. {deal.originalPrice.toFixed(2)}</p>
                        <div className="flex items-end justify-between gap-2">
                          <p className="text-lg font-bold text-accent">Rs. {deal.dealPrice.toFixed(2)}</p>
                          <p className="text-xs text-green-400 font-semibold">Save Rs. {savings.toFixed(2)}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onClaimDeal(deal)}
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition"
                      >
                        Claim This Deal
                      </button>
                    </div>
                  </article>
                )
              })}
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-3">Swipe on mobile or use arrows on larger screens</p>
          </div>
        </FadeInSection>
      )}
    </div>
  )
}
