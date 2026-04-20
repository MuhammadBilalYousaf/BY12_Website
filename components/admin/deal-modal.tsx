"use client"

import { useEffect, useState } from "react"
import { Plus, Star, Trash2, X } from "lucide-react"
import type { Deal } from "@/lib/types"

interface DealModalFormData {
  title: string
  description: string
  includedItems: string[]
  images: string[]
  originalPrice: number
  dealPrice: number
  badge: string
  endDate: string
  isActive: boolean
  featured: boolean
}

interface DealModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (dealData: Omit<Deal, "id" | "createdAt" | "updatedAt">) => Promise<{ success: boolean; error?: string }>
  deal?: Deal | null
  mode: "add" | "edit"
}

const defaultFormData: DealModalFormData = {
  title: "",
  description: "",
  includedItems: [],
  images: [],
  originalPrice: 0,
  dealPrice: 0,
  badge: "",
  endDate: "",
  isActive: true,
  featured: false,
}

export default function DealModal({ isOpen, onClose, onSave, deal, mode }: DealModalProps) {
  const [formData, setFormData] = useState<DealModalFormData>(defaultFormData)
  const [newIncludedItem, setNewIncludedItem] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (deal && mode === "edit") {
      const existingImages = Array.isArray(deal.images) && deal.images.length > 0
        ? deal.images
        : deal.imageUrl
          ? [deal.imageUrl]
          : []

      const endDate = deal.endDate?.toDate
        ? deal.endDate.toDate().toISOString().slice(0, 10)
        : deal.endDate
          ? new Date(deal.endDate).toISOString().slice(0, 10)
          : ""

      setFormData({
        title: deal.title,
        description: deal.description,
        includedItems: Array.isArray(deal.includedItems)
          ? deal.includedItems.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
          : [],
        images: existingImages,
        originalPrice: deal.originalPrice,
        dealPrice: deal.dealPrice,
        badge: deal.badge || "",
        endDate,
        isActive: deal.isActive,
        featured: !!deal.featured,
      })
    } else {
      setFormData(defaultFormData)
    }

    setNewIncludedItem("")
    setNewImageUrl("")
    setError("")
  }, [deal, mode, isOpen])

  const handleAddIncludedItem = () => {
    const value = newIncludedItem.trim()
    if (!value) return

    if (formData.includedItems.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setError("This included item already exists")
      return
    }

    setFormData((prev) => ({
      ...prev,
      includedItems: [...prev.includedItems, value],
    }))
    setNewIncludedItem("")
    setError("")
  }

  const handleRemoveIncludedItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      includedItems: prev.includedItems.filter((_, i) => i !== index),
    }))
  }

  const handleAddImageUrl = () => {
    const url = newImageUrl.trim()
    if (!url) return

    if (formData.images.includes(url)) {
      setError("This image URL already exists")
      return
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }))
    setNewImageUrl("")
    setError("")
  }

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Please enter title and description")
      return
    }

    if (formData.images.length === 0) {
      setError("Please add at least one deal image URL")
      return
    }

    if (formData.originalPrice <= 0 || formData.dealPrice <= 0) {
      setError("Prices must be greater than 0")
      return
    }

    if (formData.dealPrice >= formData.originalPrice) {
      setError("Deal price must be lower than original price")
      return
    }

    const dealData: Omit<Deal, "id" | "createdAt" | "updatedAt"> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      includedItems: formData.includedItems.map((item) => item.trim()).filter((item) => item.length > 0),
      imageUrl: formData.images[0],
      images: formData.images,
      originalPrice: Number(formData.originalPrice),
      dealPrice: Number(formData.dealPrice),
      badge: formData.badge.trim() || "",
      endDate: formData.endDate ? new Date(formData.endDate) : null,
      isActive: formData.isActive,
      featured: formData.featured,
    }

    setIsSaving(true)
    const result = await onSave(dealData)

    if (result.success) {
      onClose()
    } else {
      setError(result.error || "Failed to save deal")
    }

    setIsSaving(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {mode === "add" ? "Add New Deal" : "Edit Deal"}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Deal Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">What is included (Optional)</label>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newIncludedItem}
                  onChange={(e) => setNewIncludedItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddIncludedItem()
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Example: Ravla by BY12 - 50ml"
                />
                <button
                  type="button"
                  onClick={handleAddIncludedItem}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium flex items-center gap-1"
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              {formData.includedItems.length > 0 && (
                <div className="space-y-2">
                  {formData.includedItems.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg"
                    >
                      <p className="text-sm text-gray-200 min-w-0 flex-1 truncate">{item}</p>
                      <button
                        type="button"
                        onClick={() => handleRemoveIncludedItem(index)}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition"
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Image URL *</label>

              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddImageUrl()
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Paste image URL and click Add..."
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium flex items-center gap-1"
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              {formData.images.length > 0 && (
                <div className="space-y-2">
                  {formData.images.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-300 truncate">{url}</p>
                        {index === 0 && <p className="text-[11px] text-purple-300">Primary image</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition"
                        title="Remove image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Original Price *</label>
              <input
                type="number"
                min={1}
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Deal Price *</label>
              <input
                type="number"
                min={1}
                value={formData.dealPrice}
                onChange={(e) => setFormData({ ...formData, dealPrice: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Badge (Optional)</label>
              <input
                type="text"
                placeholder="Hot Deal"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
              <select
                value={formData.isActive ? "active" : "inactive"}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "active" })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${formData.featured ? "bg-yellow-500/20" : "bg-slate-600"}`}>
                    <Star
                      size={20}
                      className={formData.featured ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}
                    />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Featured Deal</p>
                    <p className="text-sm text-gray-400">Display this deal in highlighted sections</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.featured ? "bg-purple-600" : "bg-slate-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.featured ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : mode === "add" ? "Add Deal" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}