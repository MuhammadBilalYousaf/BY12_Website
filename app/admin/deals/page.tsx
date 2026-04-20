"use client"

import { useMemo, useState } from "react"
import { BadgePercent, Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, Flame, Calendar } from "lucide-react"
import { useDeals } from "@/lib/hooks/use-deals"
import type { Deal } from "@/lib/types"
import DealModal from "@/components/admin/deal-modal"

export default function AdminDealsPage() {
  const { deals, loading, addDeal, updateDeal, deleteDeal, toggleDealStatus } = useDeals()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesSearch =
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && deal.isActive) ||
        (statusFilter === "inactive" && !deal.isActive)

      return matchesSearch && matchesStatus
    })
  }, [deals, searchQuery, statusFilter])

  const openAddModal = () => {
    setModalMode("add")
    setEditingDeal(null)
    setIsModalOpen(true)
  }

  const openEditModal = (deal: Deal) => {
    setModalMode("edit")
    setEditingDeal(deal)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingDeal(null)
  }

  const handleSaveDeal = async (dealData: Omit<Deal, "id" | "createdAt" | "updatedAt">) => {
    if (modalMode === "add") {
      return await addDeal(dealData)
    }

    if (editingDeal) {
      return await updateDeal(editingDeal.id, dealData)
    }

    return { success: false, error: "No deal selected for editing" }
  }

  const handleDelete = async (dealId: string) => {
    const result = await deleteDeal(dealId)
    if (result.success) {
      setDeleteConfirm(null)
    }
  }

  const activeCount = deals.filter((deal) => deal.isActive).length
  const featuredCount = deals.filter((deal) => deal.featured).length

  return (
    <div className="min-h-screen">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Deals</h1>
            <p className="text-sm text-gray-400 mt-1">Create and manage homepage/shop deals</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Plus size={18} />
            Add Deal
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <BadgePercent className="text-purple-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{deals.length}</p>
                <p className="text-sm text-gray-400">Total Deals</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <ToggleRight className="text-green-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{activeCount}</p>
                <p className="text-sm text-gray-400">Active Deals</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-600/20 rounded-lg">
                <Flame className="text-yellow-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{featuredCount}</p>
                <p className="text-sm text-gray-400">Featured Deals</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deals..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent" />
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
            <BadgePercent className="mx-auto text-gray-500 mb-4" size={48} />
            <p className="text-gray-400">No deals found</p>
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Create your first deal
            </button>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/50">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Deal</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Pricing</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Expiry</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.map((deal) => {
                    const savingPercent = Math.round(((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100)
                    const endDate = deal.endDate?.toDate
                      ? deal.endDate.toDate().toLocaleDateString()
                      : deal.endDate
                        ? new Date(deal.endDate).toLocaleDateString()
                        : "No expiry"

                    return (
                      <tr key={deal.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-white">{deal.title}</p>
                            <p className="text-xs text-gray-400 line-clamp-1 mt-1">{deal.description}</p>
                            {deal.featured && (
                              <span className="inline-flex mt-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                Featured
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-semibold">Rs. {deal.dealPrice.toFixed(2)}</p>
                          <p className="text-xs text-gray-500 line-through">Rs. {deal.originalPrice.toFixed(2)}</p>
                          <p className="text-xs text-green-400">Save {savingPercent}%</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-500" />
                            <span>{endDate}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleDealStatus(deal.id, !deal.isActive)}
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition ${
                              deal.isActive
                                ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                                : "bg-gray-600/20 text-gray-400 hover:bg-gray-600/30"
                            }`}
                          >
                            {deal.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            {deal.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(deal)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-slate-600 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>

                            {deleteConfirm === deal.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(deal.id)}
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
                                onClick={() => setDeleteConfirm(deal.id)}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-600 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <DealModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveDeal}
        deal={editingDeal}
        mode={modalMode}
      />
    </div>
  )
}
