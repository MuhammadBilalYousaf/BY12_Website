import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Perfume Testers & Samples in Pakistan | BY12",
  description: "Explore BY12 perfume testers and samples in Pakistan. Check Coffeeno and Ravla sample sizes and stock before ordering. Delivery charges apply.",
  path: "/testers",
})

export default function TestersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
