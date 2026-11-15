import { getActiveDeals } from "@/lib/catalog"
import DealsListClient from "@/components/deals-list-client"
export const dynamic = "force-dynamic"
export default async function DealsPage() {
  return <DealsListClient initialDeals={await getActiveDeals()} />
}
