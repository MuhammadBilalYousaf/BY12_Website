import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Become a Tester | BY12 Perfumes",
  description: "Join our exclusive tester program and discover new fragrances before anyone else. Share your feedback and get rewarded!",
}

export default function TesterRequestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
