import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Order Confirmation | BY12 Perfumes",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export default function OrderConfirmationLayout({ children }: { children: React.ReactNode }) {
  return children
}
