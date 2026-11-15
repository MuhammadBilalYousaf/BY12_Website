import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import FeaturedProducts from "@/components/featured-products"
import FeaturedDeals from "@/components/featured-deals"
import FeaturedTesters from "@/components/featured-testers"
import Testimonials from "@/components/testimonials"
import FAQ from "@/components/faq"
import Footer from "@/components/footer"
import BlogSection from "@/components/blog-section"
import PerfumeDiscovery from "@/components/perfume-discovery"
import type { Metadata } from "next"
import { getProducts, getPublishedBlogs, getActiveDeals } from "@/lib/catalog"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Inspired Perfumes in Pakistan | BY12 Perfumes",
  description: "Explore BY12 inspired perfumes for men and women in Pakistan. Compare Coffeeno and Ravla, choose your size and shop with Cash on Delivery.",
  openGraph: {
    title: "Inspired Perfumes in Pakistan | BY12 Perfumes",
    description: "Explore BY12 inspired perfumes for men and women in Pakistan. Compare Coffeeno and Ravla, bottle sizes and current prices.",
    url: "https://www.bilalyousaf12.store",
    siteName: "BY12 Perfumes",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "BY12 Premium Perfume Collection",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inspired Perfumes in Pakistan | BY12 Perfumes",
    description: "Explore BY12 inspired perfumes in Pakistan. Compare Coffeeno and Ravla, bottle sizes and available testers.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: "https://www.bilalyousaf12.store",
  },
}

export default async function Home() {
  const [products, blogs, deals] = await Promise.all([getProducts(), getPublishedBlogs(), getActiveDeals()])
  return (
    <main>
      <div className="w-full overflow-hidden bg-accent text-slate-900 border-y border-accent/70 py-2">
        <div className="home-marquee-track" aria-label="Shipping announcement">
          <span className="home-marquee-text">Free Shipping on orders over Rs.4000/- • Free Shipping on orders over Rs.4000/- • Free Shipping on orders over Rs.4000/- •</span>
          <span className="home-marquee-text" aria-hidden="true">Free Shipping on orders over Rs.4000/- • Free Shipping on orders over Rs.4000/- • Free Shipping on orders over Rs.4000/- •</span>
        </div>
      </div>
      <Navbar />
      <Hero />
      <FeaturedProducts initialProducts={products.filter(product => product.featured).slice(0, 6)} />
      <PerfumeDiscovery products={products.filter(product => !product.isTester)} />
      <FeaturedDeals initialDeals={deals} />
      <FeaturedTesters initialTesters={products.filter(product => product.isTester).slice(0, 4)} />
      <BlogSection initialPosts={blogs} />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  )
}
