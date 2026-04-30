import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Best Perfume Deals | BY12 Exclusive Offers",
  description:
    "Shop limited-time BY12 perfume deals with premium savings on top fragrances for men, women, and unisex collections.",
  keywords: "perfume deals, fragrance offers, discounted perfumes, BY12 sale, luxury perfume Pakistan",
  alternates: {
    canonical: "https://bilalyousaf12.store/deals",
  },
  openGraph: {
    title: "Best Perfume Deals | BY12 Exclusive Offers",
    description: "Discover limited-time perfume deals and save on premium BY12 fragrances.",
    type: "website",
    url: "https://bilalyousaf12.store/deals",
    images: ["/logo.png"],
  },
}

export default function DealsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
