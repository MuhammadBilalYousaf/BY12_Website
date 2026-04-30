"use client"

import { useState } from "react"
import { Search, Eye, CheckCircle, XCircle, Clock, Package, AlertCircle, X } from "lucide-react"
import { useOrders } from "@/lib/hooks/use-orders"
import OrderDetailsModal from "@/components/admin/order-details-modal"

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { orders, loading, getOrderStats, updateOrderStatus } = useOrders()

  const orderStats = getOrderStats()

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "All Status" || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-500/20 text-green-400"
      case "Shipped": return "bg-purple-500/20 text-purple-400"
      case "Processing": return "bg-blue-500/20 text-blue-400"
      case "Pending": return "bg-yellow-500/20 text-yellow-400"
      case "Cancelled": return "bg-red-500/20 text-red-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-white font-semibold">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 py-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Orders Management</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} total
            {' • '}
            Rs. {orderStats.totalRevenue.toFixed(2)} revenue
          </p>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="text-yellow-400" size={20} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white">{orderStats.pending}</p>
                <p className="text-xs sm:text-sm text-gray-400">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg">
                <Package className="text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white">{orderStats.processing}</p>
                <p className="text-xs sm:text-sm text-gray-400">Processing</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="text-green-400" size={20} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white">{orderStats.completed}</p>
                <p className="text-xs sm:text-sm text-gray-400">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-red-500/20 rounded-lg">
                <XCircle className="text-red-400" size={20} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white">{orderStats.cancelled}</p>
                <p className="text-xs sm:text-sm text-gray-400">Cancelled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800 rounded-lg p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders - Mobile Cards / Desktop Table */}
        {filteredOrders.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 sm:p-12 text-center">
            <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-base sm:text-lg mb-2">No orders found</p>
            <p className="text-sm text-gray-500">Orders will appear here once customers place them</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold text-sm">{order.orderId}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {order.createdAt?.toDate?.()?.toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3 pb-3 border-b border-slate-700">
                    <p className="text-white text-sm font-medium">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.customerEmail}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{order.items?.length || 0} items</span>
                      <span className="text-white font-semibold">Rs. {order.total?.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewOrder(order)}
                    className="w-full flex items-center justify-center gap-2 p-2 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded transition"
                  >
                    <Eye size={16} />
                    <span className="text-sm">View Details</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-slate-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-700/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-white font-semibold text-sm">{order.orderId}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{order.customerName || "Unknown"}</p>
                          <p className="text-sm text-gray-400">{order.customerEmail}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-gray-300 text-sm">
                            {order.createdAt?.toDate?.()?.toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-gray-300">{order.items?.length || 0}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-white font-semibold">Rs. {order.total?.toFixed(2) || "0.00"}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => handleViewOrder(order)}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded transition" 
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
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

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onUpdateStatus={updateOrderStatus}
      />
    </div>
  )
}