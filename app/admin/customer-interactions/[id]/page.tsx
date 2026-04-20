"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs, Timestamp, updateDoc, serverTimestamp } from "firebase/firestore"
import { ArrowLeft, Mail, Phone, MapPin, ShoppingCart, FileText, CheckCircle2, Clock, Calendar, Copy, Send, CheckCircle, AlertCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { CustomerInteraction } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function InteractionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const interactionId = params.id as string
  const { toast } = useToast()

  const [interaction, setInteraction] = useState<(CustomerInteraction & { id: string }) | null>(null)
  const [relatedInteractions, setRelatedInteractions] = useState<(CustomerInteraction & { id: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [formNotes, setFormNotes] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesHistory, setNotesHistory] = useState<Array<{ text: string; timestamp: any }>>([])

  // Load interaction details
  useEffect(() => {
    const loadInteraction = async () => {
      setIsLoading(true)
      try {
        const interactionRef = doc(db, "customerInteractions", interactionId)
        const snapshot = await getDoc(interactionRef)
        
        if (snapshot.exists()) {
          const data = snapshot.data() as Omit<CustomerInteraction, 'id'>
          const interactionData = { id: interactionId, ...data } as CustomerInteraction & { id: string }
          setInteraction(interactionData)
          setFormNotes("")
          
          // Load notes history from the document
          const history = (data.notesHistory || []).sort((a, b) => {
            const dateA = a.timestamp instanceof Timestamp ? a.timestamp.toDate() : new Date(a.timestamp)
            const dateB = b.timestamp instanceof Timestamp ? b.timestamp.toDate() : new Date(b.timestamp)
            return dateB.getTime() - dateA.getTime()
          })
          setNotesHistory(history)

          // Load related interactions by email
          const relatedRef = collection(db, "customerInteractions")
          const q = query(relatedRef, where("email", "==", data.email))
          const relatedSnapshot = await getDocs(q)
          const related = relatedSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as CustomerInteraction & { id: string }))
            .filter(item => item.id !== interactionId)
            .sort((a, b) => {
              const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt)
              const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt)
              return dateB.getTime() - dateA.getTime()
            })
          
          setRelatedInteractions(related)
        }
      } catch (error) {
        console.error("Error loading interaction:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInteraction()
  }, [interactionId])

  const formatDate = (date: any) => {
    if (!date) return "-"
    try {
      const d = date instanceof Timestamp ? date.toDate() : new Date(date)
      return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return "-"
    }
  }

  const copyEmail = () => {
    if (interaction?.email) {
      navigator.clipboard.writeText(interaction.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const saveNotes = async () => {
    if (!interaction) {
      toast({
        title: "Error",
        description: "No interaction loaded",
        variant: "destructive",
      })
      return
    }

    if (!formNotes.trim()) {
      toast({
        title: "Info",
        description: "Please enter some notes before saving",
      })
      return
    }

    setSavingNotes(true)
    try {
      const interactionRef = doc(db, "customerInteractions", interaction.id)
      
      // Add new note to history (use new Date() for timestamps in arrays)
      const newNote = {
        text: formNotes,
        timestamp: new Date(),
      }
      
      const updatedHistory = [newNote, ...notesHistory]
      
      await updateDoc(interactionRef, {
        notesHistory: updatedHistory,
        updatedAt: serverTimestamp(),
      })
      
      // Update local state
      setNotesHistory(updatedHistory)
      setFormNotes("")
      
      setInteraction({ ...interaction })
      toast({
        title: "Success",
        description: "Follow-up note saved successfully",
      })
      console.log("Follow-up note saved for interaction:", interaction.id)
    } catch (error) {
      console.error("Error saving notes:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save notes"
      toast({
        title: "Error",
        description: `Failed to save notes: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setSavingNotes(false)
    }
  }

  const deleteNote = async (indexToDelete: number) => {
    if (!interaction) return

    try {
      const updatedHistory = notesHistory.filter((_, index) => index !== indexToDelete)
      
      const interactionRef = doc(db, "customerInteractions", interaction.id)
      await updateDoc(interactionRef, {
        notesHistory: updatedHistory.length > 0 ? updatedHistory : [],
        updatedAt: serverTimestamp(),
      })
      
      setNotesHistory(updatedHistory)
      toast({
        title: "Success",
        description: "Note deleted successfully",
      })
      console.log("Note deleted for interaction:", interaction.id)
    } catch (error) {
      console.error("Error deleting note:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete note"
      toast({
        title: "Error",
        description: `Failed to delete note: ${errorMessage}`,
        variant: "destructive",
      })
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

  const getConversionTypeLabel = (type?: string) => {
    if (!type) return "-"
    const labels: { [key: string]: string } = {
      contact_submission: "Contact Form Submitted",
      order_completed: "Order Completed",
      signup_completed: "Account Created",
    }
    return labels[type] || type
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-900 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!interaction) {
    return (
      <div className="text-center py-12 bg-slate-900 min-h-screen">
        <p className="text-slate-400 mb-4">Interaction not found</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 bg-slate-900 min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Customer Interaction Details</h1>
            <p className="text-slate-400 text-sm">View and manage customer follow-ups</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info Card */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Customer Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-mono">{interaction.email}</p>
                    <button
                      onClick={copyEmail}
                      className="p-1.5 hover:bg-slate-700 rounded transition"
                      title="Copy email"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400 hover:text-slate-300" />}
                    </button>
                  </div>
                </div>

                {interaction.name && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Name</p>
                    <p className="text-white">{interaction.name}</p>
                  </div>
                )}

                {interaction.phone && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Phone</p>
                    <p className="text-white">{interaction.phone}</p>
                  </div>
                )}

                {interaction.customerId && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Customer ID</p>
                    <p className="text-white font-mono text-sm">{interaction.customerId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Interaction Details */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Interaction Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Type</p>
                  <p className="text-white font-semibold">{getInteractionTypeLabel(interaction.interactionType)}</p>
                </div>
                
                <div>
                  <p className="text-slate-400 text-sm mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                    interaction.converted
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  }`}>
                    {interaction.converted ? "Converted" : "Pending"}
                  </span>
                </div>

                {interaction.converted && interaction.conversionType && (
                  <div className="col-span-2">
                    <p className="text-slate-400 text-sm mb-1">Conversion Type</p>
                    <p className="text-white">{getConversionTypeLabel(interaction.conversionType)}</p>
                  </div>
                )}

                {interaction.fieldNames && interaction.fieldNames.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-slate-400 text-sm mb-2">Fields Filled ({interaction.fieldsCount})</p>
                    <div className="flex flex-wrap gap-2">
                      {interaction.fieldNames.map((field) => (
                        <span
                          key={field}
                          className="inline-block px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-200 capitalize"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {interaction.productName && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Product</p>
                    <p className="text-white">{interaction.productName}</p>
                  </div>
                )}

                {interaction.quantity && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Quantity</p>
                    <p className="text-white">{interaction.quantity}</p>
                  </div>
                )}

                {interaction.orderTotal && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Order Total</p>
                    <p className="text-white font-semibold">Rs. {interaction.orderTotal}</p>
                  </div>
                )}

                {interaction.paymentMethod && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Payment Method</p>
                    <p className="text-white">{interaction.paymentMethod}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Timeline</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <div className="w-0.5 h-8 bg-slate-700 mt-2"></div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Started</p>
                    <p className="text-white">{formatDate(interaction.startedAt)}</p>
                  </div>
                </div>
                
                {interaction.lastActivityAt && (
                  <div className="flex gap-4">
                    <div>
                      <Calendar className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Last Activity</p>
                      <p className="text-white">{formatDate(interaction.lastActivityAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Form Fields (if available) */}
            {interaction.fieldsFilled && Object.keys(interaction.fieldsFilled).length > 0 && (
              <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
                <h3 className="font-bold text-white mb-4">Form Data</h3>
                <div className="space-y-3">
                  {Object.entries(interaction.fieldsFilled).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-slate-400 text-xs uppercase mb-1">{key}</p>
                      <p className="text-white text-sm break-words">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 space-y-4">
              <h3 className="font-bold text-white mb-4">Follow-up Notes</h3>
              
              {/* Input Area */}
              <div className="space-y-3">
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Add notes for follow-up..."
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <button
                  onClick={saveNotes}
                  disabled={savingNotes}
                  className="w-full px-4 py-2 bg-accent hover:bg-accent/90 text-slate-900 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {savingNotes ? "Saving..." : "Save Note"}
                </button>
              </div>

              {/* Notes History */}
              {notesHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-600">
                  <h4 className="font-semibold text-white mb-4 text-sm">Notes History ({notesHistory.length})</h4>
                  <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                    {notesHistory.map((note, index) => {
                      const noteDatetime = note.timestamp instanceof Timestamp 
                        ? note.timestamp.toDate() 
                        : new Date(note.timestamp)
                      const formattedTime = noteDatetime.toLocaleDateString() + " " + noteDatetime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      
                      return (
                        <div key={index} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600 group hover:border-slate-500 transition">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="text-xs text-accent font-semibold">Note #{notesHistory.length - index}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">{formattedTime}</span>
                              <button
                                onClick={() => deleteNote(index)}
                                className="p-1 hover:bg-red-500/20 rounded transition opacity-0 group-hover:opacity-100"
                                title="Delete note"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-300" />
                              </button>
                            </div>
                          </div>
                          <p className="text-white text-sm whitespace-pre-wrap break-words">{note.text}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {notesHistory.length === 0 && formNotes === "" && (
                <div className="text-center py-4 text-slate-400 text-sm">
                  No notes yet. Add your first follow-up note above.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h3 className="font-bold text-white mb-4">Actions</h3>
              <div className="space-y-2">
                <a
                  href={`mailto:${interaction.email}`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg transition"
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </a>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-accent/10 rounded-lg border border-accent/30 p-6">
              <h3 className="font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Interaction Type</span>
                  <span className="text-white font-semibold">{getInteractionTypeLabel(interaction.interactionType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Status</span>
                  <span className={interaction.converted ? "text-green-400 font-semibold" : "text-yellow-400 font-semibold"}>
                    {interaction.converted ? "Converted" : "Pending"}
                  </span>
                </div>
                {interaction.fieldsCount && (
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Fields Filled</span>
                    <span className="text-white font-semibold">{interaction.fieldsCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Interactions */}
        {relatedInteractions.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Related Interactions ({relatedInteractions.length})</h2>
            <div className="space-y-3">
              {relatedInteractions.map((related) => (
                <Link
                  key={related.id}
                  href={`/admin/customer-interactions/${related.id}`}
                  className="block p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{getInteractionTypeLabel(related.interactionType)}</span>
                    <span className={`text-xs font-medium ${related.converted ? "text-green-400" : "text-yellow-400"}`}>
                      {related.converted ? "Converted" : "Pending"}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{formatDate(related.createdAt)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}
