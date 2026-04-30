import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About BY12 Perfumes | Our Story & Mission",
  description: "Discover BY12 Perfumes - crafting luxury fragrances since 2015. Learn about our commitment to authentic premium scents and exceptional customer service.",
  keywords: "BY12 Perfumes, luxury perfumes Pakistan, authentic fragrances, premium scents, perfume brand story",
  alternates: {
    canonical: "https://bilalyousaf12.store/about",
  },
  openGraph: {
    title: "About BY12 Perfumes | Our Story & Mission",
    description: "Discover BY12 Perfumes - crafting luxury fragrances since 2015.",
    type: "website",
    url: "https://bilalyousaf12.store/about",
    images: ["/logo.png"],
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
