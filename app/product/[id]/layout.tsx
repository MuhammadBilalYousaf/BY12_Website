import type { Metadata } from "next"

interface ProductLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  
  // Return default metadata - dynamic SEO is handled client-side
  // For full server-side SEO, configure Firebase Admin with service account credentials
  return {
    title: "Product Details | BY12 Perfumes",
    description: "Discover luxury fragrances from BY12 Perfumes Pakistan. Premium quality perfumes at affordable prices.",
    alternates: {
      canonical: `https://bilalyousaf12.store/product/${id}`,
    },
    openGraph: {
      title: "Product Details | BY12 Perfumes",
      description: "Discover luxury fragrances from BY12 Perfumes Pakistan.",
      type: "website",
      url: `https://bilalyousaf12.store/product/${id}`,
      images: ["/luxury-perfume-collection.jpg"],
    },
  }
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return children
}
