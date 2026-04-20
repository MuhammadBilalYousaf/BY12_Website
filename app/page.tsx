import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import FeaturedProducts from "@/components/featured-products"
import FeaturedDeals from "@/components/featured-deals"
import Testimonials from "@/components/testimonials"
import FAQ from "@/components/faq"
import Footer from "@/components/footer"
import BlogSection from "@/components/blog-section"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "BY12 Perfumes | Luxury Fragrances in Pakistan",
  description: "Discover BY12's exclusive collection of luxury perfumes for men and women. Premium fragrances, authentic scents, and fast delivery across Pakistan. Shop now for your signature scent.",
  keywords: "luxury perfumes Pakistan, buy perfumes online, men perfumes, women perfumes, BY12, authentic fragrances, premium scents, perfume shop Pakistan",
  openGraph: {
    title: "BY12 Perfumes | Luxury Fragrances in Pakistan",
    description: "Discover BY12's exclusive collection of luxury perfumes for men and women.",
    url: "https://bilalyousaf12.store",
    siteName: "BY12 Perfumes",
    images: [
      {
        url: "/luxury-perfume-collection.jpg",
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
    title: "BY12 Perfumes | Luxury Fragrances in Pakistan",
    description: "Discover BY12's exclusive collection of luxury perfumes.",
    images: ["/luxury-perfume-collection.jpg"],
  },
  alternates: {
    canonical: "https://bilalyousaf12.store",
  },
}

export default function Home() {
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
      <FeaturedProducts />
      <FeaturedDeals />
      <BlogSection />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  )
}
