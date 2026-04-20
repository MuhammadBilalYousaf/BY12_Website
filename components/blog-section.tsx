"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { FadeInSection } from "@/components/animated-section"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  imageUrl: string
  createdAt: any
  category?: string
  author?: string
}

export default function BlogSection() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)

  useEffect(() => {
    const q = query(
      collection(db, "blogs"),
      where("status", "==", "published")
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blogs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BlogPost[]
      blogs.sort((a, b) => {
        const getDate = (timestamp: any): Date => {
          if (!timestamp) return new Date(0)
          if (timestamp.toDate) return timestamp.toDate()
          if (timestamp instanceof Date) return timestamp
          return new Date(timestamp)
        }
        return getDate(b.createdAt).getTime() - getDate(a.createdAt).getTime()
      })
      setBlogPosts(blogs)
    })
    return () => unsubscribe()
  }, [])

  const handlePrev = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection('left')
    setTimeout(() => {
      setActiveIndex((prev) => (prev === 0 ? blogPosts.length - 1 : prev - 1))
      setTimeout(() => {
        setIsAnimating(false)
        setDirection(null)
      }, 50)
    }, 150)
  }, [isAnimating, blogPosts.length])

  const handleNext = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection('right')
    setTimeout(() => {
      setActiveIndex((prev) => (prev === blogPosts.length - 1 ? 0 : prev + 1))
      setTimeout(() => {
        setIsAnimating(false)
        setDirection(null)
      }, 50)
    }, 150)
  }, [isAnimating, blogPosts.length])

  const handleDotClick = useCallback((index: number) => {
    if (isAnimating || index === activeIndex) return
    setIsAnimating(true)
    setDirection(index > activeIndex ? 'right' : 'left')
    setTimeout(() => {
      setActiveIndex(index)
      setTimeout(() => {
        setIsAnimating(false)
        setDirection(null)
      }, 50)
    }, 150)
  }, [isAnimating, activeIndex])

  // Get the indices for left, center, and right cards
  const getVisibleIndices = () => {
    if (blogPosts.length === 0) return { left: -1, center: -1, right: -1 }
    if (blogPosts.length === 1) return { left: -1, center: 0, right: -1 }
    if (blogPosts.length === 2) return { left: 0, center: activeIndex, right: activeIndex === 0 ? 1 : 0 }
    
    const left = activeIndex === 0 ? blogPosts.length - 1 : activeIndex - 1
    const center = activeIndex
    const right = activeIndex === blogPosts.length - 1 ? 0 : activeIndex + 1
    return { left, center, right }
  }

  const { left, center, right } = getVisibleIndices()

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  if (blogPosts.length === 0) {
    return null
  }

  return (
    <section
      className="py-16 md:py-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden relative"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <FadeInSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6 backdrop-blur-sm">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="text-accent text-sm font-medium tracking-wide uppercase">Fresh Content</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Latest{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent">
              Blogs
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Discover fragrance tips, trends, and stories from BY12
          </p>
        </FadeInSection>

        {/* Carousel Container */}
        <FadeInSection delay={0.2}>
          <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm hover:bg-accent hover:text-slate-900 text-white rounded-full p-2 md:p-3 shadow-xl transition-all duration-300 hover:scale-110 border border-white/20"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 md:w-7 md:h-7" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm hover:bg-accent hover:text-slate-900 text-white rounded-full p-2 md:p-3 shadow-xl transition-all duration-300 hover:scale-110 border border-white/20"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 md:w-7 md:h-7" />
          </button>

          {/* Cards Container */}
          <div className={`flex items-center justify-center gap-2 md:gap-6 px-10 md:px-16 transition-all duration-500 ease-out ${
            isAnimating && direction === 'right' ? 'transform -translate-x-4 opacity-80' : ''
          } ${
            isAnimating && direction === 'left' ? 'transform translate-x-4 opacity-80' : ''
          }`}>
            {/* Left Card - Partially visible with gradient */}
            {left !== -1 && (
              <div 
                key={`left-${blogPosts[left]?.id}`}
                className={`hidden sm:block relative w-1/4 flex-shrink-0 transition-all duration-500 ease-out ${
                  isAnimating ? 'scale-[0.85] opacity-40' : ''
                }`}
              >
                <div className="relative overflow-hidden rounded-xl transform scale-90 opacity-60 hover:opacity-80 hover:scale-95 transition-all duration-500 cursor-pointer"
                  onClick={handlePrev}
                >
                  <a href={`/blog/${blogPosts[left]?.id}`} className="block" onClick={(e) => e.preventDefault()}>
                    <div className="relative aspect-[4/5]">
                      <Image
                        src={blogPosts[left]?.imageUrl || "/placeholder.svg?height=300&width=240"}
                        alt={blogPosts[left]?.title || "Blog post"}
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 0vw, 25vw"
                        className="object-cover transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-l from-slate-900 via-slate-900/60 to-transparent"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-8 transition-all duration-300">
                        <h3 className="text-white font-semibold text-sm line-clamp-2">{blogPosts[left]?.title}</h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            )}

            {/* Center Card - Main featured */}
            {center !== -1 && (
              <div 
                key={`center-${blogPosts[center]?.id}`}
                className={`w-full sm:w-1/2 flex-shrink-0 z-10 transition-all duration-500 ease-out ${
                  isAnimating ? 'scale-[0.98] opacity-90' : ''
                }`}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-[1.02]">
                  <a href={`/blog/${blogPosts[center]?.id}`} className="block group">
                    <div className="relative aspect-[4/3] sm:aspect-[16/10]">
                      <Image
                        src={blogPosts[center]?.imageUrl || "/placeholder.svg?height=400&width=600"}
                        alt={blogPosts[center]?.title || "Featured blog post"}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        priority
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                      
                      {/* Category Badge */}
                      {blogPosts[center]?.category && (
                        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 transition-all duration-300">
                          <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-accent text-white text-[10px] sm:text-xs font-bold rounded-full animate-pulse">
                            {blogPosts[center].category}
                          </span>
                        </div>
                      )}

                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 transition-all duration-300">
                        <div className="flex items-center gap-2 sm:gap-3 text-white/80 text-[10px] sm:text-sm mb-2 sm:mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            {formatDate(blogPosts[center]?.createdAt)}
                          </span>
                          {blogPosts[center]?.author && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="hidden sm:inline">By {blogPosts[center].author}</span>
                            </>
                          )}
                        </div>
                        <h3 className="text-white font-bold text-base sm:text-xl md:text-2xl mb-1 sm:mb-2 line-clamp-2 group-hover:text-accent transition-colors duration-300">
                          {blogPosts[center]?.title}
                        </h3>
                        <p className="text-white/70 text-xs sm:text-sm md:text-base line-clamp-2 mb-2 sm:mb-4 hidden sm:block">
                          {blogPosts[center]?.excerpt}
                        </p>
                        <span className="inline-flex items-center gap-1 sm:gap-2 text-accent font-semibold text-xs sm:text-sm group-hover:gap-2 sm:group-hover:gap-3 transition-all duration-300">
                          Read Article 
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            )}

            {/* Right Card - Partially visible with gradient */}
            {right !== -1 && (
              <div 
                key={`right-${blogPosts[right]?.id}`}
                className={`hidden sm:block relative w-1/4 flex-shrink-0 transition-all duration-500 ease-out ${
                  isAnimating ? 'scale-[0.85] opacity-40' : ''
                }`}
              >
                <div className="relative overflow-hidden rounded-xl transform scale-90 opacity-60 hover:opacity-80 hover:scale-95 transition-all duration-500 cursor-pointer"
                  onClick={handleNext}
                >
                  <a href={`/blog/${blogPosts[right]?.id}`} className="block" onClick={(e) => e.preventDefault()}>
                    <div className="relative aspect-[4/5]">
                      <Image
                        src={blogPosts[right]?.imageUrl || "/placeholder.svg?height=300&width=240"}
                        alt={blogPosts[right]?.title || "Blog post"}
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 0vw, 25vw"
                        className="object-cover transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-8 right-4 transition-all duration-300">
                        <h3 className="text-white font-semibold text-sm line-clamp-2">{blogPosts[right]?.title}</h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6 md:mt-8">
            {blogPosts.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-2 md:h-2.5 rounded-full transition-all duration-500 ease-out ${
                  index === activeIndex 
                    ? "bg-accent w-6 md:w-8 shadow-lg shadow-accent/50" 
                    : "bg-slate-600 hover:bg-slate-500 w-2 md:w-2.5"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        </FadeInSection>

        {/* Read All Button */}
        <FadeInSection delay={0.4}>
          <div className="flex justify-center mt-8 md:mt-10">
            <a
              href="/blog"
              className="group px-6 sm:px-8 py-3 sm:py-4 bg-accent hover:bg-accent/90 text-slate-900 rounded-xl font-bold text-sm sm:text-lg shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center gap-2"
            >
              View All Articles
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}