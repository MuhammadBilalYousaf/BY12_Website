import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Perfume Blog | Fragrance Tips & Guides | BY12",
  description: "Explore our perfume blog for expert fragrance tips, seasonal scent guides, perfume history, and the latest trends in luxury fragrances.",
  keywords: "perfume blog, fragrance tips, how to choose perfume, perfume guides, scent trends, BY12 blog",
  alternates: {
    canonical: "https://bilalyousaf12.store/blog",
  },
  openGraph: {
    title: "Perfume Blog | Fragrance Tips & Guides | BY12",
    description: "Expert fragrance tips, guides, and the latest trends in luxury perfumes.",
    type: "website",
    url: "https://bilalyousaf12.store/blog",
    images: ["/luxury-perfume-collection.jpg"],
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
