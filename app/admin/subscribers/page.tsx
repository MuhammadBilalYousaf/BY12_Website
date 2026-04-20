"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  Timestamp 
} from "firebase/firestore"
import { 
  Mail, 
  Search, 
  Trash2, 
  Users,
  Download,
  CheckCircle,
  XCircle,
  Calendar
} from "lucide-react"

interface Subscriber {
  id: string
  email: string
  status: "active" | "unsubscribed"
  subscribedAt: Timestamp
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const subscribersRef = collection(db, "newsletterSubscribers")
    const q = query(subscribersRef, orderBy("subscribedAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subscribersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Subscriber[]
      setSubscribers(subscribersData)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching subscribers:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const toggleStatus = async (subscriberId: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, "newsletterSubscribers", subscriberId), {
        status: currentStatus === "active" ? "unsubscribed" : "active",
      })
    } catch (error) {
      console.error("Error toggling status:", error)
    }
  }

  const deleteSubscriber = async (subscriberId: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return
    try {
      await deleteDoc(doc(db, "newsletterSubscribers", subscriberId))
    } catch (error) {
      console.error("Error deleting subscriber:", error)
    }
  }

  const exportSubscribers = () => {
    const activeSubscribers = subscribers.filter(s => s.status === "active")
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Subscribed Date,Status\n"
      + activeSubscribers.map(s => 
          `${s.email},${s.subscribedAt?.toDate().toLocaleDateString() || "N/A"},${s.status}`
        ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredSubscribers = subscribers.filter((subscriber) =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeCount = subscribers.filter(s => s.status === "active").length
  const unsubscribedCount = subscribers.filter(s => s.status === "unsubscribed").length

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "N/A"
    const date = timestamp.toDate()
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-accent" />
            Newsletter Subscribers
          </h1>
          <p className="text-slate-400 mt-1">Manage your newsletter subscriber list</p>
        </div>
        <button
          onClick={exportSubscribers}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 text-slate-900 rounded-xl font-medium transition-colors"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{subscribers.length}</p>
              <p className="text-sm text-slate-400">Total Subscribers</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{activeCount}</p>
              <p className="text-sm text-slate-400">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{unsubscribedCount}</p>
              <p className="text-sm text-slate-400">Unsubscribed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>

      {/* Subscribers List */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading subscribers...</p>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No subscribers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="text-left p-4 text-sm font-semibold text-slate-300">Email</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-300">Subscribed</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-300">Status</th>
                  <th className="text-right p-4 text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                          <Mail className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-white">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={14} />
                        {formatDate(subscriber.subscribedAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      {subscriber.status === "active" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                          <CheckCircle size={12} />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                          <XCircle size={12} />
                          Unsubscribed
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(subscriber.id, subscriber.status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            subscriber.status === "active"
                              ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                              : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          }`}
                        >
                          {subscriber.status === "active" ? "Unsubscribe" : "Reactivate"}
                        </button>
                        <button
                          onClick={() => deleteSubscriber(subscriber.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
