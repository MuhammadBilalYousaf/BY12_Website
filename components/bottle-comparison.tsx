import Link from "next/link"
import type { Product } from "@/lib/types"
import { bottleOptions, money } from "@/lib/buying-guide"

export default function BottleComparison({ product }: { product: Product }) {
  const options = bottleOptions(product)
  if (!options.length) return null
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full text-left text-sm text-slate-300">
        <caption className="sr-only">{product.name}: bottle sizes, prices and stock</caption>
        <thead className="bg-slate-800 text-white"><tr>
          <th scope="col" className="px-3 py-3">Size</th><th scope="col" className="px-3 py-3">Price</th><th scope="col" className="px-3 py-3">Per ml</th><th scope="col" className="px-3 py-3">Stock</th>
        </tr></thead>
        <tbody>{options.map(option => <tr key={option.size} className="border-t border-slate-700">
          <th scope="row" className="px-3 py-3 font-medium"><Link className="text-accent hover:underline" href={`/product/${product.id}${product.isTester ? "" : `?size=${option.size}`}`}>{option.size}ml</Link></th>
          <td className="px-3 py-3 whitespace-nowrap">{money(option.price)}</td>
          <td className="px-3 py-3 whitespace-nowrap">{money(option.perMl)}</td>
          <td className="px-3 py-3">{option.available ? "In stock" : "Out of stock"}</td>
        </tr>)}</tbody>
      </table>
    </div>
  )
}
