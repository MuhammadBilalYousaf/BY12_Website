"use client"

import { useState } from "react"
import { Plus, Search, Edit2, Trash2, Tag, ToggleLeft, ToggleRight, Calendar, Percent, Banknote } from "lucide-react"
import { useCoupons, Coupon } from "@/lib/hooks/use-coupons"

export default function AdminCoupons() {
  const { coupons, loading, addCoupon, updateCoupon, deleteCoupon, toggleCouponStatus } = useCoupons()
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Filter coupons based on search
  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddNew = () => {
    setEditingCoupon(null)
    setIsModalOpen(true)
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    const result = await deleteCoupon(id)
    if (result.success) {
      setDeleteConfirm(null)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleCouponStatus(id, !currentStatus)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "No expiry"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const isExpired = (dateString: string) => {
    if (!dateString) return false
    return new Date(dateString) < new Date()
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Coupons</h1>
            <p className="text-sm text-gray-400 mt-1">Manage discount coupons</p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Plus size={18} />
            Add Coupon
          </button>
        </div>
      </header>

      <main className="p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Tag className="text-purple-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{coupons.length}</p>
                <p className="text-sm text-gray-400">Total Coupons</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <ToggleRight className="text-green-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{coupons.filter(c => c.isActive).length}</p>
                <p className="text-sm text-gray-400">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-600/20 rounded-lg">
                <Percent className="text-yellow-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{coupons.filter(c => c.discountType === "percentage").length}</p>
                <p className="text-sm text-gray-400">Percentage</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Banknote className="text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{coupons.filter(c => c.discountType === "fixed").length}</p>
                <p className="text-sm text-gray-400">Fixed Amount (PKR)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
            <Tag className="mx-auto text-gray-500 mb-4" size={48} />
            <p className="text-gray-400">No coupons found</p>
            <button
              onClick={handleAddNew}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Create your first coupon
            </button>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/50">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Code</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Discount</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Min Purchase</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Usage</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Expiry</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-purple-400" />
                          <span className="font-mono font-semibold text-white">{coupon.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-sm font-semibold">
                          {coupon.discountType === "percentage" ? (
                            <>
                              <Percent size={14} />
                              {coupon.discountValue}%
                            </>
                          ) : (
                            <>
                              Rs.{coupon.discountValue}
                            </>
                          )}
                        </span>
                        {coupon.discountType === "percentage" && coupon.maxDiscount > 0 && (
                          <span className="block text-xs text-gray-400 mt-1">
                            Max: Rs. {coupon.maxDiscount}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {coupon.minPurchase > 0 ? `Rs. ${coupon.minPurchase}` : "None"}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {coupon.usedCount} / {coupon.usageLimit > 0 ? coupon.usageLimit : "∞"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${isExpired(coupon.expiryDate) ? "text-red-400" : "text-gray-300"}`}>
                          {formatDate(coupon.expiryDate)}
                          {isExpired(coupon.expiryDate) && (
                            <span className="block text-xs text-red-400">Expired</span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition ${
                            coupon.isActive
                              ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                              : "bg-gray-600/20 text-gray-400 hover:bg-gray-600/30"
                          }`}
                        >
                          {coupon.isActive ? (
                            <>
                              <ToggleRight size={16} />
                              Active
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={16} />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-slate-600 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          {deleteConfirm === coupon.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(coupon.id)}
                                className="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(coupon.id)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-600 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <CouponModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={editingCoupon ? updateCoupon : addCoupon}
          coupon={editingCoupon}
          mode={editingCoupon ? "edit" : "add"}
        />
      )}
    </div>
  )
}

// Coupon Modal Component
interface CouponModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: any
  coupon?: Coupon | null
  mode: "add" | "edit"
}

function CouponModal({ isOpen, onClose, onSave, coupon, mode }: CouponModalProps) {
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 10,
    minPurchase: 0,
    maxDiscount: 0,
    usageLimit: 0,
    expiryDate: "",
    isActive: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  // Initialize form data when editing
  useState(() => {
    if (coupon && mode === "edit") {
      setFormData({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minPurchase: coupon.minPurchase || 0,
        maxDiscount: coupon.maxDiscount || 0,
        usageLimit: coupon.usageLimit || 0,
        expiryDate: coupon.expiryDate || "",
        isActive: coupon.isActive,
      })
    }
  })

  // Reset form when modal opens
  const resetForm = () => {
    if (coupon && mode === "edit") {
      setFormData({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minPurchase: coupon.minPurchase || 0,
        maxDiscount: coupon.maxDiscount || 0,
        usageLimit: coupon.usageLimit || 0,
        expiryDate: coupon.expiryDate || "",
        isActive: coupon.isActive,
      })
    } else {
      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: 10,
        minPurchase: 0,
        maxDiscount: 0,
        usageLimit: 0,
        expiryDate: "",
        isActive: true,
      })
    }
    setError("")
  }

  // Reset form when modal opens or coupon changes
  if (isOpen) {
    // Use useEffect pattern instead
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSaving(true)

    if (!formData.code.trim()) {
      setError("Please enter a coupon code")
      setIsSaving(false)
      return
    }

    if (formData.discountValue <= 0) {
      setError("Discount value must be greater than 0")
      setIsSaving(false)
      return
    }

    if (formData.discountType === "percentage" && formData.discountValue > 100) {
      setError("Percentage discount cannot exceed 100%")
      setIsSaving(false)
      return
    }

    try {
      let result
      if (mode === "edit" && coupon) {
        result = await (onSave as (id: string, data: any) => Promise<any>)(coupon.id, formData)
      } else {
        result = await (onSave as (data: any) => Promise<any>)(formData)
      }

      if (result.success) {
        onClose()
      } else {
        setError(result.error || "Failed to save coupon")
      }
    } catch (err: any) {
      setError(err.message || "Failed to save coupon")
    }

    setIsSaving(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            {mode === "add" ? "Create New Coupon" : "Edit Coupon"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Coupon Code *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., SAVE10, WELCOME20"
              disabled={mode === "edit"}
              required
            />
            {mode === "edit" && (
              <p className="text-xs text-gray-500 mt-1">Coupon code cannot be changed</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Discount Type *
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as "percentage" | "fixed" })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (PKR)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Discount Value *
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
                max={formData.discountType === "percentage" ? 100 : undefined}
                step={formData.discountType === "percentage" ? 1 : 0.01}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Minimum Purchase (PKR)
              </label>
              <input
                type="number"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
                step="0.01"
                placeholder="0 = No minimum"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Max Discount (PKR)
              </label>
              <input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
                step="0.01"
                placeholder="0 = No limit"
                disabled={formData.discountType === "fixed"}
              />
              {formData.discountType === "percentage" && (
                <p className="text-xs text-gray-500 mt-1">For percentage discounts only</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Usage Limit
              </label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
                placeholder="0 = Unlimited"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="isActive" className="text-gray-300 cursor-pointer">
              Coupon is active
            </label>
          </div>

          {/* Preview */}
          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-sm text-gray-400 mb-2">Preview:</p>
            <p className="text-white">
              <span className="font-mono font-bold text-purple-400">{formData.code || "CODE"}</span>
              {" - "}
              {formData.discountType === "percentage" 
                ? `${formData.discountValue}% off`
                : `Rs. ${formData.discountValue} off`}
              {formData.minPurchase > 0 && ` on orders above Rs. ${formData.minPurchase}`}
              {formData.discountType === "percentage" && formData.maxDiscount > 0 && ` (max Rs. ${formData.maxDiscount})`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : mode === "add" ? "Create Coupon" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
