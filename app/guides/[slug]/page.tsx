import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageBreadcrumb from "@/components/page-breadcrumb"
import { BreadcrumbSchema } from "@/components/seo-schemas"
import BottleComparison from "@/components/bottle-comparison"
import { getProducts } from "@/lib/catalog"
import { GUIDES, bottleOptions } from "@/lib/buying-guide"
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo"
import type { Product } from "@/lib/types"

export const dynamic = "force-dynamic"

function guideFor(slug: string) {
  const guide = GUIDES.find(item => item.slug === slug)
  if (!guide) notFound()
  return guide
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const guide = guideFor((await params).slug)
  return pageMetadata({ title: guide.title, description: guide.description, path: `/guides/${guide.slug}`, type: "article" })
}

function ProductLinks({ products }: { products: Product[] }) {
  return <ul className="space-y-3">{products.map(product => <li key={product.id}><Link className="text-accent hover:underline" href={`/product/${product.id}`}>{product.name}</Link><span className="text-slate-400"> — {bottleOptions(product).map(option => `${option.size}ml`).join(" / ") || "View current options"}</span></li>)}</ul>
}

function BottleSizeGuide({ products }: { products: Product[] }) {
  return <>
    <p>A bottle-size decision is a trade-off between upfront cost and how much fragrance you want to buy. If you are choosing between a 30ml and 50ml BY12 perfume, compare the actual size prices on the product page. The bottle with the lowest total price is not always the one with the lowest price per ml.</p>
    <section><h2>What is the difference between 30ml and 50ml?</h2><p>A 50ml bottle contains 20ml more fragrance than a 30ml bottle. That is about 67% more volume. This does not mean it lasts 67% longer on your skin: bottle volume and fragrance performance are different things. How long the bottle lasts also depends on how much you apply and how often you wear it.</p></section>
    <section><h2>Compare current BY12 size prices</h2><p>The tables below use the current catalog’s size prices, including a listed size sale when one is active. Price per ml is the bottle price divided by its stated volume. Delivery is separate and appears at checkout.</p>
      <div className="space-y-8 mt-6">{products.filter(product => bottleOptions(product).length).map(product => <section key={product.id}><h3><Link href={`/product/${product.id}`}>{product.name}</Link></h3><BottleComparison product={product} /></section>)}</div>
    </section>
    <section><h2>When a smaller bottle can make sense</h2><p>A smaller bottle can be a practical choice if you want to spend less upfront, rotate between several fragrances or decide how often you will reach for a scent. Compare the actual price before choosing; a sale can change which size suits your budget.</p><p>If you have never tried the fragrance, a smaller full bottle is still a purchase commitment. Check <Link href="/testers">BY12 testers</Link> for any available sample first. Read its stated size and stock status, and remember that delivery charges can apply to a free sample.</p></section>
    <section><h2>When to consider a larger bottle</h2><p>If you already enjoy a fragrance and wear it regularly, a larger bottle may offer a lower price per ml. Use the comparison rather than assuming it will always be better value. Both the bottle price and the total with delivery should fit your budget.</p></section>
    <section><h2>Check these details before ordering</h2><ul><li>Confirm the selected size and its current price.</li><li>Check availability for that size, rather than the product’s overall stock.</li><li>Review the cart’s delivery charge and final total.</li><li>Read the <Link href="/refund">return policy</Link> before opening or using a product you may wish to return.</li></ul><p>Once you have chosen, open the size link in the table to view that option on its product page. If you need help, <Link href="/contact">contact BY12</Link> before placing the order.</p></section>
  </>
}

function InspiredGuide({ products }: { products: Product[] }) {
  return <>
    <p>BY12 sells its own inspired fragrances in Pakistan. On a BY12 product page, a phrase such as “inspired by” or “impression of” identifies the fragrance being referenced. The product brand you are buying is BY12. This distinction helps you understand the listing before comparing scent descriptions, bottle sizes and prices.</p>
    <section><h2>Read the product name and brand together</h2><p>Start with the BY12 fragrance name, then read the inspiration reference and the description beneath it. An inspiration name helps explain how the product is presented; it does not establish a specific similarity percentage, identical ingredients or a guaranteed wear time. If you need more detail about the reference, ask BY12 before ordering.</p><p>These are the current full-bottle products to explore:</p><ProductLinks products={products} /></section>
    <section><h2>Choose by the details that matter to you</h2><p>Look for the scent description and any notes actually listed for the product. Decide whether that description sounds like something you would enjoy wearing. A category such as men or women is a way to browse the catalog; your personal preference is still part of the choice.</p><p>Scent notes describe an aroma profile. They are not the same as an ingredient or allergen declaration. Contact BY12 for product-specific information if that is important to your purchase.</p></section>
    <section><h2>Try an available sample before a full bottle</h2><p>Check the <Link href="/testers">testers collection</Link> for a sample of the fragrance you are considering. Use the size and availability shown on that sample’s page. An out-of-stock sample is not ready to order, and a free sample can still have a delivery charge.</p><p>Sampling is a way to decide whether you enjoy the fragrance yourself. Avoid assuming another person’s review guarantees the same experience for you: preference and perceived performance can vary.</p></section>
    <section><h2>Compare bottle sizes using the current price</h2><p>When more than one size is listed, compare both the upfront amount and the price per ml. Our <Link href="/guides/30ml-vs-50ml-perfume">30ml vs 50ml perfume guide</Link> uses the catalog’s current size prices. Select your preferred size on the product page and check the cart total before ordering.</p></section>
    <section><h2>Know the order terms before buying</h2><p>Review availability, delivery charges and the <Link href="/refund">return policy</Link>. You can also <Link href="/about">read BY12’s story</Link> or <Link href="/contact">contact the brand</Link> with questions about a product. Clear product information is more useful for your decision than a broad claim that every inspired fragrance suits everyone.</p></section>
  </>
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = guideFor((await params).slug)
  const products = (await getProducts()).filter(product => !product.isTester)
  const path = `/guides/${guide.slug}`
  const article = { "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.description, mainEntityOfPage: absoluteUrl(path), image: absoluteUrl("/opengraph-image"), author: { "@type": "Organization", name: "BY12 Perfumes", url: absoluteUrl("/about") }, publisher: { "@type": "Organization", "@id": absoluteUrl("/#organization"), name: "BY12 Perfumes" }, inLanguage: "en" }
  return <><Navbar /><main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(article) }} />
    <BreadcrumbSchema items={[{ name: "Buying Guides", url: "/guides" }, { name: guide.title }]} />
    <div className="max-w-5xl mx-auto px-4 py-8"><PageBreadcrumb items={[{ label: "Buying Guides", href: "/guides" }, { label: guide.title }]} /></div>
    <article className="max-w-4xl mx-auto px-4 pb-16">
      <header className="py-6 mb-8 border-b border-slate-700"><p className="text-accent text-sm uppercase tracking-widest mb-4">BY12 buying guide</p><h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-5">{guide.title}</h1><p className="text-lg text-slate-300 leading-relaxed">{guide.description}</p></header>
      <div className="text-slate-300 leading-relaxed space-y-6 [&_section]:space-y-4 [&_section]:pt-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_a]:text-accent [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2">
        {guide.slug === "30ml-vs-50ml-perfume" ? <BottleSizeGuide products={products} /> : <InspiredGuide products={products} />}
      </div>
      <nav aria-label="Related buying guides" className="mt-12 pt-6 border-t border-slate-700 flex flex-col gap-3 text-accent">{GUIDES.filter(item => item.slug !== guide.slug).map(item => <Link className="hover:underline" key={item.slug} href={`/guides/${item.slug}`}>{item.title} →</Link>)}<Link href="/shop" className="hover:underline">Explore the BY12 collection →</Link></nav>
    </article>
  </main><Footer /></>
}
