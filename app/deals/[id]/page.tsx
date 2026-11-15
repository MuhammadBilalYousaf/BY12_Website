import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import DealPageClient from "@/components/deal-page-client"
import { getActiveDeals } from "@/lib/catalog"
import { dealPath, pageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

async function resolveDeal(id: string) {
  const deals = await getActiveDeals()
  const deal = deals.find(item => item.id === id || dealPath(item) === `/deals/${id}`)
  if (!deal) notFound()
  if (dealPath(deal) !== `/deals/${id}`) permanentRedirect(dealPath(deal))
  return { deal, deals }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { deal } = await resolveDeal((await params).id)
  return pageMetadata({ title: deal.metaTitle || deal.title, description: deal.metaDescription || deal.description, path: dealPath(deal), image: deal.imageUrl })
}

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { deal, deals } = await resolveDeal((await params).id)
  return <DealPageClient key={deal.id} initialDeal={deal} initialDeals={deals} />
}
