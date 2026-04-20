import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Unsubscribe | BY12 Perfumes",
  description: "Unsubscribe from BY12 Perfumes newsletter and marketing emails.",
  robots: "noindex, nofollow",
}

export default function UnsubscribeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
