"use client"

import { useState } from "react"
import { ChevronDown, Sparkles, HelpCircle } from "lucide-react"
import { faqItems } from "@/lib/sample-data"
import { FAQSchema } from "@/components/seo-schemas"
import { FadeInSection, FadeInStagger, FadeInItem } from "@/components/animated-section"

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* FAQ Schema for SEO */}
      <FAQSchema questions={faqItems} />
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-accent/5 to-transparent rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Header Section */}
        <FadeInSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6 backdrop-blur-sm">
            <HelpCircle className="w-4 h-4 text-accent" />
            <span className="text-accent text-sm font-medium tracking-wide uppercase">Got Questions?</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Frequently Asked{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent">
              Questions
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about our premium fragrances, shipping, and exclusive services
          </p>
        </FadeInSection>

        {/* FAQ Items */}
        <FadeInStagger className="space-y-4">
          {faqItems.map((item, idx) => {
            const isOpen = openIndex === idx

            return (
              <FadeInItem
                key={idx}
                className={`group relative rounded-2xl transition-all duration-500 ${
                  isOpen
                    ? "bg-gradient-to-r from-slate-800/90 via-slate-800/95 to-slate-800/90"
                    : "bg-slate-800/50 hover:bg-slate-800/70"
                }`}
                style={{
                  boxShadow: isOpen
                    ? "0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                    : "0 4px 20px -5px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                  border: isOpen
                    ? "1px solid rgba(139, 92, 246, 0.3)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                {/* Glow effect for open item */}
                {isOpen && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 blur-xl -z-10" />
                )}

                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 md:px-8 py-5 md:py-6 text-left flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Number indicator */}
                    <div
                      className={`hidden sm:flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300 ${
                        isOpen
                          ? "bg-accent text-slate-900"
                          : "bg-slate-700/50 text-slate-400 group-hover:bg-accent/20 group-hover:text-accent"
                      }`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <span
                      className={`font-semibold text-base md:text-lg transition-colors duration-300 ${
                        isOpen ? "text-white" : "text-slate-200 group-hover:text-white"
                      }`}
                    >
                      {item.question}
                    </span>
                  </div>

                  {/* Animated chevron */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? "bg-accent text-slate-900 rotate-180"
                        : "bg-slate-700/50 text-slate-400 group-hover:bg-accent/20 group-hover:text-accent"
                    }`}
                  >
                    <ChevronDown className="w-5 h-5 transition-transform duration-300" />
                  </div>
                </button>

                {/* Answer with smooth animation */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0">
                    <div className="pl-0 sm:pl-14">
                      <div className="h-px bg-gradient-to-r from-accent/50 via-accent/20 to-transparent mb-5" />
                      <p className="text-slate-300 leading-relaxed text-base md:text-lg">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeInItem>
            )
          })}
        </FadeInStagger>

        {/* Bottom CTA */}
        <FadeInSection delay={0.3} className="mt-16 text-center">
          <div
            className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-6 rounded-2xl backdrop-blur-sm"
            style={{
              background: "linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Still have questions?</p>
                <p className="text-slate-400 text-sm">We&apos;re here to help you</p>
              </div>
            </div>
            <a
              href="/contact"
              className="px-6 py-3 bg-accent hover:bg-accent/90 text-slate-900 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-0.5"
            >
              Contact Us
            </a>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
