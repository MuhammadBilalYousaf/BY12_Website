import Link from "next/link"
import type { Product } from "@/lib/types"

export default function CollectionBuyingGuide({ category = "All", products = [] }: { category?: string; products?: Product[] }) {
  const collectionProducts = products.filter(product => !product.isTester && (category === "All" || product.category === category))
  const heading = category === "All" ? "Choose an inspired perfume in Pakistan" : `Choosing an inspired perfume for ${category.toLowerCase()}`
  const intro = category === "Men"
    ? "Explore BY12’s inspired perfumes for men in Pakistan. Start with each fragrance’s scent description and inspiration reference, then compare its bottle sizes, current prices and availability. Choose the scent style you enjoy rather than relying on a category label alone."
    : category === "Women"
      ? "Shop BY12’s inspired perfumes for women in Pakistan. Read the fragrance descriptions to compare scent styles, then choose a bottle size that fits your budget. Each product page shows its own current size prices and stock, with samples listed separately when available."
      : "Compare BY12 inspired perfumes before buying online in Pakistan. Read each fragrance’s description and inspiration reference, then compare available sizes, prices and the total with delivery. The perfume you order is a BY12 fragrance; the referenced scent identifies its inspiration."
  return <section aria-label="Collection buying advice" className="max-w-7xl mx-auto px-4 pb-16">
    <div className="border-t border-slate-700 pt-8 grid gap-6 md:grid-cols-2">
      <div><h2 className="text-2xl font-bold text-white mb-3">{heading}</h2><p className="text-slate-300 leading-relaxed">{intro}</p><p className="text-slate-300 mt-3 leading-relaxed">Longevity and how a scent feels can differ between people and conditions. Use the product description and an available tester to make your choice, rather than assuming every fragrance will perform the same way.</p>
        {!!collectionProducts.length && <ul className="mt-4 space-y-2 text-accent">{collectionProducts.map(product => <li key={product.id}><Link className="hover:underline" href={`/product/${product.id}`}>{product.name}</Link></li>)}</ul>}
      </div>
      <div><h3 className="text-lg font-semibold text-white mb-3">Useful before you order</h3><ul className="space-y-3 text-accent">
        <li><Link href="/guides/30ml-vs-50ml-perfume" className="hover:underline">30ml vs 50ml: compare bottle sizes and price per ml</Link></li>
        <li><Link href="/guides/inspired-perfumes-pakistan" className="hover:underline">Understand BY12 inspired perfumes</Link></li>
        <li><Link href="/guides/coffeeno-vs-ravla" className="hover:underline">Coffeeno vs Ravla: compare BY12 perfumes</Link></li>
        <li><Link href="/testers" className="hover:underline">Check fragrance sample sizes and availability</Link></li>
        <li><Link href="/refund" className="hover:underline">Read the return policy before buying</Link></li>
      </ul></div>
    </div>
  </section>
}
