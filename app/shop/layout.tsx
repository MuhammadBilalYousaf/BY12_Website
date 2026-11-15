import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Buy Perfumes Online in Pakistan | BY12",
  description: "Shop BY12 inspired perfumes for men and women in Pakistan. Compare available bottle sizes, current prices and perfume samples.",
  alternates: {
    canonical: "https://www.bilalyousaf12.store/shop",
  },
  openGraph: {
    title: "Buy Perfumes Online in Pakistan | BY12",
    description: "Shop BY12 inspired perfumes for men and women in Pakistan. Compare sizes, prices and availability.",
    type: "website",
    url: "https://www.bilalyousaf12.store/shop",
    images: ["/opengraph-image"],
  },
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
