import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shopping Cart | BY12 Perfumes",
  description: "Review your shopping cart and proceed to checkout. Free shipping on orders over Rs.4000.",
  robots: "noindex, nofollow",
}

export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
