import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shop Luxury Perfumes | BY12 Perfumes Collection",
  description: "Browse our exclusive collection of luxury perfumes for men and women. Find your signature scent from premium brands at BY12 Perfumes Pakistan.",
  keywords: "buy perfumes online Pakistan, luxury perfumes, men perfumes, women perfumes, unisex fragrances, BY12 shop",
  alternates: {
    canonical: "https://bilalyousaf12.store/shop",
  },
  openGraph: {
    title: "Shop Luxury Perfumes | BY12 Perfumes Collection",
    description: "Browse our exclusive collection of luxury perfumes for men and women.",
    type: "website",
    url: "https://bilalyousaf12.store/shop",
    images: ["/luxury-perfume-collection.jpg"],
  },
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
