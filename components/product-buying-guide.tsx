import Link from "next/link"
import type { Product } from "@/lib/types"
import { bottleOptions, listedNotes, matchingTesters } from "@/lib/buying-guide"
import BottleComparison from "@/components/bottle-comparison"
import { categoryPath } from "@/lib/seo"

export default function ProductBuyingGuide({ product, relatedProducts }: { product: Product; relatedProducts: Product[] }) {
  const notes = listedNotes(product)
  const testers = matchingTesters(product, relatedProducts)
  const hasNotes = Object.values(notes).some(values => values.length)
  const options = bottleOptions(product)
  return <section aria-label="Buying advice" className="max-w-7xl mx-auto px-4 pb-12">
    <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-5 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Before you choose {product.name.split(/\s[-–—]\s/)[0]}</h2>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">{product.isTester ? "Sample size and availability" : "Compare bottle sizes"}</h3>
          <BottleComparison product={product} />
          <p className="text-sm text-slate-400 mt-3">Price per ml compares the fragrance volume in each bottle. Delivery charges are shown separately at checkout.</p>
          {!product.isTester && options.length > 1 && <p className="text-slate-300 mt-3">Choose a smaller bottle for a lower upfront spend, or compare the larger bottle’s price per ml if you already know you enjoy this scent. <Link href="/guides/30ml-vs-50ml-perfume" className="text-accent hover:underline">Read our bottle-size guide.</Link></p>}
          {hasNotes && <div className="mt-6"><h3 className="text-lg font-semibold text-white mb-2">Listed scent notes</h3>
            <dl className="space-y-2 text-slate-300">{([['Top', notes.top], ['Heart', notes.middle], ['Base', notes.base]] as const).filter(([, values]) => values.length).map(([label, values]) => <div key={label}><dt className="font-medium text-accent">{label}</dt><dd>{values.join(", ")}</dd></div>)}</dl>
            <p className="text-xs text-slate-400 mt-2">Scent notes describe the fragrance profile; they are not an ingredient or allergen declaration.</p>
          </div>}
        </div>
        <div className="space-y-5">
          {/inspired|impression/i.test(product.name) && <div><h3 className="font-semibold text-white mb-2">What does “inspired” mean here?</h3><p className="text-slate-300">The product brand is {product.brand || "BY12"}. The referenced fragrance name describes its inspiration. Read the product description and try an available sample to decide whether the scent suits you. <Link href="/guides/inspired-perfumes-pakistan" className="text-accent hover:underline">Learn about BY12 inspired fragrances.</Link></p></div>}
          {testers.length > 0 && <div><h3 className="font-semibold text-white mb-2">Prefer to try a sample?</h3><ul className="space-y-2">{testers.map(tester => <li key={tester.id}><Link href={`/product/${tester.id}`} className="text-accent hover:underline">{tester.name}</Link><span className="block text-sm text-slate-400">{(tester.testerQuantity || 0) > 0 ? "Check the tester page for current stock and delivery charges." : "Currently out of stock. Check the tester page for availability updates."}</span></li>)}</ul></div>}
          <div><h3 className="font-semibold text-white mb-2">Delivery and returns</h3><p className="text-slate-300">Review your chosen size, current stock and delivery charge before placing an order. Read the <Link href="/refund" className="text-accent hover:underline">return policy</Link> and <Link href="/contact" className="text-accent hover:underline">contact BY12</Link> if you need help choosing.</p></div>
          <p className="text-sm"><Link href={categoryPath(product.category)} className="text-accent hover:underline">Explore {product.category.toLowerCase()} fragrances</Link><span className="text-slate-500"> · </span><Link href="/guides" className="text-accent hover:underline">Perfume buying guides</Link></p>
          {!product.isTester && <p className="text-sm"><Link href="/guides/coffeeno-vs-ravla" className="text-accent hover:underline">Compare Coffeeno and Ravla: scent descriptions, sizes and prices</Link></p>}
        </div>
      </div>
    </div>
  </section>
}
