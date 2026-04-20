"use client"

import { useState, useRef } from "react"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { trackFormFieldChange, trackContactSubmission, linkGuestInteractionsToEmail, clearGuestId, getOrCreateGuestId } from "@/lib/tracking"
import { useAuth } from "@/lib/contexts"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageBreadcrumb from "@/components/page-breadcrumb"
import { Mail, Phone, MapPin, Send, MessageSquare, Loader2, CheckCircle } from "lucide-react"
import { FadeInSection, FadeInStagger, FadeInItem } from "@/components/animated-section"

export default function ContactPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const trackingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Track form field changes with debouncing (for both signed-in users and guests)
    if (trackingTimeoutRef.current) {
      clearTimeout(trackingTimeoutRef.current)
    }
    
    trackingTimeoutRef.current = setTimeout(() => {
      // For signed-in users, use their email
      if (user?.email) {
        trackFormFieldChange(
          user.email.toLowerCase(),
          name,
          value,
          "contact_form",
          user.id
        ).catch(() => {
          // Silently fail - don't disrupt user experience
        })
      } else {
        // For guests, use guest session ID
        const guestId = getOrCreateGuestId()
        trackFormFieldChange(
          "", // No email yet for guests
          name,
          value,
          "contact_form",
          undefined,
          guestId // Pass guest session ID
        ).catch(() => {
          // Silently fail - don't disrupt user experience
        })
      }
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Save message to Firestore (client-side - will show in admin panel)
      console.log("Attempting to save message to Firestore...")
      const messagesRef = collection(db, "contactMessages")
      const docRef = await addDoc(messagesRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email.toLowerCase(),
        subject: formData.subject,
        message: formData.message,
        status: "unread",
        createdAt: serverTimestamp(),
      })
      console.log("Message saved to Firestore with ID:", docRef.id)

      // Track contact form submission
      await trackContactSubmission(
        formData.email.toLowerCase(),
        `${formData.firstName} ${formData.lastName}`,
        docRef.id,
        user?.id
      ).catch(() => {
        // Silently fail - don't disrupt user experience
      })

      // Link all guest interactions (cart, etc.) to this email if user is not signed in
      if (!user) {
        await linkGuestInteractionsToEmail(formData.email.toLowerCase()).catch(() => {
          // Silently fail
        })
        // Clear guest ID after linking
        clearGuestId()
      }

      // Send email notification via API
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      // Even if email fails, the message is saved to Firestore
      if (!response.ok) {
        console.warn("Email notification failed, but message saved to database")
      }

      setSuccess(true)
      setFormData({ firstName: "", lastName: "", email: "", subject: "", message: "" })
    } catch (err: unknown) {
      console.error("Error saving message:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(`Failed to send message: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <PageBreadcrumb items={[{ label: "Contact Us" }]} />
        </div>

        {/* Hero Section */}
        <div className="relative py-20 md:py-28 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <FadeInSection delay={0.1}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6 backdrop-blur-sm">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  <span className="text-accent text-sm font-medium tracking-wide uppercase">Get in Touch</span>
                </div>
              </FadeInSection>
              <FadeInSection variant="heading" delay={0.2}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Contact{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent">
                    Us
                  </span>
                </h1>
              </FadeInSection>
              <FadeInSection variant="text" delay={0.3}>
                <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                  We'd love to hear from you. Our team is here to help with any questions.
                </p>
              </FadeInSection>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <FadeInStagger className="space-y-6">
              {[
                { icon: Mail, label: "Email", value: "info.bilalyousaf12@gmail.com" },
                { icon: Phone, label: "Phone", value: "+92 311 5318776" },
                { icon: MapPin, label: "Address", value: "DHA Phase 8, Eden City, Pakistan" },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <FadeInItem
                    key={i} 
                    className="flex gap-4 p-5 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.label}</p>
                      <p className="text-slate-400">{item.value}</p>
                    </div>
                  </FadeInItem>
                )
              })}
            </FadeInStagger>

            {/* Contact Form */}
            <FadeInSection delay={0.2} className="lg:col-span-2">
              <div 
                className="p-8 rounded-2xl"
                style={{
                background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {success ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Message Sent!</h3>
                  <p className="text-slate-400 mb-6">Thank you for reaching out. We'll get back to you within 24-48 hours.</p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        required
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        required
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your message..."
                      rows={6}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none transition-all"
                    ></textarea>
                  </div>
                  
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="group px-8 py-4 bg-accent hover:bg-accent/90 text-slate-900 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
            </FadeInSection>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
