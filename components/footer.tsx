"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, Facebook, Instagram, Send, Loader2, CheckCircle } from "lucide-react"
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function Footer() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Check if already subscribed (client-side Firestore)
      const subscribersRef = collection(db, "newsletterSubscribers")
      const q = query(subscribersRef, where("email", "==", email.toLowerCase()))
      const existingSubscriber = await getDocs(q)

      if (!existingSubscriber.empty) {
        setError("This email is already subscribed to our newsletter")
        setLoading(false)
        return
      }

      // Add subscriber to Firestore (client-side)
      await addDoc(subscribersRef, {
        email: email.toLowerCase(),
        subscribedAt: serverTimestamp(),
        status: "active",
      })

      // Call API to send welcome email
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, isNewSubscriber: true }),
      })

      // Don't fail if email sending fails
      if (!response.ok) {
        console.warn("Welcome email could not be sent, but subscription was successful")
      }

      setSuccess(true)
      setEmail("")
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      console.error("Subscription error:", err)
      setError("Failed to subscribe. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-900 to-black text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Top Border Glow */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/logo.png"
                alt="BY12"
                width={80}
                height={80}
                loading="lazy"
                className="rounded-xl w-auto h-auto"
              />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"></h3>
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Experience the essence of luxury with our handpicked collection of premium fragrances from around the world.
            </p>
            <div className="flex gap-3">
              <a href="https://web.facebook.com/profile.php?id=61586869565572" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-accent hover:border-accent/50 hover:bg-accent/10 transition-all duration-300">
                <Facebook size={18} />
              </a>
              <a href="https://www.instagram.com/bilalyousaf12.pk/" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-accent hover:border-accent/50 hover:bg-accent/10 transition-all duration-300">
                <Instagram size={18} />
              </a>
              <a href="https://www.tiktok.com/@bilalyousaf12.pk" target="_blank" rel="noopener noreferrer" aria-label="Follow us on TikTok" className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-accent hover:border-accent/50 hover:bg-accent/10 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              Quick Links
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/shop" className="text-slate-400 hover:text-accent transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-px bg-accent group-hover:w-4 transition-all duration-300" />
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-accent transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-px bg-accent group-hover:w-4 transition-all duration-300" />
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-accent transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-px bg-accent group-hover:w-4 transition-all duration-300" />
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-slate-400 hover:text-accent transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-px bg-accent group-hover:w-4 transition-all duration-300" />
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-400 hover:text-accent transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-px bg-accent group-hover:w-4 transition-all duration-300" />
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              Customer Service
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <a href="tel:+923115318776" className="flex items-center gap-3 text-slate-400 hover:text-accent transition-colors duration-300 group">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-center group-hover:border-accent/50 group-hover:bg-accent/10 transition-all duration-300">
                    <Phone size={14} className="text-accent" />
                  </div>
                  +92 311 5318776
                </a>
              </li>
              <li>
                <a href="mailto:info.bilalyousaf12@gmail.com" className="flex items-center gap-3 text-slate-400 hover:text-accent transition-colors duration-300 group">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-center group-hover:border-accent/50 group-hover:bg-accent/10 transition-all duration-300">
                    <Mail size={14} className="text-accent" />
                  </div>
                  info.bilalyousaf12@gmail.com
                </a>
              </li>
              <li>
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-center">
                    <MapPin size={14} className="text-accent" />
                  </div>
                  DHA Phase 8, Eden City
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              Newsletter
            </h4>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">Subscribe for exclusive offers, new arrivals, and fragrance tips.</p>
            
            {success ? (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
                <CheckCircle size={18} />
                <span>Thanks for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 text-sm transition-all duration-300 disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={loading}
                    aria-label={loading ? "Subscribing..." : "Subscribe to newsletter"}
                    className="px-4 py-3 bg-accent hover:bg-accent/90 text-slate-900 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-accent/25 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
                {error && (
                  <p className="text-red-400 text-xs">{error}</p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © 2026 BY12. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-slate-500 hover:text-accent transition-colors duration-300">Privacy Policy</Link>
              <Link href="/terms" className="text-slate-500 hover:text-accent transition-colors duration-300">Terms of Service</Link>
              <Link href="/refund" className="text-slate-500 hover:text-accent transition-colors duration-300">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
