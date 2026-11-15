import Link from "next/link"
import type { Product } from "@/lib/types"

export default function PerfumeDiscovery({ products }: { products: Product[] }) {
  return <section aria-labelledby="perfume-discovery-heading" className="max-w-7xl mx-auto px-4 py-12 md:py-16">
    <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6 sm:p-8">
      <h2 id="perfume-discovery-heading" className="text-2xl md:text-3xl font-bold text-white mb-4">Find your BY12 perfume</h2>
      <p className="text-slate-300 leading-relaxed max-w-3xl">Buying perfume online in Pakistan starts with a scent you want to try. Explore BY12’s own inspired fragrances, read the product descriptions and compare the available bottle sizes and prices before ordering.</p>
      {!!products.length && <ul className="mt-5 space-y-3 text-accent">{products.map(product => <li key={product.id}><Link className="hover:underline" href={`/product/${product.id}`}>{product.name.split(/\s[-–—]\s/)[0]} perfume by {product.brand || "BY12"}<span className="text-slate-300"> — {product.name}</span></Link></li>)}</ul>}
      <nav aria-label="Choose a perfume" className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-accent">
        <Link className="hover:underline" href="/shop/men">Perfumes for men</Link>
        <Link className="hover:underline" href="/shop/women">Perfumes for women</Link>
        <Link className="hover:underline" href="/testers">Perfume testers and samples</Link>
        <Link className="hover:underline" href="/guides/coffeeno-vs-ravla">Coffeeno vs Ravla: compare the fragrances</Link>
      </nav>
    </div>
  </section>
}
