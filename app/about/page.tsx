"use client"

import Image from "next/image"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageBreadcrumb from "@/components/page-breadcrumb"
import { Sparkles, Award, Users, Shield } from "lucide-react"
import { FadeInSection, FadeInStagger, FadeInItem } from "@/components/animated-section"

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <PageBreadcrumb items={[{ label: "About Us" }]} />
        </div>

        {/* Hero Section */}
        <div className="relative py-20 md:py-28 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <FadeInSection delay={0.1}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-accent text-sm font-medium tracking-wide uppercase">Our Story</span>
                </div>
              </FadeInSection>
              <FadeInSection variant="heading" delay={0.2}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  About{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent">
                    BY12
                  </span>
                </h1>
              </FadeInSection>
              <FadeInSection variant="text" delay={0.3}>
                <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                  From a university dream to a growing fragrance brand, BY12 is built on passion, innovation, and everyday confidence.
                </p>
              </FadeInSection>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <FadeInSection delay={0.1}>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Story</h2>
                <p className="text-slate-300 mb-4 leading-relaxed">
                  Every brand has a beginning. Ours started with a passion for fragrance and a dream to build
                  something meaningful.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  My name is Bilal Yousaf, founder of BY12 Perfumes. My journey began as a Software Engineering
                  student at COMSATS University Islamabad, where I explored technology, digital marketing, and online
                  business. During those years, one idea kept growing: build a brand that delivers real value and leaves
                  a lasting impact.
                </p>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.2}>
            <div 
              className="h-96 rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.9) 0%, rgba(30, 41, 59, 0.95) 100%)',
                boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="w-full h-full flex items-center justify-center relative">
                <Image 
                  src="/all_png.png" 
                  alt="Luxury Perfume Collection" 
                  fill
                  className="object-cover opacity-80"
                  onError={() => {
                    // Image error handling
                  }}
                />
              </div>
            </div>
            </FadeInSection>
          </div>

          {/* Story Details */}
          <div className="max-w-4xl mx-auto mb-20 space-y-10">
            <FadeInSection delay={0.1}>
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-white">The Journey Behind BY12</h3>
                <p className="text-slate-300 leading-relaxed">
                  During my university years, I worked in digital marketing and social media management, helping
                  brands grow online and connect with customers across different markets. Through that experience, I
                  learned a simple lesson: a great product with strong branding creates a lasting impact.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  At the same time, I was always fascinated by fragrances. A good perfume does more than smell good.
                  It creates memories, builds confidence, and leaves an impression. I noticed a gap in the market:
                  people love luxury fragrances, but premium prices make them difficult for everyday use.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  That realization became the seed for BY12: to deliver a luxury fragrance experience at an affordable
                  price, without compromising on quality or longevity.
                </p>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.15}>
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-white">The Vision Behind BY12</h3>
                <p className="text-slate-300 leading-relaxed">
                  BY12 was created with a clear mission: to provide high-quality, long-lasting perfumes inspired by
                  luxury fragrances, while keeping them accessible to everyone.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Every scent in our collection is carefully selected to deliver strong projection, long-lasting
                  performance, and a signature profile that helps you stand out. Whether you are going to work,
                  attending an event, or enjoying a casual day out, BY12 fragrances are made to match your lifestyle.
                </p>
                <p className="text-slate-300 leading-relaxed">We believe fragrance is not just a product. It is a personal identity.</p>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-white">Inspired by the World's Finest Fragrances</h3>
                <p className="text-slate-300 leading-relaxed">
                  Our perfumes are inspired by some of the most loved fragrances in the world. Instead of paying very
                  high prices for designer perfumes, our goal is to offer premium scent profiles at a fraction of the
                  cost.
                </p>
                <p className="text-slate-300 leading-relaxed">BY12 focuses on creating perfumes that combine:</p>
                <ul className="list-disc list-inside text-slate-300 space-y-2">
                  <li>Luxury-inspired fragrance notes</li>
                  <li>High-quality perfume oils</li>
                  <li>Long-lasting Eau De Parfum concentration</li>
                  <li>Modern and elegant scent profiles</li>
                </ul>
                <p className="text-slate-300 leading-relaxed">
                  This approach allows us to deliver affordable luxury perfumes that compete with popular designer
                  fragrances in the market.
                </p>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.25}>
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-white">Built with Passion and Innovation</h3>
                <p className="text-slate-300 leading-relaxed">
                  BY12 was built by someone who understands digital branding, modern consumers, and online growth.
                  From fragrance selection to brand identity and communication, every detail reflects one vision:
                  making luxury-inspired perfumes accessible to everyone.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  What started as an idea is now a growing brand driven by passion, creativity, and innovation.
                </p>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.3}>
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-white">More Than Just Perfume</h3>
                <p className="text-slate-300 leading-relaxed">
                  BY12 is more than a fragrance brand. It represents ambition, creativity, and the courage to turn
                  ideas into reality.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  From a university student learning technology to launching a perfume brand, this journey proves that
                  great things can start with simple ideas and determination.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Our goal is clear: to create the best affordable luxury perfumes that help people feel confident,
                  elegant, and unforgettable.
                </p>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.35}>
              <div className="space-y-4 text-center border border-white/10 rounded-2xl p-8 bg-white/5">
                <h3 className="text-2xl md:text-3xl font-bold text-white">Welcome to BY12</h3>
                <p className="text-slate-300 leading-relaxed">
                  When you wear a BY12 fragrance, you are not just wearing a perfume. You are wearing confidence,
                  style, and a story of ambition.
                </p>
                <p className="text-slate-200 font-medium">Luxury Inspired Perfumes for Everyday Confidence.</p>
              </div>
            </FadeInSection>
          </div>

          {/* Features Grid */}
          <FadeInStagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Award, title: "Curated Selection", desc: "Hand-picked fragrances from luxury brands worldwide" },
              { icon: Users, title: "Expert Service", desc: "Personalized recommendations from fragrance experts" },
              { icon: Shield, title: "Premium Quality", desc: "100% authentic products with money-back guarantee" },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <FadeInItem
                  key={i} 
                  className="group p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent/30 transition-colors">
                    <Icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </FadeInItem>
              )
            })}
          </FadeInStagger>
        </div>
      </main>
      <Footer />
    </>
  )
}
