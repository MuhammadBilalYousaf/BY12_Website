"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageBreadcrumb from "@/components/page-breadcrumb"
import Toast from "@/components/toast"
import DealDetailsExtras from "@/components/deal-details-extras"
import { useDeals } from "@/lib/hooks/use-deals"
import { useCart } from "@/lib/contexts"
import type { Deal, Product } from "@/lib/types"
import { ArrowLeft, CalendarClock, ShoppingCart } from "lucide-react"
import { toSlug } from "@/lib/utils"

interface DealDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function DealDetailsPage({ params }: DealDetailsPageProps) {
  const { id } = React.use(params)
  const router = useRouter()
  const { deals, loading } = useDeals()
  const { addItem } = useCart()
  const [showToast, setShowToast] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState("")

  const deal = deals.find((item) => toSlug(item.title) === id || item.id === id)

  const showDealToast = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  const handleClaimDeal = (selectedDeal?: Deal) => {
    const activeDeal = selectedDeal || deal
    if (!activeDeal) return

    const productData: Product = {
      id: `deal-${activeDeal.id}`,
      dealId: activeDeal.id,
      isDeal: true,
      name: activeDeal.title,
      brand: "BY12 Deals",
      category: "Deals",
      price: activeDeal.dealPrice,
      originalPrice: activeDeal.originalPrice,
      description: activeDeal.description,
      includedItems: activeDeal.includedItems,
      imageUrl: activeDeal.imageUrl,
      images: activeDeal.images,
      featured: !!activeDeal.featured,
      inStock: true,
      status: "Active",
      altText: activeDeal.title,
    }

    addItem(productData, 1)
    showDealToast(`${activeDeal.title} added to cart`)
  }

  const getDealHref = (item: Deal) => `/deals/${toSlug(item.title) || item.id}`

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <PageBreadcrumb items={[{ label: "Deals", href: "/deals" }, { label: deal?.title || "Deal" }]} />
        </div>

        {loading ? (
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="animate-pulse rounded-2xl h-[420px] bg-slate-700/50" />
          </div>
        ) : !deal ? (
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold text-white mb-3">Deal Not Found</h1>
            <p className="text-slate-400 mb-6">This deal does not exist or has been removed.</p>
            <Link
              href="/deals"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition"
            >
              <ArrowLeft size={16} /> Back to Deals
            </Link>
          </div>
        ) : (
          <section className="max-w-7xl mx-auto px-4 pb-16">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative min-h-[320px] md:min-h-[520px]">
                  <Image
                    src={deal.images?.[0] || deal.imageUrl || "/placeholder.jpg"}
                    alt={deal.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>

                <div className="p-6 md:p-10">
                  <span className="inline-flex px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full mb-4">
                    {deal.badge || "Deal"}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{deal.title}</h1>
                  <p className="text-slate-300 mb-6 leading-relaxed">{deal.description}</p>

                  {Array.isArray(deal.includedItems) && deal.includedItems.length > 0 && (
                    <div className="mb-6 rounded-xl border border-slate-600/70 bg-slate-900/40 p-4">
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-accent mb-3">What this deal includes</h2>
                      <ul className="space-y-2">
                        {deal.includedItems.map((item, index) => (
                          <li key={`${item}-${index}`} className="text-slate-200 text-sm leading-relaxed flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mb-5">
                    <p className="text-sm text-slate-500 line-through">Rs. {deal.originalPrice.toFixed(2)}</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-bold text-accent">Rs. {deal.dealPrice.toFixed(2)}</p>
                      <p className="text-sm text-green-400 font-semibold">
                        Save Rs. {(deal.originalPrice - deal.dealPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {deal.endDate && (
                    <div className="inline-flex items-center gap-2 text-xs text-slate-300 bg-slate-700/40 px-2.5 py-1.5 rounded-lg mb-6">
                      <CalendarClock size={14} className="text-accent" />
                      Ends on {(deal.endDate?.toDate ? deal.endDate.toDate() : new Date(deal.endDate)).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleClaimDeal()}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition"
                    >
                      <ShoppingCart size={18} /> Claim Deal
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/deals")}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition"
                    >
                      Back to Deals
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <DealDetailsExtras
              deals={deals}
              currentDealId={deal.id}
              onClaimDeal={handleClaimDeal}
              getDealHref={getDealHref}
            />
          </section>
        )}
      </main>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
      <Footer />
    </>
  )
}
