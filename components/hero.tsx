"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Sparkles } from "lucide-react"
import { useSiteStats } from "@/lib/hooks/use-site-stats"
import { FadeInSection } from "@/components/animated-section"

export default function Hero() {
  const { stats, loading } = useSiteStats()

  // Format number for display
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + "k+"
    }
    return num > 0 ? num + "+" : "0"
  }

  return (
    <div className="relative h-screen md:h-[600px] lg:h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl z-10">
          {/* Badge */}
          <FadeInSection delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-accent text-sm font-medium tracking-wide uppercase">Premium Fragrances</span>
            </div>
          </FadeInSection>

          <FadeInSection variant="heading" delay={0.2}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Discover Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent">
                Signature
              </span>{" "}
              Scent
            </h1>
          </FadeInSection>

          <FadeInSection variant="text" delay={0.3}>
            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-xl">
              Experience the essence of luxury with our handpicked collection of premium fragrances from around the world.
            </p>
          </FadeInSection>

          <FadeInSection delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/shop"
              className="group px-8 py-4 bg-accent hover:bg-accent/90 text-slate-900 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
            >
              Shop Now 
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex items-center justify-center"
            >
              About Our Story
            </Link>
          </div>
          </FadeInSection>

          {/* Stats */}
          <FadeInSection delay={0.5}>
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
          </FadeInSection>
        </div>

        {/* Perfume Bottle Image */}
        <div className="hidden lg:block absolute right-0 bottom-0 w-1/2 h-full">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-accent/5 to-transparent" />
          <Image
            src="/all_png.png"
            alt="BY12 Premium Gold Perfume Bottle"
            fill
            priority
            quality={90}
            className="object-contain object-right opacity-90 drop-shadow-2xl"
            sizes="50vw"
            style={{ filter: 'drop-shadow(0 0 40px rgba(139, 92, 246, 0.3))' }}
          />
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
    </div>
  )
}
