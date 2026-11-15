import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import FeaturedProducts from "@/components/featured-products"
import FeaturedDeals from "@/components/featured-deals"
import FeaturedTesters from "@/components/featured-testers"
import Testimonials from "@/components/testimonials"
import FAQ from "@/components/faq"
import Footer from "@/components/footer"
import BlogSection from "@/components/blog-section"
import type { Metadata } from "next"
import { getProducts, getPublishedBlogs, getActiveDeals } from "@/lib/catalog"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "BY12 Perfumes | Inspired Fragrances in Pakistan",
  description: "Explore BY12 inspired perfumes for men and women in Pakistan. Compare Coffeeno and Ravla, choose your size and shop with Cash on Delivery.",
  keywords: "luxury perfumes Pakistan, buy perfumes online, men perfumes, women perfumes, BY12, authentic fragrances, premium scents, perfume shop Pakistan",
  openGraph: {
    title: "BY12 Perfumes | Inspired Fragrances in Pakistan",
    description: "Discover BY12's exclusive collection of luxury perfumes for men and women.",
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
    title: "BY12 Perfumes | Inspired Fragrances in Pakistan",
    description: "Discover BY12's exclusive collection of luxury perfumes.",
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
      <FeaturedDeals initialDeals={deals} />
      <FeaturedTesters initialTesters={products.filter(product => product.isTester).slice(0, 4)} />
      <BlogSection initialPosts={blogs} />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  )
}
