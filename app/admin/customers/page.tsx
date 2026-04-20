"use client"

import { useState } from "react"
import { Search, Eye, Mail, Phone, Trash2, AlertCircle, X } from "lucide-react"
import { useCustomers } from "@/lib/hooks/use-customers"
import CustomerModal from "@/components/admin/customer-modal"
import { deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function AdminCustomers() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  const { customers, loading } = useCustomers()

  // Filter customers
  const filteredCustomers = customers.filter((customer) =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setIsModalOpen(true)
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (deleteConfirm === customerId) {
      setIsDeleting(true)
      setError("")
      
      try {
        await deleteDoc(doc(db, "users", customerId))
        setDeleteConfirm(null)
      } catch (err: any) {
        console.error("Error deleting customer:", err)
        setError("Failed to delete customer. You may not have permission.")
      } finally {
        setIsDeleting(false)
      }
    } else {
      setDeleteConfirm(customerId)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-white font-semibold">Loading customers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 py-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Customer Management</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'} total
          </p>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-4 sm:mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-red-200">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-300"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-slate-800 rounded-lg p-4 sm:p-6">
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{customers.length}</p>
            <p className="text-sm sm:text-base text-gray-400">Total Customers</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 sm:p-6">
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
              {customers.filter(c => {
                const date = c.createdAt?.toDate?.()
                if (!date) return false
                const now = new Date()
                const diffTime = Math.abs(now.getTime() - date.getTime())
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                return diffDays <= 30
              }).length}
            </p>
            <p className="text-sm sm:text-base text-gray-400">New This Month</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 sm:p-6">
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
              {customers.filter(c => c.email?.includes("@")).length}
            </p>
            <p className="text-sm sm:text-base text-gray-400">Verified Emails</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-slate-800 rounded-lg p-4 mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Customers - Mobile Cards / Desktop Table */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 sm:p-12 text-center">
            <p className="text-gray-400 text-base sm:text-lg">No customers found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-4">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {customer.name?.charAt(0).toUpperCase() || customer.email?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{customer.name || "N/A"}</h3>
                      <div className="flex items-center gap-2 text-gray-300 mt-1">
                        <Mail size={12} />
                        <span className="text-xs truncate">{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-gray-300 mt-1">
                          <Phone size={12} />
                          <span className="text-xs">{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 mb-3 pb-3 border-b border-slate-700">
                    Joined: {customer.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewCustomer(customer)}
                      className="flex-1 flex items-center justify-center gap-2 p-2 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded transition"
                    >
                      <Eye size={16} />
                      <span className="text-sm">View</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      disabled={isDeleting}
                      className={`flex-1 flex items-center justify-center gap-2 p-2 rounded transition ${
                        deleteConfirm === customer.id
                          ? "bg-red-500 text-white"
                          : "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                      } disabled:opacity-50`}
                    >
                      <Trash2 size={16} />
                      <span className="text-sm">
                        {deleteConfirm === customer.id ? "Confirm" : "Delete"}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-slate-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-700/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {customer.name?.charAt(0).toUpperCase() || customer.email?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <p className="text-white font-semibold">{customer.name || "N/A"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-gray-300">
                              <Mail size={14} />
                              <span className="text-sm">{customer.email}</span>
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <Phone size={14} />
                                <span className="text-sm">{customer.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-gray-300">
                            {customer.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewCustomer(customer)}
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded transition"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(customer.id)}
                              disabled={isDeleting}
                              className={`p-2 rounded transition ${
                                deleteConfirm === customer.id
                                  ? "bg-red-500 text-white"
                                  : "text-red-400 hover:bg-red-500/10"
                              } disabled:opacity-50`}
                              title={deleteConfirm === customer.id ? "Click again to confirm" : "Delete Customer"}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Customer Details Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer}
      />
    </div>
  )
}
