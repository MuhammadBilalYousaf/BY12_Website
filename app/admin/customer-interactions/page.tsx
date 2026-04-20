"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, getDocs, Timestamp } from "firebase/firestore"
import { Users, TrendingUp, Mail, ShoppingCart, FileText, CheckCircle2, Clock, Search, Filter } from "lucide-react"
import Link from "next/link"
import { CustomerInteraction } from "@/lib/types"

export default function CustomerInteractionsAdmin() {
  const [interactions, setInteractions] = useState<(CustomerInteraction & { id: string })[]>([])
  const [filteredInteractions, setFilteredInteractions] = useState<(CustomerInteraction & { id: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [convertedOnly, setConvertedOnly] = useState(false)

  // Load customer interactions from Firestore
  useEffect(() => {
    const loadInteractions = async () => {
      setIsLoading(true)
      try {
        const interactionsRef = collection(db, "customerInteractions")
        const q = query(interactionsRef, orderBy("lastActivityAt", "desc"))
        const snapshot = await getDocs(q)
        
        console.log(`Loaded ${snapshot.docs.length} customer interactions`)
        
        const data = snapshot.docs.map(doc => {
          const docData = doc.data()
          return {
            id: doc.id,
            ...docData,
          } as CustomerInteraction & { id: string }
        })
        
        console.log("Customer interactions data:", data)
        setInteractions(data)
        setFilteredInteractions(data)
      } catch (error) {
        console.error("Error loading customer interactions:", error)
        // If orderBy fails, try without ordering
        try {
          const interactionsRef = collection(db, "customerInteractions")
          const snapshot = await getDocs(interactionsRef)
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as CustomerInteraction & { id: string }))
          setInteractions(data)
          setFilteredInteractions(data)
        } catch (err) {
          console.error("Error loading interactions (fallback):", err)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadInteractions()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = interactions

    // Filter by search term (email, name, or guestSessionId)
    if (searchTerm) {
      filtered = filtered.filter(interaction =>
        (interaction.email && interaction.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (interaction.name && interaction.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (interaction.guestSessionId && interaction.guestSessionId.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by interaction type
    if (filterType !== "all") {
      filtered = filtered.filter(interaction =>
        interaction.interactionType === filterType
      )
    }

    // Filter by converted status
    if (convertedOnly) {
      filtered = filtered.filter(interaction => interaction.converted === true)
    }

    setFilteredInteractions(filtered)
  }, [searchTerm, filterType, convertedOnly, interactions])

  // Calculate statistics
  const stats = {
    total: interactions.length,
    converted: interactions.filter(i => i.converted === true).length,
    contactForms: interactions.filter(i => i.interactionType === "contact_form").length,
    checkouts: interactions.filter(i => i.interactionType === "checkout").length,
    signups: interactions.filter(i => i.interactionType === "sign_up").length,
    cartAdds: interactions.filter(i => i.interactionType === "cart_add").length,
  }

  const conversionRate = stats.total > 0 ? ((stats.converted / stats.total) * 100).toFixed(2) : "0"

  const formatDate = (date: any) => {
    if (!date) return "-"
    try {
      const d = date instanceof Timestamp ? date.toDate() : new Date(date)
      return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return "-"
    }
  }

  const getInteractionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      contact_form: "Contact Form",
      checkout: "Checkout",
      cart_add: "Cart Add",
      cart_remove: "Cart Remove",
      sign_up: "Sign Up",
      sign_in: "Sign In",
      product_view: "Product View",
    }
    return labels[type] || type
  }

  const getInteractionTypeBadgeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      contact_form: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      checkout: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      cart_add: "bg-green-500/20 text-green-400 border-green-500/30",
      cart_remove: "bg-red-500/20 text-red-400 border-red-500/30",
      sign_up: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      sign_in: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      product_view: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    }
    return colors[type] || "bg-slate-500/20 text-slate-400 border-slate-500/30"
  }

  return (
    <div className="space-y-6 p-8 bg-slate-900 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Customer Interactions</h1>
        <p className="text-slate-400">Track and manage customer activities across your store</p>
      </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Interactions</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Conversions</p>
                <p className="text-2xl font-bold text-green-400">{stats.converted}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-400">{conversionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Contact Forms</p>
                <p className="text-2xl font-bold text-blue-400">{stats.contactForms}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-400/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Checkouts</p>
                <p className="text-2xl font-bold text-purple-400">{stats.checkouts}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-purple-400/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Sign Ups</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.signups}</p>
              </div>
              <FileText className="w-8 h-8 text-cyan-400/50" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            </div>

            {/* Filter by type */}
            <div className="flex-1">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="all">All Interaction Types</option>
                <option value="contact_form">Contact Forms</option>
                <option value="checkout">Checkouts</option>
                <option value="cart_add">Cart Additions</option>
                <option value="cart_remove">Cart Removals</option>
                <option value="sign_up">Sign Ups</option>
                <option value="sign_in">Sign Ins</option>
              </select>
            </div>

            {/* Converted filter */}
            <label className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg cursor-pointer hover:border-accent/50 transition">
              <input
                type="checkbox"
                checked={convertedOnly}
                onChange={(e) => setConvertedOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-500 text-accent focus:ring-accent"
              />
              <span className="text-white text-sm">Converted Only</span>
            </label>
          </div>
        </div>

        {/* Interactions Table */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              <p className="text-slate-400 mt-4">Loading interactions...</p>
            </div>
          ) : filteredInteractions.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No interactions found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Fields Filled</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredInteractions.map((interaction) => (
                  <tr key={interaction.id} className="hover:bg-slate-700/50 transition">
                    <td className="px-6 py-4 text-sm text-white">
                      {interaction.email || <span className="text-slate-500 text-xs">{interaction.guestSessionId || "N/A"}</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{interaction.name || (interaction.guestSessionId ? "Guest" : "-")}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getInteractionTypeBadgeColor(interaction.interactionType)}`}>
                        {getInteractionTypeLabel(interaction.interactionType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {interaction.fieldsCount ? `${interaction.fieldsCount} fields` : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                        interaction.converted
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }`}>
                        {interaction.converted ? "Converted" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {formatDate(interaction.lastActivityAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/customer-interactions/${interaction.id}`}
                        className="text-accent hover:text-accent/80 font-medium text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">
            Showing <span className="text-white font-semibold">{filteredInteractions.length}</span> of <span className="text-white font-semibold">{interactions.length}</span> interactions
          </p>
        </div>
    </div>
  )
}
