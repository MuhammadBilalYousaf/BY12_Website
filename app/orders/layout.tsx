import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Orders | BY12 Perfumes",
  description: "View your order history and track current orders at BY12 Perfumes.",
  robots: "noindex, nofollow",
}

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
