import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Track Your Order | BY12 Perfumes",
  description: "Track the status of your BY12 Perfumes order. Enter your order ID to see real-time delivery updates.",
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  keywords: "track order, order status, delivery tracking, BY12 order tracking",
  alternates: {
    canonical: "https://www.bilalyousaf12.store/track-order",
  },
  openGraph: {
    title: "Track Your Order | BY12 Perfumes",
    description: "Track your BY12 Perfumes order status in real-time.",
    type: "website",
    url: "https://www.bilalyousaf12.store/track-order",
  },
}

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
