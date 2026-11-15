import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About BY12 Perfumes | Our Story & Mission",
  description: "Discover the story of BY12 Perfumes, a Pakistan fragrance brand creating accessible, luxury-inspired scents for everyday confidence.",
  keywords: "BY12 Perfumes, luxury perfumes Pakistan, authentic fragrances, premium scents, perfume brand story",
  alternates: {
    canonical: "https://www.bilalyousaf12.store/about",
  },
  openGraph: {
    title: "About BY12 Perfumes | Our Story & Mission",
    description: "Discover the story behind BY12 inspired fragrances in Pakistan.",
    type: "website",
    url: "https://www.bilalyousaf12.store/about",
    images: ["/opengraph-image"],
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
