"use client"

import { useEffect, useRef, useState } from "react"
import ProductModelCanvas from "@/components/product-model-canvas"
import { ShoppingCart, Sparkles } from "lucide-react"
import gsap from "gsap"
import { CSSPlugin } from "gsap/CSSPlugin"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { listedNotes } from "@/lib/buying-guide"

gsap.registerPlugin(CSSPlugin, ScrollTrigger)

export interface PerfumeScrollStoryProps {
  productName: string
  modelUrl: string
  fallbackModelUrl?: string
  brand: string
  category?: string
  descriptionExcerpt?: string
  fragranceLine?: string
  fragranceNotes?: { top: string[]; middle: string[]; base: string[] }
  fragranceIngredients?: string[]
  inStock: boolean
  onAddToCart: () => void
  onBuyNow: () => void
}

type NotePyramid = { top: string[]; middle: string[]; base: string[] }
type Ingredient = { name: string; accent: string }

const INGREDIENT_ACCENTS: Record<string, string> = {
  oud: "#c4a574",
  amber: "#d4af37",
  cedar: "#8b7355",
  bergamot: "#e8d56a",
  musk: "#b8a99a",
  rose: "#e8a0bf",
  vanilla: "#e8d5a3",
  jasmine: "#f5f0e6",
  iris: "#c9b8d4",
  sandalwood: "#c4a882",
  peony: "#f0b8c8",
  citrus: "#e8d56a",
  lavender: "#a89bc8",
  "black pepper": "#c4a082",
  "white woods": "#d4c4a8",
}

const ACCENT_PALETTE = ["#d4af37", "#c4a574", "#e8d56a", "#e8a0bf", "#b8a99a", "#c9b8d4", "#8b7355"]

function accentForIngredient(name: string, index: number): string {
  const key = name.trim().toLowerCase()
  return INGREDIENT_ACCENTS[key] || ACCENT_PALETTE[index % ACCENT_PALETTE.length]
}

function getCategoryFallback(_category?: string, _productName?: string): { notes: NotePyramid; ingredients: Ingredient[]; fragranceLine: string } {
  // A category/name cannot establish the formulation. Use only catalog-supplied notes.
  return { notes: { top: [], middle: [], base: [] }, ingredients: [], fragranceLine: "Find your signature scent." }
}

function resolveStoryContent(
  category?: string,
  productName?: string,
  fragranceLine?: string,
  fragranceNotes?: NotePyramid,
  fragranceIngredients?: string[],
): {
  notes: NotePyramid
  ingredients: Ingredient[]
  fragranceLine: string
} {
  const fallback = getCategoryFallback(category, productName)

  return {
    fragranceLine: fragranceLine?.trim() || fallback.fragranceLine,
    notes: listedNotes({ fragranceNotes }),
    ingredients:
      fragranceIngredients && fragranceIngredients.length > 0
        ? [...new Set(fragranceIngredients.filter(name => typeof name === "string").map(name => name.trim()).filter(Boolean))].map((name, i) => ({
            name: name.trim(),
            accent: accentForIngredient(name, i),
          }))
        : fallback.ingredients,
  }
}

function stripHtml(html?: string) {
  if (!html) return ""
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

export default function PerfumeScrollStory({
  productName,
  modelUrl,
  fallbackModelUrl,
  brand,
  category,
  descriptionExcerpt,
  fragranceLine,
  fragranceNotes,
  fragranceIngredients,
  inStock,
  onAddToCart,
  onBuyNow,
}: PerfumeScrollStoryProps) {
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const modelProgress = useRef(0)
  const story = resolveStoryContent(
    category,
    productName,
    fragranceLine,
    fragranceNotes,
    fragranceIngredients,
  )
  const hasNotes = Object.values(story.notes).some(notes => notes.length > 0)
  const excerpt =
    stripHtml(descriptionExcerpt).slice(0, 140) || story.fragranceLine

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReducedMotion(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  useEffect(() => {
    if (reducedMotion || !ready || failed) return
    const root = rootRef.current, stage = stageRef.current
    if (!root || !stage) return
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".ps-panel")
      const notes = gsap.utils.toArray<HTMLElement>(".ps-note-row")
      const ingredients = gsap.utils.toArray<HTMLElement>(".ps-ingredient")
      const particles = gsap.utils.toArray<HTMLElement>(".ps-particle")
      const cta = stage.querySelector(".ps-cta")
      const glow = stage.querySelector(".ps-glow")
      const assembly = { value: 0 }
      modelProgress.current = 0
      gsap.set(panels, { opacity: 0, y: 28 })
      gsap.set(panels[0], { opacity: 1, y: 0 })
      gsap.set([...notes, ...ingredients, ...particles], { opacity: 0 })
      gsap.set(cta, { opacity: 0, y: 24 })
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 1.1, pin: stage, anticipatePin: 1, invalidateOnRefresh: true },
      })
      tl.to(assembly, { value: 1, duration: 7.6, ease: "none", onUpdate: () => { modelProgress.current = assembly.value } }, 0)
      const chapters = [0, 1.25, 2.75, 3.95, 4.95, 6.55, 7.75, 9.65, 11.55, 13.15]
      chapters.slice(1).forEach((time, index) => {
        tl.to(panels[index], { opacity: 0, y: -20, duration: .4 }, time - .15)
          .to(panels[index + 1], { opacity: 1, y: 0, duration: .5 }, time)
      })
      tl.to(glow, { opacity: .55, scale: 1.05, duration: 8 }, 0)
      if (notes.length) tl.to(notes, { opacity: 1, stagger: .25, duration: .6 }, 9.7).to(notes, { opacity: 0, duration: .5 }, 13.2)
      if (ingredients.length) tl.to(ingredients, { opacity: 1, stagger: .12, duration: .7 }, 11.6).to(ingredients, { opacity: .15, duration: .8 }, 13.2)
      tl.to(".ps-model-stage", { y: -28, duration: .6 }, 9.7)
        .to(particles, { opacity: .55, y: -12, stagger: .05, duration: .8 }, 9.8)
        .to(".ps-model-stage", { y: 0, duration: .6 }, 13.2)
        .to(cta, { opacity: 1, y: 0, duration: .9 }, 13.8)
      ScrollTrigger.refresh()
    }, root)
    return () => ctx.revert()
  }, [reducedMotion, ready, failed, modelUrl])

  if (failed) return null

  if (reducedMotion) {
    return (
      <section className="relative py-16 md:py-24 border-t border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-accent text-sm tracking-[0.2em] uppercase mb-3">Crafted in Motion</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{productName}</h2>
            <p className="text-slate-400 max-w-xl mx-auto">{excerpt}</p>
          </div>
          <div className="flex flex-col items-center gap-8">
            <div className="h-[420px] w-full max-w-md">
              <ProductModelCanvas modelUrl={modelUrl} fallbackModelUrl={fallbackModelUrl} productName={productName} assembled onError={() => setFailed(true)} />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <button
                type="button"
                onClick={onAddToCart}
                disabled={!inStock}
                className="flex-1 px-6 py-3 bg-accent text-slate-900 rounded-lg font-semibold btn-premium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                {inStock ? "Add to Cart" : "Out of Stock"}
              </button>
              <button
                type="button"
                onClick={onBuyNow}
                disabled={!inStock}
                className="flex-1 px-6 py-3 border border-accent text-accent rounded-lg font-semibold btn-premium disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      ref={rootRef}
      className="perfume-scroll-story relative overflow-x-hidden border-t border-slate-700/60"
      style={{ height: ready ? "900vh" : 0, visibility: ready ? "visible" : "hidden" }}
      aria-label={`${productName} craftsmanship story`}
    >
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black"
      >
        {/* Atmosphere */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_55%)]" />
          <div className="ps-glow absolute left-1/2 top-[42%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.25),transparent_68%)] blur-2xl will-change-transform" />
        </div>

        {/* Story panels */}
        <div className="pointer-events-none absolute inset-x-0 top-24 z-20">
          <div className="relative mx-auto h-[140px] max-w-2xl px-4 text-center md:h-[160px]">
            <Panel index={0} eyebrow="The Foundation" title="Every masterpiece begins with purity." body="Crystal-clear glass, cut to catch light before it holds scent." />
            <Panel index={1} eyebrow="The Fragrance" title={story.fragranceLine} body={excerpt} />
            <Panel index={2} eyebrow="The Atomizer" title="Precision meets ritual." body="A measured mist — engineered for an even, elegant veil." />
            <Panel index={3} eyebrow="The Collar" title="Quiet architecture." body="A metallic ring that seals craftsmanship into form." />
            <Panel index={4} eyebrow="The Cap" title="The final seal." body="A soft descent — the bottle becomes complete." />
            <Panel index={5} eyebrow="The Signature" title={brand} body={`${productName} — marked with quiet gold.`} />
            <Panel index={6} eyebrow="Light Reveal" title="Seen in true light." body="Glass, liquid, and metal catch a cinematic sweep." />
            <Panel index={7} eyebrow={hasNotes ? "Fragrance Notes" : "Your Choice"} title={hasNotes ? "A journey through the scent." : "Choose the details that suit you."} body={hasNotes ? "Top · Heart · Base — unfolding over time." : "Explore the product description, bottle sizes and current availability."} />
            <Panel index={8} eyebrow={story.ingredients.length ? "Scent Accents" : "Explore the Fragrance"} title="Make it your own." body={story.ingredients.length ? "Explore the scent accents listed for this fragrance." : "Ask BY12 if you need more detail before choosing."} />
            <Panel index={9} eyebrow="Yours to Wear" title={productName} body="The bottle is ready. The story continues on you." />
          </div>
        </div>

        {/* Actual GLB geometry; its embedded assembly is scrubbed by the existing story. */}
        <div className="ps-model-stage absolute inset-x-0 top-[24%] bottom-[15%] z-10">
          <ProductModelCanvas modelUrl={modelUrl} fallbackModelUrl={fallbackModelUrl} productName={productName} progress={modelProgress} onReady={() => setReady(true)} onError={() => setFailed(true)} />
        </div>
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[320px] w-[240px] -translate-x-1/2 -translate-y-1/2">
          {story.ingredients.map((ingredient, i) => {
            const angle = i / story.ingredients.length * Math.PI * 2 - Math.PI / 2
            return <span key={ingredient.name} className="ps-ingredient absolute text-[10px] font-semibold uppercase tracking-wider" style={{ left: `${50 + Math.cos(angle) * 48}%`, top: `${50 + Math.sin(angle) * 40}%`, color: ingredient.accent }}>{ingredient.name}</span>
          })}
          {Array.from({ length: 12 }, (_, i) => <span key={i} className="ps-particle absolute h-1 w-1 rounded-full bg-accent/70" style={{ left: `${12 + (i * 37) % 76}%`, top: `${18 + (i * 29) % 64}%` }} />)}
        </div>

        {/* Notes stack (section 8) */}
        {hasNotes && <div className="pointer-events-none absolute bottom-12 left-1/2 z-20 w-full max-w-sm -translate-x-1/2 px-4 md:bottom-16">
          <div className="space-y-2 text-center">
            {([{ label: "Top", values: story.notes.top }, { label: "Heart", values: story.notes.middle }, { label: "Base", values: story.notes.base }]).filter(note => note.values.length).map(note => <div key={note.label} className="ps-note-row text-sm text-slate-300"><span className="text-accent font-semibold tracking-wide">{note.label}</span><span className="mx-2 text-slate-600">·</span>{note.values.join(" · ")}</div>)}
          </div>
        </div>}

        {/* Final CTA */}
        <div className="ps-cta pointer-events-auto absolute bottom-10 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-4 will-change-transform">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onAddToCart}
              disabled={!inStock}
              className="flex-1 px-6 py-3 bg-accent text-slate-900 rounded-lg font-semibold btn-premium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent/25"
            >
              <ShoppingCart size={18} />
              {inStock ? "Add to Cart" : "Out of Stock"}
            </button>
            <button
              type="button"
              onClick={onBuyNow}
              disabled={!inStock}
              className="flex-1 px-6 py-3 border border-accent/80 text-accent rounded-lg font-semibold btn-premium disabled:opacity-50 bg-slate-950/40 backdrop-blur-sm"
            >
              Buy Now
            </button>
          </div>
        </div>

        <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-slate-600 md:bottom-6">
          <Sparkles size={11} className="text-accent/70" />
          Scroll to assemble
        </p>
      </div>
    </section>
  )
}

function Panel({
  eyebrow,
  title,
  body,
}: {
  index?: number
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <div className="ps-panel absolute inset-x-0 top-0 px-2">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent/90">{eyebrow}</p>
      <h3 className="mb-2 text-2xl font-bold leading-tight text-white md:text-3xl">{title}</h3>
      <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-400 md:text-base">{body}</p>
    </div>
  )
}

