import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Refund & Return Policy | BY12 Perfumes",
  description: "Learn about our 7-day return policy and refund process. Easy returns for unopened products at BY12 Perfumes Pakistan.",
  keywords: "refund policy, return policy, BY12 returns, perfume refund, exchange policy",
  alternates: {
    canonical: "https://bilalyousaf12.store/refund",
  },
  openGraph: {
    title: "Refund & Return Policy | BY12 Perfumes",
    description: "Easy 7-day returns on unopened products at BY12 Perfumes.",
    type: "website",
    url: "https://bilalyousaf12.store/refund",
  },
}

export default function RefundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
