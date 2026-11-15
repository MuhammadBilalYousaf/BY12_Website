import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free Fragrance Testers | BY12 Perfume",
  description: "Explore BY12 perfume samples in Pakistan. Check tester sizes and stock before ordering. Delivery charges apply.",
  alternates: { canonical: "https://www.bilalyousaf12.store/testers" },
  keywords: "fragrance testers, perfume samples, free samples, fragrance trial",
  openGraph: {
    title: "Free Fragrance Testers | BY12 Perfume",
    description: "Request free fragrance samples and testers. Try our exclusive perfumes before buying.",
  },
}

export default function TestersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
