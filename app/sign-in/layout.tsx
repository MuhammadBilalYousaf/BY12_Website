import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In | BY12 Perfumes",
  description: "Sign in to your BY12 Perfumes account to view orders, wishlist, and exclusive offers.",
  robots: "noindex, nofollow",
}

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
