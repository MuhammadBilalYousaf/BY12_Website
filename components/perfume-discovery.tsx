import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import type { Product } from "@/lib/types"

export default function PerfumeDiscovery({ products }: { products: Product[] }) {
  const fragrances = products.filter(product => !product.isTester).slice(0, 2)

  return (
    <section
      id="find-your-fragrance"
      aria-labelledby="perfume-discovery-heading"
      className="relative overflow-hidden bg-slate-900 px-4 py-12 scroll-mt-24 md:py-20"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/40 to-slate-900" />

      <div className="relative mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-accent/15 bg-gradient-to-br from-slate-800/60 via-slate-900 to-slate-950">
          <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:p-12">
            <div className="min-w-0">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-2 text-xs font-medium uppercase tracking-[0.14em] text-accent">
                <Sparkles size={14} aria-hidden="true" /> The BY12 scent guide
              </span>
              <h2 id="perfume-discovery-heading" className="mb-5 text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl">
                Find your
                <span className="block bg-gradient-to-r from-accent via-yellow-400 to-accent bg-clip-text text-transparent">signature scent.</span>
              </h2>
              <p className="max-w-md text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                Explore BY12 inspired perfumes. Compare Coffeeno and Ravla, or start with a sample to find the fragrance you enjoy.
              </p>

              <div className="mt-7 flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                <Link href="/guides/coffeeno-vs-ravla" className="group inline-flex items-center justify-center gap-3 rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-accent/10 transition-colors hover:bg-accent/90 btn-premium">
                  Compare the fragrances
                  <ArrowRight size={17} aria-hidden="true" className="transition-transform duration-200 motion-safe:group-hover:translate-x-1" />
                </Link>
                <Link href="/testers" className="inline-flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-300 underline decoration-slate-600 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">
                  Explore perfume samples
                </Link>
              </div>
            </div>

            {!!fragrances.length && (
              <ul aria-label="Explore BY12 fragrances" className="grid min-w-0 gap-4">
                {fragrances.map(product => {
                  const [name, ...reference] = product.name.split(/\s[-–—]\s/)

                  return (
                    <li key={product.id}>
                      <Link
                        href={`/product/${product.id}`}
                        aria-label={`Explore ${name} perfume by ${product.brand || "BY12"}`}
                        className="group flex min-w-0 items-center gap-4 rounded-2xl border border-slate-700/80 bg-slate-800/40 p-5 transition-colors duration-200 hover:border-accent/50 hover:bg-slate-800/80 sm:gap-6 sm:p-7"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-accent">
                            {product.brand || "BY12"}{product.category === "Men" ? " · For men" : product.category === "Women" ? " · For women" : ""}
                          </p>
                          <h3 className="break-words text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">{name}</h3>
                          {reference.length > 0 && <p className="mt-2 text-sm leading-6 text-slate-400">{reference.join(" — ")}</p>}
                        </div>
                        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-600/80 text-slate-300 transition-colors group-hover:border-accent/40 group-hover:bg-accent/10 group-hover:text-accent sm:h-11 sm:w-11">
                          <ArrowRight size={19} className="transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <nav aria-label="Perfume collections" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-slate-700/60 px-6 py-5 text-sm sm:gap-x-8">
            <span className="text-slate-500">Explore the collection</span>
            <Link href="/shop/men" className="text-slate-300 transition-colors hover:text-accent">Perfumes for men</Link>
            <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />
            <Link href="/shop/women" className="text-slate-300 transition-colors hover:text-accent">Perfumes for women</Link>
          </nav>
        </div>
      </div>
    </section>
  )
}
