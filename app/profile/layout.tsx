import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Profile | BY12 Perfumes",
  description: "Manage your BY12 Perfumes account, addresses, and preferences.",
  robots: "noindex, nofollow",
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
