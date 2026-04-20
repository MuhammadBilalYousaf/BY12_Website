import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Wishlist | BY12 Perfumes",
  description: "View and manage your saved perfumes. Add your favorite fragrances to cart when you're ready.",
  robots: "noindex, nofollow",
}

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
