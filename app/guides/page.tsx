import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageBreadcrumb from "@/components/page-breadcrumb"
import { GUIDES } from "@/lib/buying-guide"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({ title: "Perfume Buying Guides in Pakistan | BY12", description: "Choose a BY12 perfume with practical guides to inspired fragrances, 30ml and 50ml bottle sizes, current prices and available samples.", path: "/guides" })

export default function GuidesPage() {
  return <><Navbar /><main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
    <div className="max-w-6xl mx-auto px-4 py-8"><PageBreadcrumb items={[{ label: "Buying Guides" }]} /></div>
    <header className="max-w-4xl mx-auto px-4 pt-8 pb-12 text-center"><p className="text-accent uppercase tracking-widest text-sm mb-4">Choose with confidence</p><h1 className="text-4xl md:text-5xl font-bold text-white mb-5">Perfume buying guides</h1><p className="text-lg text-slate-300 leading-relaxed">Understand BY12 inspired fragrances, compare bottle sizes and decide what to check before ordering in Pakistan. Our guides connect directly to current products and samples.</p></header>
    <section aria-label="Buying guides" className="max-w-6xl mx-auto px-4 pb-16 grid gap-6 md:grid-cols-2">{GUIDES.map(guide => <article key={guide.slug} className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 sm:p-8"><h2 className="text-2xl font-bold text-white mb-4"><Link className="hover:text-accent" href={`/guides/${guide.slug}`}>{guide.title}</Link></h2><p className="text-slate-300 leading-relaxed mb-6">{guide.description}</p><Link className="text-accent font-semibold hover:underline" href={`/guides/${guide.slug}`}>Read the guide →</Link></article>)}</section>
    <div className="max-w-6xl mx-auto px-4 pb-16 text-slate-300">Ready to browse? <Link className="text-accent hover:underline" href="/shop">Explore BY12 perfumes</Link> or <Link className="text-accent hover:underline" href="/testers">check available testers</Link>.</div>
  </main><Footer /></>
}
