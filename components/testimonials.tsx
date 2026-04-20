"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { useTestimonials } from "@/lib/hooks/use-testimonials"
import { FadeInSection } from "@/components/animated-section"

export default function Testimonials() {
  const { testimonials, loading } = useTestimonials(true) // Only fetch approved testimonials
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const handlePrev = useCallback(() => {
    if (isAnimating || testimonials.length === 0) return
    setIsAnimating(true)
    setTimeout(() => {
      setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
      setTimeout(() => setIsAnimating(false), 50)
    }, 150)
  }, [isAnimating, testimonials.length])

  const handleNext = useCallback(() => {
    if (isAnimating || testimonials.length === 0) return
    setIsAnimating(true)
    setTimeout(() => {
      setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
      setTimeout(() => setIsAnimating(false), 50)
    }, 150)
  }, [isAnimating, testimonials.length])

  // Get indices for visible cards (far left, left, center, right, far right)
  const getIndex = (offset: number) => {
    if (testimonials.length === 0) return 0
    let index = activeIndex + offset
    if (index < 0) index = testimonials.length + index
    if (index >= testimonials.length) index = index - testimonials.length
    return index
  }

  const cardPositions = [
    { offset: -2, position: 'far-left' },
    { offset: -1, position: 'left' },
    { offset: 0, position: 'center' },
    { offset: 1, position: 'right' },
    { offset: 2, position: 'far-right' },
  ]

  const getCardConfig = (position: string) => {
    switch (position) {
      case 'far-left':
        return { 
          x: '-120%', 
          scale: 0.7, 
          opacity: 0.4, 
          zIndex: 1,
          rotateY: 20
        }
      case 'left':
        return { 
          x: '-60%', 
          scale: 0.85, 
          opacity: 0.7, 
          zIndex: 10,
          rotateY: 10
        }
      case 'center':
        return { 
          x: '0%', 
          scale: 1, 
          opacity: 1, 
          zIndex: 20,
          rotateY: 0
        }
      case 'right':
        return { 
          x: '60%', 
          scale: 0.85, 
          opacity: 0.7, 
          zIndex: 10,
          rotateY: -10
        }
      case 'far-right':
        return { 
          x: '120%', 
          scale: 0.7, 
          opacity: 0.4, 
          zIndex: 1,
          rotateY: -20
        }
      default:
        return { x: '0%', scale: 1, opacity: 1, zIndex: 1, rotateY: 0 }
    }
  }

  // Show loading state
  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What Our <span className="text-accent">Customers</span> Say
            </h2>
            <p className="text-lg text-slate-300">
              Loading testimonials...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        </div>
      </section>
    )
  }

  // Don't show section if no testimonials
  if (testimonials.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <FadeInSection className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What Our <span className="text-accent">Customers</span> Say
          </h2>
          <p className="text-lg text-slate-300">
            Real reviews from our satisfied customers
          </p>
        </FadeInSection>

        {/* Carousel Container */}
        <FadeInSection delay={0.2}>
          <div className="relative h-[280px] md:h-[300px]">
          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 backdrop-blur-sm hover:bg-accent hover:text-white text-white rounded-full p-2 md:p-3 shadow-xl transition-all duration-300 hover:scale-110 border border-white/20"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              
              <button
                onClick={handleNext}
                className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 backdrop-blur-sm hover:bg-accent hover:text-white text-white rounded-full p-2 md:p-3 shadow-xl transition-all duration-300 hover:scale-110 border border-white/20"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </>
          )}

          {/* Cards */}
          <div className="relative h-full flex items-center justify-center">
            {cardPositions.map(({ offset, position }) => {
              const index = getIndex(offset)
              const testimonial = testimonials[index]
              if (!testimonial) return null
              
              const config = getCardConfig(position)

              return (
                <div
                  key={`${position}-${index}`}
                  className="absolute left-1/2 top-1/2 w-[280px] sm:w-[340px] md:w-[400px] transition-all duration-500 ease-out"
                  style={{
                    transform: `translate(-50%, -50%) translateX(${config.x}) scale(${config.scale}) perspective(1000px) rotateY(${config.rotateY}deg)`,
                    opacity: config.opacity,
                    zIndex: config.zIndex,
                  }}
                >
                  {/* 3D Card with gradient and glow */}
                  <div 
                    className="relative rounded-2xl p-4 md:p-5"
                    style={{
                      background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)',
                      boxShadow: position === 'center' 
                        ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        : '0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {/* Glossy reflection overlay */}
                    <div 
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 100%)',
                      }}
                    />

                    {/* Author Info - Top Left */}
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                      <div 
                        className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden ring-2 ring-accent/50 flex-shrink-0"
                        style={{
                          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                        }}
                      >
                        {testimonial.image ? (
                          <Image
                            src={testimonial.image}
                            alt={testimonial.name}
                            width={44}
                            height={44}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-accent/30 flex items-center justify-center text-white font-bold text-lg">
                            {testimonial.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm md:text-base leading-tight">{testimonial.name}</p>
                        <p className="text-xs md:text-sm text-accent leading-tight">{testimonial.role || "Customer"}</p>
                      </div>
                      {/* Rating Stars */}
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            className={i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"} 
                          />
                        ))}
                      </div>
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed line-clamp-4 relative z-10">
                      {testimonial.comment}
                    </p>

                    {/* Bottom accent line */}
                    <div 
                      className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)',
                      }}
                    />
                  </div>
                </div>
              )
            })}n          </div>
        </div>
        </FadeInSection>

        {/* Dots Indicator */}
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-2 mt-8 md:mt-10">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isAnimating) {
                    setIsAnimating(true)
                    setTimeout(() => {
                      setActiveIndex(index)
                      setTimeout(() => setIsAnimating(false), 50)
                    }, 150)
                  }
                }}
                className={`h-2 md:h-2.5 rounded-full transition-all duration-500 ease-out ${
                  index === activeIndex 
                    ? "bg-accent w-6 md:w-8 shadow-lg shadow-accent/50" 
                    : "bg-white/30 hover:bg-white/50 w-2 md:w-2.5"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
