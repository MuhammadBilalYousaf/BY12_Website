import { notFound, permanentRedirect } from "next/navigation"
import { getActiveDeals } from "@/lib/catalog"
import { dealPath } from "@/lib/seo"

export default async function DealLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params
  const deal = (await getActiveDeals()).find(item => item.id === id || dealPath(item) === `/deals/${id}`)
  if (!deal) notFound()
  if (dealPath(deal) !== `/deals/${id}`) permanentRedirect(dealPath(deal))
  return children
}
