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
  Eye, 
  CheckCircle, 
  Clock, 
  MessageSquare,
  X,
  ExternalLink,
  Reply,
  Filter
} from "lucide-react"

interface ContactMessage {
  id: string
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
  status: "unread" | "read" | "replied"
  createdAt: Timestamp
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const messagesRef = collection(db, "contactMessages")
    const q = query(messagesRef, orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ContactMessage[]
      setMessages(messagesData)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching messages:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const markAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, "contactMessages", messageId), {
        status: "read",
      })
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  const markAsReplied = async (messageId: string) => {
    try {
      await updateDoc(doc(db, "contactMessages", messageId), {
        status: "replied",
      })
    } catch (error) {
      console.error("Error marking as replied:", error)
    }
  }

  const deleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return
    try {
      await deleteDoc(doc(db, "contactMessages", messageId))
      if (selectedMessage?.id === messageId) {
        setShowModal(false)
        setSelectedMessage(null)
      }
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }

  const openMessage = async (message: ContactMessage) => {
    setSelectedMessage(message)
    setShowModal(true)
    if (message.status === "unread") {
      await markAsRead(message.id)
    }
  }

  const filteredMessages = messages.filter((message) => {
    const matchesSearch = 
      message.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || message.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const unreadCount = messages.filter(m => m.status === "unread").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
            <Clock size={12} />
            Unread
          </span>
        )
      case "read":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
            <Eye size={12} />
            Read
          </span>
        )
      case "replied":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
            <CheckCircle size={12} />
            Replied
          </span>
        )
      default:
        return null
    }
  }

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "N/A"
    const date = timestamp.toDate()
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-accent" />
            Contact Messages
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-accent text-slate-900 text-sm font-bold rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-slate-400 mt-1">Manage customer inquiries and messages</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent/50 appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 hover:bg-slate-700/30 transition-colors cursor-pointer ${
                  message.status === "unread" ? "bg-slate-700/20" : ""
                }`}
                onClick={() => openMessage(message)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`font-semibold ${message.status === "unread" ? "text-white" : "text-slate-300"}`}>
                        {message.firstName} {message.lastName}
                      </span>
                      {getStatusBadge(message.status)}
                    </div>
                    <p className={`text-sm ${message.status === "unread" ? "text-white font-medium" : "text-slate-400"}`}>
                      {message.subject}
                    </p>
                    <p className="text-sm text-slate-500 truncate mt-1">
                      {message.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteMessage(message.id)
                      }}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedMessage.subject}</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    From: {selectedMessage.firstName} {selectedMessage.lastName} &lt;{selectedMessage.email}&gt;
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    {formatDate(selectedMessage.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-700 flex flex-wrap gap-3">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 text-slate-900 rounded-xl font-medium transition-colors"
                onClick={() => markAsReplied(selectedMessage.id)}
              >
                <Reply size={18} />
                Reply via Email
              </a>
              <a
                href={`https://mail.google.com/mail/?view=cm&to=${selectedMessage.email}&su=Re: ${selectedMessage.subject}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                onClick={() => markAsReplied(selectedMessage.id)}
              >
                <ExternalLink size={18} />
                Open in Gmail
              </a>
              {selectedMessage.status !== "replied" && (
                <button
                  onClick={() => {
                    markAsReplied(selectedMessage.id)
                    setShowModal(false)
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors"
                >
                  <CheckCircle size={18} />
                  Mark as Replied
                </button>
              )}
              <button
                onClick={() => {
                  deleteMessage(selectedMessage.id)
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-medium transition-colors ml-auto"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
