import Link from "next/link"

export default function CollectionBuyingGuide({ category = "All" }: { category?: string }) {
  const intro = category === "Men"
    ? "Start with the listed scent description, then compare bottle sizes and prices. The men’s collection brings together the products BY12 currently lists for this category; follow each product for its own stock and size options."
    : category === "Women"
      ? "Read each fragrance description to find the scent style you enjoy, then choose a bottle size that fits your budget. The women’s collection shows the products BY12 currently lists for this category, with live product options on each detail page."
      : "Choose a fragrance by the scent description and your preferences, then compare the available sizes and total cost. Collection labels help you browse; the product page gives you the details for the bottle you are considering."
  return <section aria-label="Collection buying advice" className="max-w-7xl mx-auto px-4 pb-16">
    <div className="border-t border-slate-700 pt-8 grid gap-6 md:grid-cols-2">
      <div><h2 className="text-2xl font-bold text-white mb-3">Choosing your BY12 fragrance</h2><p className="text-slate-300 leading-relaxed">{intro}</p><p className="text-slate-300 mt-3 leading-relaxed">Longevity and how a scent feels can differ between people and conditions. Use the product description and an available tester to make your choice, rather than assuming every fragrance will perform the same way.</p></div>
      <div><h3 className="text-lg font-semibold text-white mb-3">Useful before you order</h3><ul className="space-y-3 text-accent">
        <li><Link href="/guides/30ml-vs-50ml-perfume" className="hover:underline">30ml vs 50ml: compare bottle sizes and price per ml</Link></li>
        <li><Link href="/guides/inspired-perfumes-pakistan" className="hover:underline">Understand BY12 inspired perfumes</Link></li>
        <li><Link href="/testers" className="hover:underline">Check fragrance sample sizes and availability</Link></li>
        <li><Link href="/refund" className="hover:underline">Read the return policy before buying</Link></li>
      </ul></div>
    </div>
  </section>
}
