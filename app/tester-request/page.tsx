"use client"

import { useState, useRef } from "react"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { trackFormFieldChange, trackFormSubmission, linkGuestInteractionsToEmail, clearGuestId, getOrCreateGuestId } from "@/lib/tracking"
import { useAuth } from "@/lib/contexts"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageBreadcrumb from "@/components/page-breadcrumb"
import { Mail, Phone, Sparkles, Send, Loader2, CheckCircle, AlertCircle, User, MapPin, Heart } from "lucide-react"
import { FadeInSection, FadeInStagger, FadeInItem } from "@/components/animated-section"

export default function TesterRequestPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    location: "",
    fragrancePreferences: "",
    experience: "",
    howYouHeardAboutUs: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const trackingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: value }

      if (trackingTimeoutRef.current) {
        clearTimeout(trackingTimeoutRef.current)
      }

      trackingTimeoutRef.current = setTimeout(() => {
        const emailForTrack =
          (name === "email" ? value : next.email) || user?.email || ""
        const guestId = !user ? getOrCreateGuestId() : undefined

        trackFormFieldChange(
          emailForTrack.toLowerCase(),
          name,
          value,
          "tester_request_form",
          user?.id,
          guestId
        ).catch(() => {})
      }, 500)

      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.location || !formData.fragrancePreferences) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address")
        setLoading(false)
        return
      }

      // Save to Firestore
      await addDoc(collection(db, "testerRequests"), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email.toLowerCase(),
        phone: formData.phone,
        age: formData.age || "Not specified",
        location: formData.location,
        fragrancePreferences: formData.fragrancePreferences,
        experience: formData.experience || "Not specified",
        howYouHeardAboutUs: formData.howYouHeardAboutUs || "Not specified",
        message: formData.message,
        status: "pending",
        createdAt: serverTimestamp(),
        userId: user?.id || null,
      })

      // Track form submission (typing was already tracked as tester_request_form)
      const guestId = !user ? getOrCreateGuestId() : undefined
      await trackFormSubmission({
        email: formData.email.toLowerCase(),
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        interactionType: "tester_request_form",
        messageId: "tester_request_submitted",
        customerId: user?.id,
        guestSessionId: guestId,
        conversionType: "contact_submission",
        extra: { phone: formData.phone },
      }).catch(() => {})

      if (!user) {
        await linkGuestInteractionsToEmail(formData.email.toLowerCase(), guestId).catch(() => {})
        clearGuestId()
      }

      // Send confirmation email via API
      const response = await fetch("/api/tester-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        console.warn("Email notification failed, but request saved to database")
      }

      setSuccess(true)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        age: "",
        location: "",
        fragrancePreferences: "",
        experience: "",
        howYouHeardAboutUs: "",
        message: "",
      })

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: unknown) {
      console.error("Error submitting request:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(`Failed to submit request: ${errorMessage}`)
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
          <PageBreadcrumb items={[{ label: "Become a Tester" }]} />
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
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-accent text-sm font-medium tracking-wide uppercase">Join Our Community</span>
                </div>
              </FadeInSection>

              <FadeInSection delay={0.2}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Become a Fragrance <span className="text-accent">Tester</span>
                </h1>
              </FadeInSection>

              <FadeInSection delay={0.3}>
                <p className="text-lg text-slate-300 mb-8">
                  Join our exclusive tester program and be among the first to discover our latest fragrances. Share your feedback and help shape the future of BY12 Perfumes.
                </p>
              </FadeInSection>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <FadeInStagger>
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  icon: Heart,
                  title: "Exclusive Access",
                  description: "Get early access to new fragrances before they launch to the public"
                },
                {
                  icon: Mail,
                  title: "Special Rewards",
                  description: "Receive exclusive discounts, rewards, and special offers as a valued tester"
                },
                {
                  icon: Sparkles,
                  title: "Shape The Future",
                  description: "Your feedback directly influences our product development and improvements"
                }
              ].map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <FadeInItem key={index}>
                    <div className="group p-6 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-accent/10 hover:border-accent/30 transition-all duration-300">
                      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                      <p className="text-slate-400">{benefit.description}</p>
                    </div>
                  </FadeInItem>
                )
              })}
            </div>
          </FadeInStagger>
        </div>

        {/* Application Form Section */}
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
          <FadeInSection delay={0.1}>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-accent/10 p-8 md:p-12 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-white mb-8">Apply Now</h2>

              {success && (
                <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-emerald-400 mb-1">Request Submitted Successfully!</h4>
                    <p className="text-emerald-300 text-sm">
                      Thank you for your interest! We'll review your application and contact you soon.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-400 mb-1">Error</h4>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-accent" />
                    Personal Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-accent" />
                    Contact Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+92 300 1234567"
                        className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Demographics */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Demographics</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Age (Optional)
                      </label>
                      <select
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-colors"
                      >
                        <option value="">Select Age Range</option>
                        <option value="18-25">18-25</option>
                        <option value="26-35">26-35</option>
                        <option value="36-45">36-45</option>
                        <option value="46-55">46-55</option>
                        <option value="56+">56+</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="City, Country"
                        className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Fragrance Preferences */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Fragrance Interests
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Fragrance Type Preferences * (Select all that apply)
                    </label>
                    <div className="space-y-2">
                      {["Floral", "Woody", "Fresh", "Oriental", "Fruity", "Spicy"].map((pref) => (
                        <label key={pref} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            value={pref}
                            checked={formData.fragrancePreferences.includes(pref)}
                            onChange={(e) => {
                              const val = e.target.value
                              let prefs = formData.fragrancePreferences.split(", ").filter(p => p)
                              if (e.target.checked) {
                                prefs.push(val)
                              } else {
                                prefs = prefs.filter(p => p !== val)
                              }
                              setFormData({ ...formData, fragrancePreferences: prefs.join(", ") })
                            }}
                            className="w-4 h-4 rounded border-accent/30 bg-slate-900/50 text-accent focus:ring-accent/50"
                          />
                          <span className="text-slate-300">{pref}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Fragrance Testing Experience (Optional)
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-colors"
                  >
                    <option value="">Select Experience Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* How You Heard */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    How did you hear about us? (Optional)
                  </label>
                  <select
                    name="howYouHeardAboutUs"
                    value={formData.howYouHeardAboutUs}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-colors"
                  >
                    <option value="">Select an option</option>
                    <option value="social_media">Social Media</option>
                    <option value="friend_referral">Friend Referral</option>
                    <option value="website">Website</option>
                    <option value="google">Google Search</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Additional Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tell us why you'd like to be a tester (Optional)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Share what makes you a great tester..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-colors resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-slate-900 font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Application
                    </>
                  )}
                </button>

                <p className="text-sm text-slate-400 text-center">
                  * Required fields. By submitting, you agree to be contacted regarding your application.
                </p>
              </form>
            </div>
          </FadeInSection>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
          <FadeInSection delay={0.1}>
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {[
                {
                  q: "How often do you send samples?",
                  a: "Once you're accepted into the program, you'll receive samples regularly - typically every 2-3 months, depending on new releases and product development."
                },
                {
                  q: "Do I need to purchase anything?",
                  a: "No! All fragrances provided to testers are complimentary. We simply ask for your honest feedback and review."
                },
                {
                  q: "How much time does it take to be a tester?",
                  a: "It's flexible! You can spend as little or as much time as you'd like testing and providing feedback. Most testers spend 1-2 hours per sample."
                },
                {
                  q: "Can international users apply?",
                  a: "Yes, we welcome international applications! However, shipping may take longer depending on your location."
                },
                {
                  q: "When will I hear back about my application?",
                  a: "We typically review applications within 5-7 business days. You'll be notified via email about the status of your application."
                }
              ].map((faq, index) => (
                <FadeInItem key={index}>
                  <div className="p-6 rounded-lg bg-slate-800/50 border border-accent/10 hover:border-accent/20 transition-colors">
                    <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                    <p className="text-slate-400">{faq.a}</p>
                  </div>
                </FadeInItem>
              ))}
            </div>
          </FadeInSection>
        </div>
      </main>
      <Footer />
    </>
  )
}
