"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { MailX, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { collection, query, where, getDocs, deleteDoc, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Generate a unique coupon code for the user
function generateCouponCode(email: string): string {
  const emailPrefix = email.split("@")[0].substring(0, 4).toUpperCase()
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `COMEBACK_${emailPrefix}_${randomPart}`
}

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email")
  
  const [email, setEmail] = useState(emailParam || "")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [generatedCoupon, setGeneratedCoupon] = useState("")

  // Auto-unsubscribe if email is in URL
  useEffect(() => {
    if (emailParam) {
      handleUnsubscribe(emailParam)
    }
  }, [emailParam])

  const handleUnsubscribe = async (emailToUnsubscribe?: string) => {
    const targetEmail = emailToUnsubscribe || email
    
    if (!targetEmail || !targetEmail.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Find the subscriber
      const subscribersRef = collection(db, "newsletterSubscribers")
      const q = query(subscribersRef, where("email", "==", targetEmail.toLowerCase()))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        setError("This email is not subscribed to our newsletter")
        setLoading(false)
        return
      }

      // Delete subscriber from the collection completely
      const subscriberDoc = snapshot.docs[0]
      await deleteDoc(doc(db, "newsletterSubscribers", subscriberDoc.id))
      
      // Generate and create a personalized coupon for this user
      const normalizedEmail = targetEmail.toLowerCase().trim()
      const couponCode = generateCouponCode(normalizedEmail)
      const couponId = couponCode.replace(/\s+/g, '_')
      
      // Set expiry to 30 days from now
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 30)
      
      try {
        await setDoc(doc(db, "coupons", couponId), {
          code: couponCode,
          discountType: "percentage",
          discountValue: 10,
          minPurchase: 0,
          maxDiscount: 500,
          usageLimit: 1,
          usedCount: 0,
          expiryDate: expiryDate.toISOString(),
          isActive: true,
          allowedEmails: [normalizedEmail],
          usedByEmails: [],
          isPersonalized: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        console.log("✅ Personalized coupon created:", couponCode)
        setGeneratedCoupon(couponCode)
      } catch (couponErr) {
        console.error("Error creating coupon:", couponErr)
      }

      // Send unsubscribe confirmation email with the coupon code
      try {
        await fetch("/api/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, couponCode }),
        })
      } catch (emailErr) {
        console.error("Failed to send unsubscribe email:", emailErr)
      }

      setSuccess(true)
      setEmail("")
    } catch (err) {
      console.error("Unsubscribe error:", err)
      setError("Failed to unsubscribe. Please try again or contact support.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleUnsubscribe()
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-20">
        <div className="max-w-md w-full mx-4">
          {success ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Successfully Unsubscribed</h1>
              <p className="text-slate-300 mb-6">
                You have been unsubscribed from our newsletter. You will no longer receive marketing emails from BY12 Perfumes.
              </p>
              
              {generatedCoupon && (
                <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6">
                  <p className="text-accent font-semibold mb-2">🎁 Your Exclusive Comeback Gift!</p>
                  <p className="text-slate-300 text-sm mb-3">
                    We've created a special 10% off coupon just for you:
                  </p>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <span className="text-accent text-xl font-bold tracking-wider">{generatedCoupon}</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-2">
                    Valid for 30 days • Max Rs.500 off • One-time use
                  </p>
                </div>
              )}
              
              <p className="text-slate-400 text-sm">
                Changed your mind?{" "}
                <a href="/" className="text-accent hover:underline">
                  Visit our website
                </a>{" "}
                to subscribe again.
              </p>
            </div>
          ) : (
            <div
              className="rounded-2xl p-8"
              style={{
                background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MailX className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Unsubscribe from Newsletter</h1>
                <p className="text-slate-400">
                  We&apos;re sorry to see you go. Enter your email below to unsubscribe from our mailing list.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <MailX size={20} />
                      Unsubscribe
                    </>
                  )}
                </button>
              </form>

              <p className="text-slate-500 text-xs text-center mt-6">
                If you unsubscribe, you will no longer receive promotional emails, 
                but you may still receive transactional emails about your orders.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}
