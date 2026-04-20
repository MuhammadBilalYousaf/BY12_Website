"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, User, ArrowRight, Search, Tag } from "lucide-react"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageBreadcrumb from "@/components/page-breadcrumb"
import type { BlogPost } from "@/lib/types"
import { FadeInSection } from "@/components/animated-section"

const categories = ["All", "Fragrance Tips", "Seasonal", "Education", "History", "Industry", "News", "Reviews"]

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch blogs from Firebase
  useEffect(() => {
    const q = query(
      collection(db, "blogs"),
      where("status", "==", "published")
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const blogs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BlogPost[]

        // Sort on client side to avoid composite index requirement
        blogs.sort((a, b) => {
          const getDate = (timestamp: any): Date => {
            if (!timestamp) return new Date(0)
            if (timestamp.toDate) return timestamp.toDate()
            if (timestamp instanceof Date) return timestamp
            return new Date(timestamp)
          }
          const dateA = getDate(a.createdAt)
          const dateB = getDate(b.createdAt)
          return dateB.getTime() - dateA.getTime()
        })

        setBlogPosts(blogs)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching blogs:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const featuredPosts = blogPosts.filter(post => post.featured)
  
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <PageBreadcrumb items={[{ label: "Blog" }]} />
        </div>

        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <FadeInSection delay={0.1}>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-semibold mb-6">
                  <Calendar className="w-4 h-4" />
                  Our Blog
                </span>
              </FadeInSection>
              <FadeInSection variant="heading" delay={0.2}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Fragrance{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent">
                    Stories
                  </span>{" "}
                  & Insights
                </h1>
              </FadeInSection>
              <FadeInSection variant="text" delay={0.3}>
                <p className="text-lg md:text-xl text-slate-300 mb-8">
                  Explore the world of perfumery through expert guides, industry news, and tips to elevate your fragrance journey.
                </p>
              </FadeInSection>

              {/* Search Bar */}
              <FadeInSection delay={0.4}>
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-white placeholder:text-slate-500 shadow-lg"
                />
              </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* Loading State */}
        {loading ? (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div 
                    key={i} 
                    className="rounded-2xl overflow-hidden animate-pulse"
                    style={{
                      background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div className="h-32 sm:h-52 bg-slate-700/50"></div>
                    <div className="p-3 sm:p-6 space-y-2 sm:space-y-4">
                      <div className="h-3 sm:h-4 bg-slate-700/50 rounded w-1/3"></div>
                      <div className="h-4 sm:h-6 bg-slate-700/50 rounded w-full"></div>
                      <div className="h-3 sm:h-4 bg-slate-700/50 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Featured Posts */}
            {featuredPosts.length > 0 && searchQuery === "" && selectedCategory === "All" && (
              <section className="py-16">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                      Featured{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent">
                        Articles
                      </span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {featuredPosts.slice(0, 3).map((post, index) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.id}`}
                        className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                          index === 0 ? "lg:row-span-2" : ""
                        }`}
                        style={{
                          background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <div className={`relative ${index === 0 ? "h-80 lg:h-full" : "h-64"}`}>
                          <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                          
                          {/* Featured Badge */}
                          <span className="absolute top-4 left-4 px-3 py-1 bg-accent text-white text-xs font-bold rounded-full">
                            Featured
                          </span>

                          {/* Content Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full mb-3">
                              {post.category}
                            </span>
                            <h3 className={`font-bold text-white mb-3 group-hover:text-accent transition ${
                              index === 0 ? "text-2xl md:text-3xl" : "text-xl"
                            }`}>
                              {post.title}
                            </h3>
                            <p className="text-white/80 text-sm mb-4 line-clamp-2">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center gap-4 text-white/70 text-sm">
                              <span className="flex items-center gap-1">
                                <User size={14} />
                                {post.author}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {post.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {post.readTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Categories & Posts */}
            <section className="py-16">
              <div className="max-w-7xl mx-auto px-4">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-3 mb-12 justify-center">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                        selectedCategory === category
                          ? "bg-accent text-slate-900 shadow-lg shadow-accent/25"
                          : "bg-slate-800/50 border border-slate-700 text-slate-300 hover:border-accent/50 hover:text-accent"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Posts Grid */}
                {filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
                    {filteredPosts.map((post) => (
                      <article
                        key={post.id}
                        className="group rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                        style={{
                          background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                          boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {/* Image */}
                        <div className="relative h-28 sm:h-52 overflow-hidden">
                          <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            loading="lazy"
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                            <span className="px-1.5 py-0.5 sm:px-3 sm:py-1 bg-accent/90 text-white text-[10px] sm:text-xs font-semibold rounded-full">
                              {post.category}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-2 sm:p-6">
                          {/* Meta */}
                          <div className="flex items-center gap-2 sm:gap-4 text-slate-400 text-[10px] sm:text-sm mb-2 sm:mb-4">
                            <span className="flex items-center gap-0.5 sm:gap-1">
                              <Calendar className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                              <span className="hidden sm:inline">{post.date}</span>
                              <span className="sm:hidden">{post.date?.split(' ')[0]}</span>
                            </span>
                            <span className="hidden sm:flex items-center gap-1">
                              <Clock size={14} />
                              {post.readTime}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-xs sm:text-xl font-bold text-white mb-1 sm:mb-3 group-hover:text-accent transition line-clamp-2">
                            {post.title}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-slate-400 text-[10px] sm:text-sm mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                            {post.excerpt}
                          </p>

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="hidden sm:flex flex-wrap gap-2 mb-4">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-md"
                                >
                                  <Tag size={10} />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Author & Read More */}
                          <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-slate-700">
                            <div className="hidden sm:flex items-center gap-2">
                              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                                <User size={14} className="text-accent" />
                              </div>
                              <span className="text-sm font-medium text-white">{post.author}</span>
                            </div>
                            <Link
                              href={`/blog/${post.id}`}
                              className="inline-flex items-center gap-0.5 sm:gap-1 text-accent font-semibold text-[10px] sm:text-sm hover:gap-1 sm:hover:gap-2 transition-all"
                            >
                              Read More
                              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div 
                    className="text-center py-16 rounded-2xl"
                    style={{
                      background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.3) 0%, rgba(30, 41, 59, 0.3) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search size={40} className="text-slate-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No articles found</h3>
                    <p className="text-slate-400 mb-6">
                      Try adjusting your search or filter to find what you're looking for.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCategory("All")
                      }}
                      className="px-6 py-3 bg-accent text-slate-900 rounded-full font-semibold hover:bg-accent/90 transition shadow-lg shadow-accent/25"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Newsletter Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-semibold mb-6">
              Stay Updated
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Subscribe to Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent">
                Newsletter
              </span>
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Get the latest fragrance tips, exclusive offers, and new article notifications delivered straight to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-white placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-accent text-slate-900 rounded-full font-semibold hover:bg-accent/90 transition shadow-lg shadow-accent/25"
              >
                Subscribe
              </button>
            </form>
            <p className="text-sm text-slate-400 mt-4">
              No spam, unsubscribe anytime. Read our{" "}
              <Link href="/privacy" className="text-accent hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}