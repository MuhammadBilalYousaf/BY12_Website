"use client"

import { useState } from "react"
import { useAdminAuth } from "@/lib/contexts/admin-auth-context"
import { Save, User, Lock, Bell, Globe } from "lucide-react"

export default function AdminSettings() {
  const { user } = useAdminAuth()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <div className="min-h-screen">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your admin account and preferences</p>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-4xl">
          {/* Profile Settings */}
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-purple-400" size={24} />
              <h2 className="text-xl font-bold text-white">Profile Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Password Settings */}
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-purple-400" size={24} />
              <h2 className="text-xl font-bold text-white">Change Password</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="text-purple-400" size={24} />
              <h2 className="text-xl font-bold text-white">Notifications</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                <span className="text-gray-300">Email notifications for new orders</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                <span className="text-gray-300">Email notifications for low stock</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                <span className="text-gray-300">Daily sales reports</span>
              </label>
            </div>
          </div>

          {/* Store Settings */}
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="text-purple-400" size={24} />
              <h2 className="text-xl font-bold text-white">Store Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Store Name</label>
                <input
                  type="text"
                  defaultValue="Perfume Store"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Currency</label>
                <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option>PKR (Rs.)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </main>
    </div>
  )
}
