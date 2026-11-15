"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, User, ArrowLeft, Tag, Heart, Facebook, Instagram, Copy, Check } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageBreadcrumb from "@/components/page-breadcrumb"
import { BlogPostSchema, BreadcrumbSchema } from "@/components/seo-schemas"
import { useLikedBlogs } from "@/lib/hooks/use-liked-blogs"
import { isoDate } from "@/lib/seo"
import { FadeInSection, FadeInStagger, FadeInItem } from "@/components/animated-section"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  authorBio?: string
  authorImage?: string
  readTime: string
  category: string
  imageUrl: string
  featured: boolean
  status: string
  tags: string[]
  likeCount?: number
  createdAt?: any
  updatedAt?: any
}

export default function BlogPageClient({ initialPost, recommendedProducts = [] }: { initialPost: BlogPost; recommendedProducts?: { id: string; name: string }[] }) {
  const postId = initialPost.id
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(initialPost)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const { isLiked, toggleLike } = useLikedBlogs()

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const docRef = doc(db, "blogs", postId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists() && docSnap.data().status === "published") {
          const blogData = { id: docSnap.id, ...docSnap.data() } as BlogPost
          setPost(blogData)

          // Fetch related posts from same category
          const relatedQuery = query(
            collection(db, "blogs"),
            where("category", "==", blogData.category),
            where("status", "==", "published"),
            limit(4)
          )
          const relatedSnap = await getDocs(relatedQuery)
          const relatedBlogs = relatedSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as BlogPost))
            .filter(blog => blog.id !== postId)
            .slice(0, 3)
          setRelatedPosts(relatedBlogs)
        }
      } catch (error) {
        console.error("Error fetching blog:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [postId])

  const handleShare = async (platform: string) => {
    const url = window.location.href
    const title = post?.title || ""

    switch (platform) {
      case "facebook":
        window.open("https://web.facebook.com/profile.php?id=61586869565572", "_blank")
        break
      case "instagram":
        window.open("https://www.instagram.com/bilalyousaf12.pk/", "_blank")
        break
      case "tiktok":
        window.open("https://www.tiktok.com/@bilalyousaf12.pk", "_blank")
        break
      case "copy":
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        break
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("en-US", { timeZone: "Asia/Karachi",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
        <Footer />
      </>
    )
  }

  if (!post) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <FadeInSection className="text-center" variant="heading">
            <h1 className="text-4xl font-bold text-white mb-4">Article Not Found</h1>
            <p className="text-slate-400 mb-8">The article you're looking for doesn't exist.</p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-slate-900 rounded-full font-semibold hover:bg-accent/90 btn-premium shadow-lg shadow-accent/25"
            >
              <ArrowLeft size={20} />
              Back to Blog
            </Link>
          </FadeInSection>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      {/* SEO Schemas */}
      <BlogPostSchema
        title={post.title}
        description={post.excerpt}
        image={post.imageUrl}
        author={post.author}
        datePublished={isoDate(post.createdAt) || ""}
        dateModified={isoDate(post.updatedAt)}
        url={`https://www.bilalyousaf12.store/blog/${post.id}`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Blog", url: "/blog" },
          { name: post.category },
          { name: post.title }
        ]}
      />

      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
          <PageBreadcrumb
            items={[
              { label: "Blog", href: "/blog" },
              { label: post.category, href: `/blog?category=${post.category}` },
              { label: post.title }
            ]}
          />
        </div>

        {/* Hero Section */}
        <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20"></div>

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <FadeInSection className="max-w-4xl mx-auto" variant="heading" blur delay={0.1}>
              <span className="inline-block px-4 py-1.5 bg-accent text-white text-sm font-semibold rounded-full mb-4">
                {post.category}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                <span className="flex items-center gap-2">
                  {post.authorImage ? (
                    <Image
                      src={post.authorImage}
                      alt={post.author}
                      width={32}
                      height={32}
                      loading="lazy"
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent/50 flex items-center justify-center">
                      <User size={16} />
                    </div>
                  )}
                  {post.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {formatDate(post.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {post.readTime}
                </span>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Sidebar - Share & Like */}
              <aside className="lg:col-span-1">
                <FadeInSection className="lg:sticky lg:top-24 flex lg:flex-col gap-3" delay={0.15}>
                  <button
                    onClick={() => post && toggleLike({
                      id: post.id,
                      title: post.title,
                      imageUrl: post.imageUrl,
                      category: post.category
                    })}
                    className={`p-3 rounded-full border transition ${
                      post && isLiked(post.id)
                        ? "bg-red-500 border-red-500 text-white"
                        : "border-slate-600 text-slate-400 hover:border-accent hover:text-accent"
                    }`}
                    title={post && isLiked(post.id) ? "Unlike this article" : "Like this article"}
                  >
                    <Heart size={20} fill={post && isLiked(post.id) ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="p-3 rounded-full border border-slate-600 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition"
                  >
                    <Facebook size={20} />
                  </button>
                  <button
                    onClick={() => handleShare("instagram")}
                    className="p-3 rounded-full border border-slate-600 text-slate-400 hover:border-pink-500 hover:text-pink-500 transition"
                  >
                    <Instagram size={20} />
                  </button>
                  <button
                    onClick={() => handleShare("tiktok")}
                    className="p-3 rounded-full border border-slate-600 text-slate-400 hover:border-white hover:text-white transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                  </button>
                  <button
                    onClick={() => handleShare("copy")}
                    className={`p-3 rounded-full border transition ${
                      copied
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-slate-600 text-slate-400 hover:border-accent hover:text-accent"
                    }`}
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </FadeInSection>
              </aside>

              {/* Main Content */}
              <FadeInSection className="lg:col-span-11" delay={0.2}>
              <article>
                {/* Excerpt */}
                <p className="text-xl text-slate-300 leading-relaxed mb-8 font-medium">
                  {post.excerpt}
                </p>

                {/* Content */}
                <style>{`
                  .blog-content * {
                    color: white !important;
                  }
                  .blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4, .blog-content h5, .blog-content h6 {
                    color: var(--accent) !important;
                  }
                  .blog-content a {
                    color: var(--accent) !important;
                  }
                `}</style>
                <div
                  className="blog-content prose prose-lg max-w-none prose-invert
                    prose-headings:!text-accent prose-headings:font-bold
                    prose-h1:!text-accent prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-4
                    prose-h2:!text-accent prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                    prose-h3:!text-accent prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                    prose-h4:!text-accent prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2
                    prose-p:!text-white prose-p:leading-relaxed prose-p:mb-4
                    prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                    prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                    prose-li:!text-white prose-li:mb-2
                    prose-strong:!text-white prose-strong:font-semibold
                    prose-a:!text-accent prose-a:no-underline hover:prose-a:underline"
                  style={{ '--accent': '#d4af37' } as React.CSSProperties}
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <aside aria-label="Fragrance buying resources" className="mt-10 rounded-xl border border-slate-700 bg-slate-800/40 p-5">
                  <h2 className="text-xl font-bold text-white mb-3">Explore the BY12 collection</h2>
                  <p className="text-slate-300 mb-3">Use each product’s description, size options and current availability to help you choose.</p>
                  <ul className="space-y-2 text-accent">{recommendedProducts.map(product => <li key={product.id}><Link className="hover:underline" href={`/product/${product.id}`}>{product.name}</Link></li>)}</ul>
                  <p className="text-slate-300 mt-4">Before buying, <Link href="/guides/30ml-vs-50ml-perfume" className="text-accent hover:underline">compare bottle sizes</Link> or <Link href="/testers" className="text-accent hover:underline">check available testers</Link>.</p>
                </aside>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-slate-700">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-slate-800/50 text-slate-400 text-sm rounded-full hover:bg-accent hover:text-slate-900 transition cursor-pointer"
                      >
                        <Tag size={14} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Author Box */}
                <div
                  className="mt-10 p-6 rounded-2xl"
                  style={{
                    background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    {post.authorImage ? (
                      <Image
                        src={post.authorImage}
                        alt={post.author}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                        <User size={24} className="text-accent" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        Written by {post.author}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {post.authorBio || "Fragrance enthusiast and writer."}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4">
              <FadeInSection variant="heading" blur className="mb-10">
                <h2 className="text-3xl font-bold text-white">
                  Related <span className="text-accent">Articles</span>
                </h2>
              </FadeInSection>

              <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <FadeInItem key={relatedPost.id}>
                    <Link
                      href={`/blog/${relatedPost.id}`}
                      className="group block rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 product-card-premium"
                      style={{
                        background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={relatedPost.imageUrl}
                          alt={relatedPost.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover motion-safe:group-hover:scale-[1.04] transition-transform duration-300"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-3 text-slate-400 text-xs mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(relatedPost.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {relatedPost.readTime}
                          </span>
                        </div>
                        <h3 className="font-bold text-white group-hover:text-accent transition line-clamp-2">
                          {relatedPost.title}
                        </h3>
                      </div>
                    </Link>
                  </FadeInItem>
                ))}
              </FadeInStagger>
            </div>
          </section>
        )}

        {/* Newsletter CTA */}
        <section className="py-16">
          <FadeInSection className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Enjoyed this article?
            </h2>
            <p className="text-slate-400 mb-6">
              Subscribe to our newsletter for more fragrance insights and tips.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-slate-900 rounded-full font-semibold hover:bg-accent/90 btn-premium shadow-lg shadow-accent/25"
            >
              Explore More Articles
              <ArrowLeft size={20} className="rotate-180" />
            </Link>
          </FadeInSection>
        </section>
      </div>
      <Footer />
    </>
  )
}
