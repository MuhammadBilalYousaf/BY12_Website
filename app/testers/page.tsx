import { getProducts } from "@/lib/catalog"
import TestersPageClient from "@/components/testers-page-client"
export const dynamic = "force-dynamic"
export default async function TestersPage() {
  return <TestersPageClient initialTesters={(await getProducts()).filter(product => product.isTester)} />
}
