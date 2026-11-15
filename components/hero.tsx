"use client"

import { getImageProps } from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ChevronRight, Sparkles } from "lucide-react"
import { useSiteStats } from "@/lib/hooks/use-site-stats"
import { HeroReveal } from "@/components/animated-section"

export default function Hero() {
  const { stats, loading } = useSiteStats()
  const reduceMotion = useReducedMotion()
  const { props: heroImage } = getImageProps({
    src: "/all_png.png",
    alt: "BY12 perfume collection",
    fill: true,
    quality: 75,
    sizes: "50vw",
    loading: "eager",
    fetchPriority: "high",
    className: "object-contain object-right drop-shadow-2xl",
    style: { filter: "drop-shadow(0 0 40px rgba(139, 92, 246, 0.3))" },
  })

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + "k+"
    }
    return num > 0 ? num + "+" : "0"
  }

  return (
    <div className="relative h-screen md:h-[600px] lg:h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background atmosphere */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0.2 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl z-10">
          <HeroReveal delay={0.08}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-accent text-sm font-medium tracking-wide uppercase">Premium Fragrances</span>
            </div>
          </HeroReveal>

          <HeroReveal delay={0.18} blur>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Inspired{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent">
                Perfumes
              </span>{" "}
              in Pakistan
            </h1>
          </HeroReveal>

          <HeroReveal delay={0.3} blur={false}>
            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-xl">
              Discover BY12 inspired fragrances for everyday confidence. Explore our scents, choose your size and order across Pakistan.
            </p>
          </HeroReveal>

          <HeroReveal delay={0.4} blur={false}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/shop"
                className="group btn-premium px-8 py-4 bg-accent hover:bg-accent/90 text-slate-900 font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/25"
              >
                Shop Now
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                href="/about"
                className="btn-premium px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/30 flex items-center justify-center"
              >
                About Our Story
              </Link>
            </div>
          </HeroReveal>

          <HeroReveal delay={0.52} blur={false}>
            <div className="mt-12 flex flex-wrap gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {loading ? "..." : formatNumber(stats.totalProducts)}
                </div>
                <div className="text-slate-400 text-sm">Premium Scents</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {loading ? "..." : formatNumber(stats.totalCustomers)}
                </div>
                <div className="text-slate-400 text-sm">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">100%</div>
                <div className="text-slate-400 text-sm">Authentic Products</div>
              </div>
            </div>
          </HeroReveal>
        </div>

        {/* Perfume Bottle Image */}
        <motion.div
          className="hidden lg:block absolute right-0 bottom-0 w-1/2 h-full"
          initial={
            reduceMotion
              ? { opacity: 1 }
              : { opacity: 0, y: 20, filter: "blur(8px)" }
          }
          animate={{ opacity: 0.9, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: reduceMotion ? 0.2 : 0.8,
            delay: reduceMotion ? 0 : 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-accent/5 to-transparent" />
          {/* The desktop artwork is hidden below lg; do not preload/download it
              on mobile. Desktop keeps an eager, high-priority responsive image. */}
          <link rel="preload" as="image" media="(min-width: 1024px)" imageSrcSet={heroImage.srcSet} imageSizes={heroImage.sizes} fetchPriority="high" />
          <picture>
            <source media="(min-width: 1024px)" srcSet={heroImage.srcSet} sizes={heroImage.sizes} />
            <img {...heroImage} srcSet={undefined} sizes={undefined} src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" />
          </picture>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
    </div>
  )
}
