"use client"

import { useState } from "react"
import Image from "next/image"
import { X, Package, MapPin, CreditCard, User } from "lucide-react"
import type { Order } from "@/lib/hooks/use-orders"

interface OrderDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
  onUpdateStatus: (orderId: string, status: Order["status"]) => Promise<any>
}

export default function OrderDetailsModal({ isOpen, onClose, order, onUpdateStatus }: OrderDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<Order["status"]>("Pending")

  if (!isOpen || !order) return null

  const handleStatusUpdate = async () => {
    setIsUpdating(true)
    await onUpdateStatus(order.id, selectedStatus)
    setIsUpdating(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Order Details</h2>
            <p className="text-sm text-gray-400 mt-1">{order.orderId}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Customer Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Name</p>
                <p className="text-white font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Email</p>
                <p className="text-white font-medium">{order.customerEmail}</p>
              </div>
              {order.customerPhone && (
                <div>
                  <p className="text-gray-400 mb-1">Phone</p>
                  <p className="text-white font-medium">{order.customerPhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Shipping Address</h3>
            </div>
            <div className="text-sm text-white space-y-1">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Package size={20} className="text-green-400" />
              <h3 className="text-lg font-semibold text-white">Order Items</h3>
            </div>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-slate-600 rounded-lg">
                  <Image
                    src={item.imageUrl || "/placeholder.svg?height=60&width=60"}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span>Qty: {item.quantity}</span>
                      {item.selectedSize && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                          {item.selectedSize}ml
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-white font-semibold">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Totals */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={20} className="text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Payment Details</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method</span>
                <span className="text-white font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">Rs. {order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shipping</span>
                <span className="text-white">Rs. {order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tax</span>
                <span className="text-white">Rs. {order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-600">
                <span className="text-white font-semibold">Total</span>
                <span className="text-white font-bold text-lg">Rs. {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Status Update */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Update Order Status</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as Order["status"])}
                className="flex-1 px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed (Delivered)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating || selectedStatus === order.status}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isUpdating ? "Updating..." : "Update Status"}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Current Status: <span className="text-white font-semibold">{order.status}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}