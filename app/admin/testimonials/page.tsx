"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, Star, MessageSquare, Image as ImageIcon, BadgeCheck, Package, Award, X } from "lucide-react"
import { useTestimonials, Testimonial } from "@/lib/hooks/use-testimonials"
import Link from "next/link"

export default function AdminTestimonialsPage() {
  const { testimonials, loading, addTestimonial, updateTestimonial, deleteTestimonial, toggleApproval, toggleFeatured } = useTestimonials()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending" | "featured">("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [imageModal, setImageModal] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    image: "",
    rating: 5,
    comment: "",
    isApproved: true,
    isFeatured: false,
  })

  const filteredTestimonials = testimonials.filter((testimonial) => {
    const matchesSearch =
      testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.productName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "approved" && testimonial.isApproved) ||
      (filterStatus === "pending" && !testimonial.isApproved) ||
      (filterStatus === "featured" && testimonial.isFeatured)

    return matchesSearch && matchesStatus
  })

  const openModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial)
      setFormData({
        name: testimonial.name,
        role: testimonial.role || "",
        image: testimonial.image || "",
        rating: testimonial.rating,
        comment: testimonial.comment,
        isApproved: testimonial.isApproved,
        isFeatured: testimonial.isFeatured || false,
      })
    } else {
      setEditingTestimonial(null)
      setFormData({
        name: "",
        role: "",
        image: "",
        rating: 5,
        comment: "",
        isApproved: true,
        isFeatured: false,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTestimonial(null)
    setFormData({
      name: "",
      role: "",
      image: "",
      rating: 5,
      comment: "",
      isApproved: true,
      isFeatured: false,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const testimonialData = {
      ...formData,
      role: formData.role || "Customer",
      source: "manual" as const,
    }

    if (editingTestimonial) {
      await updateTestimonial(editingTestimonial.id, testimonialData)
    } else {
      await addTestimonial(testimonialData)
    }
    
    closeModal()
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    await deleteTestimonial(id)
    setIsDeleting(null)
  }

  const handleToggleApproval = async (testimonial: Testimonial) => {
    await toggleApproval(testimonial.id, testimonial.isApproved)
  }

  const handleToggleFeatured = async (testimonial: Testimonial) => {
    await toggleFeatured(testimonial.id, testimonial.isFeatured || false)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Testimonials</h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage customer reviews and testimonials
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            <Plus size={20} />
            Add Testimonial
          </button>
        </div>
      </header>

      <main className="p-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search testimonials or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="featured">Featured</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <MessageSquare className="text-purple-400" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{testimonials.length}</p>
                <p className="text-sm text-gray-400">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="text-green-400" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {testimonials.filter((t) => t.isApproved).length}
                </p>
                <p className="text-sm text-gray-400">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <XCircle className="text-yellow-400" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {testimonials.filter((t) => !t.isApproved).length}
                </p>
                <p className="text-sm text-gray-400">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Award className="text-amber-400" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {testimonials.filter((t) => t.isFeatured).length}
                </p>
                <p className="text-sm text-gray-400">Featured</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-lg">
            <MessageSquare className="mx-auto text-gray-500 mb-4" size={48} />
            <p className="text-gray-400">No testimonials found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`bg-slate-800 rounded-lg p-5 border transition ${
                  testimonial.isFeatured ? "border-amber-500/50" : "border-slate-700 hover:border-slate-600"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                      {testimonial.image ? (
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                          {testimonial.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{testimonial.name}</h3>
                        {testimonial.verifiedPurchase && (
                          <BadgeCheck size={14} className="text-green-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{testimonial.role || "Customer"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        testimonial.isApproved
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {testimonial.isApproved ? "Approved" : "Pending"}
                    </span>
                    {testimonial.isFeatured && (
                      <span className="px-2 py-1 text-xs rounded-full bg-amber-500/20 text-amber-400">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                {testimonial.productName && (
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                    <Package size={12} />
                    <span>{testimonial.productName}</span>
                    {testimonial.source === "review" && (
                      <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">From Review</span>
                    )}
                  </div>
                )}

                {/* Rating */}
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < testimonial.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-600"
                      }
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                  {testimonial.comment}
                </p>

                {/* Review Images */}
                {testimonial.images && testimonial.images.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {testimonial.images.slice(0, 3).map((img, idx: number) => (
                      <Image
                        key={idx}
                        src={img}
                        alt={`Review ${idx + 1}`}
                        width={48}
                        height={48}
                        className="object-cover rounded cursor-pointer hover:opacity-80"
                      />
                    ))}
                    {testimonial.images.length > 3 && (
                      <div 
                        className="w-12 h-12 bg-slate-700 rounded flex items-center justify-center text-sm text-gray-400 cursor-pointer hover:bg-slate-600"
                        onClick={() => setImageModal(testimonial.images![3])}
                      >
                        +{testimonial.images.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Order Info */}
                {testimonial.orderId && (
                  <p className="text-xs text-gray-500 mb-3">
                    Order: {testimonial.orderId}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => handleToggleApproval(testimonial)}
                    className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs transition ${
                      testimonial.isApproved
                        ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                        : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    }`}
                    title={testimonial.isApproved ? "Unapprove" : "Approve"}
                  >
                    {testimonial.isApproved ? <XCircle size={14} /> : <CheckCircle size={14} />}
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(testimonial)}
                    className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs transition ${
                      testimonial.isFeatured
                        ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                        : "bg-slate-600/50 text-gray-400 hover:bg-slate-600"
                    }`}
                    title={testimonial.isFeatured ? "Unfeature" : "Feature"}
                  >
                    <Award size={14} />
                  </button>
                  {testimonial.productId && (
                    <Link
                      href={`/product/${testimonial.productId}`}
                      target="_blank"
                      className="flex items-center justify-center px-2 py-1.5 bg-slate-600/50 text-gray-400 rounded-lg text-xs hover:bg-slate-600 transition"
                      title="View Product"
                    >
                      <Package size={14} />
                    </Link>
                  )}
                  <div className="flex-1" />
                  <button
                    onClick={() => openModal(testimonial)}
                    className="p-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    disabled={isDeleting === testimonial.id}
                    className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition disabled:opacity-50"
                  >
                    {isDeleting === testimonial.id ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">
                {editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Role/Title (optional)
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Customer"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        size={28}
                        className={
                          star <= formData.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-600 hover:text-yellow-400"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Review *
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isApproved"
                    checked={formData.isApproved}
                    onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isApproved" className="text-gray-300">
                    Approved
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                  />
                  <label htmlFor="isFeatured" className="text-gray-300 flex items-center gap-1">
                    <Award size={14} className="text-yellow-400" />
                    Featured
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  {editingTestimonial ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModal && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setImageModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
            >
              <X size={24} />
            </button>
            <Image
              src={imageModal}
              alt="Testimonial image"
              width={500}
              height={600}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
