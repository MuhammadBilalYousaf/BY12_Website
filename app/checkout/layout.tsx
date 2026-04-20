import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Secure Checkout | BY12 Perfumes",
  description: "Complete your order securely. Cash on Delivery available across Pakistan.",
  robots: "noindex, nofollow",
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
