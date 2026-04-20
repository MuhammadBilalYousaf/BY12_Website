"use client"

import { X, Mail, Phone, Calendar, ShoppingBag } from "lucide-react"
import { Customer } from "@/lib/hooks/use-customers"

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
}

export default function CustomerModal({ isOpen, onClose, customer }: CustomerModalProps) {
  if (!isOpen || !customer) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Customer Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {customer.name?.charAt(0).toUpperCase() || customer.email?.charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{customer.name || "N/A"}</h3>
                <p className="text-sm text-gray-400">Customer ID: {customer.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-600 rounded-lg">
                  <Mail className="text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-white">{customer.email}</p>
                </div>
              </div>

              {customer.phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-600 rounded-lg">
                    <Phone className="text-purple-400" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-white">{customer.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-600 rounded-lg">
                  <Calendar className="text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Joined</p>
                  <p className="text-white">
                    {customer.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-600 rounded-lg">
                  <ShoppingBag className="text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Role</p>
                  <p className="text-white capitalize">{customer.role || "Customer"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-slate-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Account Information</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Account Status</span>
                <span className="text-green-400 font-semibold">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Orders</span>
                <span className="text-white font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Spent</span>
                <span className="text-white font-semibold">Rs. 0.00</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
            >
              Close
            </button>
            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}