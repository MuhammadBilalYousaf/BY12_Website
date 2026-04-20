"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, Search, Eye, EyeOff, Star, StarOff, Sparkles, Loader2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from "firebase/firestore"
import { useAdmin } from "@/lib/contexts"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  authorBio: string
  authorImage: string
  readTime: string
  category: string
  imageUrl: string
  featured: boolean
  status: "published" | "draft"
  tags: string[]
  createdAt: any
  updatedAt: any
}

const categories = ["Fragrance Tips", "Seasonal", "Education", "History", "Industry", "News", "Reviews"]

export default function AdminBlogsPage() {
  const router = useRouter()
  const { admin } = useAdmin()
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    authorBio: "",
    authorImage: "",
    readTime: "",
    category: "Fragrance Tips",
    imageUrl: "",
    featured: false,
    status: "draft" as "published" | "draft",
    tags: ""
  })

  // Auth is handled by admin layout - no redirect needed here

  // Fetch blogs from Firebase
  useEffect(() => {
    const blogsRef = collection(db, "blogs")

    const unsubscribe = onSnapshot(
      blogsRef,
      (snapshot) => {
        const blogsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BlogPost[]
        
        blogsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0)
          const dateB = b.createdAt?.toDate?.() || new Date(0)
          return dateB.getTime() - dateA.getTime()
        })
        
        setBlogs(blogsData)
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error("Error fetching blogs:", error)
        setError("Failed to fetch blogs. Please check your Firebase configuration.")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Filter blogs
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.author?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "All Categories" || blog.category === categoryFilter
    const matchesStatus = statusFilter === "All Status" || blog.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleAddBlog = () => {
    setModalMode("add")
    setSelectedBlog(null)
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      author: "",
      authorBio: "",
      authorImage: "",
      readTime: "",
      category: "Fragrance Tips",
      imageUrl: "",
      featured: false,
      status: "draft",
      tags: ""
    })
    setError(null)
    setIsModalOpen(true)
  }

  const handleEditBlog = (blog: BlogPost) => {
    setModalMode("edit")
    setSelectedBlog(blog)
    setFormData({
      title: blog.title || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      author: blog.author || "",
      authorBio: blog.authorBio || "",
      authorImage: blog.authorImage || "",
      readTime: blog.readTime || "",
      category: blog.category || "Fragrance Tips",
      imageUrl: blog.imageUrl || "",
      featured: blog.featured || false,
      status: blog.status || "draft",
      tags: blog.tags?.join(", ") || ""
    })
    setError(null)
    setIsModalOpen(true)
  }

  // AI Generate function
  const handleGenerateWithAI = async () => {
    if (!formData.title.trim()) {
      setError("Please enter a title first to generate content with AI")
      return
    }

    setGenerating(true)
    setError(null)
    setRetryAfter(null)

    try {
      const response = await fetch("/api/generate-blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim()
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429 && data.retryAfter) {
          setRetryAfter(data.retryAfter)
        }
        throw new Error(data.error || "Failed to generate content")
      }

      // Update form with AI-generated content
      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        excerpt: data.excerpt || prev.excerpt,
        content: data.content || prev.content,
        tags: data.tags || prev.tags,
        readTime: data.readTime || prev.readTime
      }))

    } catch (error: any) {
      console.error("AI Generation Error:", error)
      setError(error.message || "Failed to generate content with AI")
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const tagsArray = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const blogData = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        author: formData.author.trim(),
        authorBio: formData.authorBio.trim(),
        authorImage: formData.authorImage.trim(),
        readTime: formData.readTime.trim(),
        category: formData.category,
        imageUrl: formData.imageUrl.trim(),
        featured: formData.featured,
        status: formData.status,
        tags: tagsArray,
        updatedAt: serverTimestamp()
      }

      console.log("Saving blog data:", blogData)

      if (modalMode === "add") {
        const docRef = await addDoc(collection(db, "blogs"), {
          ...blogData,
          createdAt: serverTimestamp()
        })
        console.log("Blog created with ID:", docRef.id)
      } else if (selectedBlog) {
        await updateDoc(doc(db, "blogs", selectedBlog.id), blogData)
        console.log("Blog updated:", selectedBlog.id)
      }

      setIsModalOpen(false)
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        author: "",
        authorBio: "",
        authorImage: "",
        readTime: "",
        category: "Fragrance Tips",
        imageUrl: "",
        featured: false,
        status: "draft",
        tags: ""
      })
    } catch (error: any) {
      console.error("Error saving blog:", error)
      setError(error.message || "Failed to save blog. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBlog = async (blogId: string) => {
    if (deleteConfirm === blogId) {
      try {
        await deleteDoc(doc(db, "blogs", blogId))
        console.log("Blog deleted:", blogId)
        setDeleteConfirm(null)
      } catch (error: any) {
        console.error("Error deleting blog:", error)
        setError(error.message || "Failed to delete blog.")
      }
    } else {
      setDeleteConfirm(blogId)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const toggleFeatured = async (blog: BlogPost) => {
    try {
      await updateDoc(doc(db, "blogs", blog.id), {
        featured: !blog.featured,
        updatedAt: serverTimestamp()
      })
    } catch (error: any) {
      console.error("Error updating featured status:", error)
      setError(error.message || "Failed to update featured status.")
    }
  }

  const toggleStatus = async (blog: BlogPost) => {
    try {
      await updateDoc(doc(db, "blogs", blog.id), {
        status: blog.status === "published" ? "draft" : "published",
        updatedAt: serverTimestamp()
      })
    } catch (error: any) {
      console.error("Error updating status:", error)
      setError(error.message || "Failed to update status.")
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    } catch {
      return "N/A"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Blog Management</h1>
            <p className="text-gray-400 mt-1">Manage your blog posts and articles</p>
          </div>
          <button
            onClick={handleAddBlog}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 transition"
          >
            <Plus size={20} />
            Add New Blog
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option>All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option>All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <div className="text-gray-400 flex items-center">
            Total: {filteredBlogs.length} blogs
          </div>
        </div>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-amber-500/50 transition"
            >
              {/* Image */}
              <div className="relative h-48">
                <Image
                  src={blog.imageUrl || "https://via.placeholder.com/400x200?text=No+Image"}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  onError={() => {
                    // Image error handling
                  }}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    blog.status === "published" 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {blog.status}
                  </span>
                  {blog.featured && (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-amber-500/20 text-amber-400">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <span className="text-xs text-amber-500 font-semibold">{blog.category}</span>
                <h3 className="text-lg font-bold text-white mt-1 line-clamp-2">{blog.title}</h3>
                <p className="text-gray-400 text-sm mt-2 line-clamp-2">{blog.excerpt}</p>
                
                <div className="flex items-center gap-2 mt-3 text-gray-500 text-xs">
                  <span>{blog.author}</span>
                  <span>•</span>
                  <span>{blog.readTime}</span>
                  <span>•</span>
                  <span>{formatDate(blog.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => toggleStatus(blog)}
                    className={`p-2 rounded-lg transition ${
                      blog.status === "published"
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                    }`}
                    title={blog.status === "published" ? "Unpublish" : "Publish"}
                  >
                    {blog.status === "published" ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button
                    onClick={() => toggleFeatured(blog)}
                    className={`p-2 rounded-lg transition ${
                      blog.featured
                        ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                        : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                    }`}
                    title={blog.featured ? "Remove from featured" : "Add to featured"}
                  >
                    {blog.featured ? <Star size={18} fill="currentColor" /> : <StarOff size={18} />}
                  </button>
                  <button
                    onClick={() => handleEditBlog(blog)}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteBlog(blog.id)}
                    className={`p-2 rounded-lg transition ${
                      deleteConfirm === blog.id
                        ? "bg-red-500 text-white"
                        : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    }`}
                    title={deleteConfirm === blog.id ? "Click again to confirm" : "Delete"}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBlogs.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No blogs found</p>
            <button
              onClick={handleAddBlog}
              className="mt-4 px-6 py-3 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 transition"
            >
              Create Your First Blog
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 px-6 py-4 border-b border-gray-700 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-white">
                {modalMode === "add" ? "Add New Blog" : "Edit Blog"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Error */}
            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                <p>{error}</p>
                {retryAfter && (
                  <p className="mt-2 text-sm">
                    💡 Tip: Wait {retryAfter} seconds or upgrade your Gemini API plan for higher limits.
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSaveBlog} className="p-6 space-y-6">
              {/* Title with AI Generate Button */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter a topic or title for your blog..."
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGenerateWithAI}
                    disabled={generating || !formData.title.trim()}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-pink-500 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {generating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Generate with AI
                      </>
                    )}
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Enter a topic and click "Generate with AI" to auto-fill title, excerpt, content, tags, and read time.
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Excerpt *</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  placeholder="A short summary of your blog post..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Content (HTML) *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="<p>Your blog content here...</p>

<h2>Subheading</h2>
<p>More content...</p>

<ul>
  <li>List item 1</li>
  <li>List item 2</li>
</ul>"
                  required
                />
                <p className="text-gray-500 text-xs mt-1">Use HTML tags like &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt; for formatting.</p>
              </div>

              {/* Author Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Author Name *</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Read Time *</label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    placeholder="e.g., 5 min read"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Author Bio</label>
                  <input
                    type="text"
                    value={formData.authorBio}
                    onChange={(e) => setFormData({ ...formData, authorBio: e.target.value })}
                    placeholder="Short bio about the author"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Author Image URL</label>
                  <input
                    type="url"
                    value={formData.authorImage}
                    onChange={(e) => setFormData({ ...formData, authorImage: e.target.value })}
                    placeholder="https://example.com/author.jpg"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Category & Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cover Image URL *</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Image Preview */}
              {formData.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Image Preview</label>
                  <div className="relative w-full h-48 rounded-lg border border-gray-600 overflow-hidden">
                    <Image
                      src={formData.imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., Tips, Fragrance, Guide"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Status & Featured */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status === "published"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? "published" : "draft" })}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-gray-300">Publish immediately</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-gray-300">Featured post</span>
                </label>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || generating}
                  className="flex-1 px-6 py-3 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : modalMode === "add" ? "Create Blog" : "Update Blog"}
                </button>
              </div>
            </form>
            </div>
        </div>
      )}
    </div>
  )
}