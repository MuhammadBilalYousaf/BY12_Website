"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageBreadcrumb from "@/components/page-breadcrumb"
import { FadeInSection } from "@/components/animated-section"
import { BadgePercent, CalendarClock, Eye, Flame, ShoppingBag } from "lucide-react"
import { useDeals } from "@/lib/hooks/use-deals"
import { useCart } from "@/lib/contexts"
import type { Product } from "@/lib/types"
import Toast from "@/components/toast"
import { toSlug } from "@/lib/utils"

export default function DealsPage() {
  const { deals, loading } = useDeals()
  const { addItem } = useCart()
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const now = new Date()
  const activeDeals = deals.filter((deal) => {
    if (!deal.isActive) return false

    if (!deal.endDate) return true

    const endDate = deal.endDate?.toDate
      ? deal.endDate.toDate()
      : new Date(deal.endDate)

    return endDate >= now
  })

  const featuredDeals = activeDeals.filter((deal) => deal.featured)
  const regularDeals = activeDeals.filter((deal) => !deal.featured)
  const dealsToRender = [...featuredDeals, ...regularDeals]

  const openDealTarget = (dealId: string, dealTitle: string) => {
    router.push(`/deals/${toSlug(dealTitle) || dealId}`)
  }

  const showDealToast = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  const handleClaimDeal = async (
    e: React.MouseEvent,
    deal: {
      id: string
      title: string
      description: string
      includedItems?: string[]
      imageUrl: string
      images?: string[]
      originalPrice: number
      dealPrice: number
      featured?: boolean
    }
  ) => {
    e.stopPropagation()

    try {
      const productData: Product = {
        id: `deal-${deal.id}`,
        dealId: deal.id,
        isDeal: true,
        name: deal.title,
        brand: "BY12 Deals",
        category: "Deals",
        price: deal.dealPrice,
        originalPrice: deal.originalPrice,
        description: deal.description,
        includedItems: deal.includedItems,
        imageUrl: deal.imageUrl,
        images: deal.images,
        featured: !!deal.featured,
        inStock: true,
        status: "Active",
        altText: deal.title,
      }

      addItem(productData, 1)
      showDealToast(`${deal.title} added to cart`)
    } catch (error) {
      console.error("Failed to claim deal:", error)
      showDealToast("Failed to add deal to cart")
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <PageBreadcrumb items={[{ label: "Deals" }]} />
        </div>

        <section className="relative py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-16 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
            <FadeInSection>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full text-accent text-sm font-semibold mb-6">
                <BadgePercent className="w-4 h-4" />
                Limited-Time Savings
              </span>
            </FadeInSection>

            <FadeInSection delay={0.1}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Exclusive{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent">
                  Deals
                </span>
              </h1>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <p className="max-w-2xl mx-auto text-lg text-slate-300">
                Discover hand-picked fragrance offers with premium savings. Grab your favorites before these deals expire.
              </p>
            </FadeInSection>
          </div>
        </section>

        <section className="pb-16 md:pb-20">
          <div className="max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl overflow-hidden animate-pulse"
                    style={{
                      background: "linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <div className="h-56 bg-slate-700/50" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-slate-700/60 rounded w-1/2" />
                      <div className="h-4 bg-slate-700/60 rounded w-full" />
                      <div className="h-4 bg-slate-700/60 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : dealsToRender.length === 0 ? (
              <div
                className="rounded-2xl p-12 text-center"
                style={{
                  background: "linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Flame className="mx-auto mb-4 text-slate-500" size={44} />
                <h2 className="text-2xl font-bold text-white mb-2">No Active Deals Right Now</h2>
                <p className="text-slate-400 mb-6">New promotions are added frequently. Check back soon.</p>
                <Link
                  href="/shop"
                  className="inline-flex items-center px-6 py-3 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition shadow-lg shadow-accent/25"
                >
                  Explore Shop
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                {dealsToRender.map((deal, index) => {
                  const savingsAmount = Math.max(0, deal.originalPrice - deal.dealPrice)
                  const savingsPercent = Math.round((savingsAmount / deal.originalPrice) * 100)
                  const endDateText = deal.endDate
                    ? (deal.endDate?.toDate ? deal.endDate.toDate() : new Date(deal.endDate)).toLocaleDateString()
                    : null
                  const dealImages = Array.isArray(deal.images)
                    ? deal.images.filter((img): img is string => typeof img === "string" && img.trim().length > 0)
                    : []
                  const primaryImage = dealImages[0] || deal.imageUrl || "/placeholder.jpg"
                  const hoverImage = dealImages[1]

                  return (
                    <FadeInSection key={deal.id} delay={0.05 * index}>
                      <article
                        className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                        onClick={() => openDealTarget(deal.id, deal.title)}
                        style={{
                          background: "linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)",
                          boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                          border: deal.featured
                            ? "1px solid rgba(250, 204, 21, 0.45)"
                            : "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <div className="relative h-56 overflow-hidden">
                          <Image
                            src={primaryImage}
                            alt={deal.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className={`object-cover transition-all duration-700 ease-in-out group-hover:scale-110 ${hoverImage ? "group-hover:opacity-0" : ""}`}
                          />
                          {hoverImage && (
                            <Image
                              src={hoverImage}
                              alt={`${deal.title} alternate view`}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-110"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                              {deal.badge || `${savingsPercent}% OFF`}
                            </span>
                            {deal.featured && (
                              <span className="px-3 py-1 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full shadow-lg">
                                Featured
                              </span>
                            )}
                          </div>

                          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 hidden md:flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                openDealTarget(deal.id, deal.title)
                              }}
                              className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-accent hover:border-accent hover:text-slate-900 transition-all duration-300 transform hover:scale-110"
                              aria-label="View deal"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleClaimDeal(e, deal)}
                              className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-accent hover:border-accent hover:text-slate-900 transition-all duration-300 transform hover:scale-110"
                              aria-label="Claim deal"
                            >
                              <ShoppingBag className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{deal.title}</h3>
                          <p className="text-sm text-slate-400 mb-4 line-clamp-2">{deal.description}</p>

                          {Array.isArray(deal.includedItems) && deal.includedItems.length > 0 && (
                            <div className="mb-4 rounded-lg border border-slate-700/70 bg-slate-900/40 p-2.5">
                              <p className="text-[11px] uppercase tracking-wide text-accent font-semibold mb-1">Includes</p>
                              <p className="text-xs text-slate-200 line-clamp-2">
                                {deal.includedItems.slice(0, 2).join(" | ")}
                              </p>
                            </div>
                          )}

                          <div className="mb-4">
                            <p className="text-xs text-slate-500 line-through">Rs. {deal.originalPrice.toFixed(2)}</p>
                            <div className="flex items-end gap-2">
                              <p className="text-2xl font-bold text-accent">Rs. {deal.dealPrice.toFixed(2)}</p>
                              <p className="text-sm text-green-400 font-semibold">Save Rs. {savingsAmount.toFixed(2)}</p>
                            </div>
                          </div>

                          {endDateText && (
                            <div className="inline-flex items-center gap-2 text-xs text-slate-300 bg-slate-700/40 px-2.5 py-1.5 rounded-lg mb-4">
                              <CalendarClock size={14} className="text-accent" />
                              Ends on {endDateText}
                            </div>
                          )}

                          <div>
                            <button
                              type="button"
                              onClick={(e) => handleClaimDeal(e, deal)}
                              className="inline-flex w-full justify-center px-4 py-2.5 bg-accent text-slate-900 rounded-lg font-semibold group-hover:bg-accent/90 transition"
                            >
                              Claim Deal
                            </button>
                          </div>
                        </div>
                      </article>
                    </FadeInSection>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
      <Footer />
    </>
  )
}
