"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/contexts"
import { linkGuestInteractionsToEmail, clearGuestId } from "@/lib/tracking"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Mail, Lock, User as UserIcon, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { FadeInSection } from "@/components/animated-section"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user, loading } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/")
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validation
    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      // Import Firebase functions directly for sign-up only
      const { createUserWithEmailAndPassword, updateProfile, signOut: firebaseSignOut } = await import("firebase/auth")
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore")
      const { auth, db } = await import("@/lib/firebase")

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update display name
      await updateProfile(userCredential.user, {
        displayName: name,
      })

      // Create user document in Firestore
      const userData = {
        email,
        name,
        role: "customer",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await setDoc(doc(db, "users", userCredential.user.uid), userData)

      // Sign out the user immediately after registration
      await firebaseSignOut(auth)

      // Link all guest interactions (cart, etc.) to this email
      await linkGuestInteractionsToEmail(email.toLowerCase()).catch(() => {
        // Silently fail
      })
      // Clear guest ID after linking
      clearGuestId()

      // Show success message
      setSuccess(true)

      // Redirect to sign-in page after 2 seconds
      setTimeout(() => {
        router.push("/sign-in?registered=true")
      }, 2000)

    } catch (error: any) {
      console.error("Sign up error:", error)
      let message = "Failed to create account"
      
      switch (error.code) {
        case "auth/email-already-in-use":
          message = "This email is already registered. Please sign in instead."
          break
        case "auth/invalid-email":
          message = "Invalid email address format"
          break
        case "auth/operation-not-allowed":
          message = "Email/Password sign-up is not enabled. Please enable it in Firebase Console."
          break
        case "auth/weak-password":
          message = "Password is too weak. Please use at least 6 characters"
          break
        case "auth/configuration-not-found":
          message = "Email/Password authentication is not enabled. Please enable it in Firebase Console."
          break
        case "auth/network-request-failed":
          message = "Network error. Please check your internet connection"
          break
        default:
          message = error.message || "Failed to create account. Please try again."
      }
      
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 md:py-20">
        <div className="max-w-md mx-auto px-4">
          {/* Header */}
          <FadeInSection delay={0.1}>
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-slate-400">Join us and discover exclusive fragrances</p>
          </div>
          </FadeInSection>

          {/* Sign Up Card */}
          <FadeInSection delay={0.2}>
          <div 
            className="rounded-2xl shadow-lg p-6 md:p-8"
            style={{
              background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-green-200">Account Created Successfully!</p>
                    <p className="text-sm text-green-300 mt-1">
                      Redirecting to sign in page...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                    required
                    disabled={isLoading || success}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                    required
                    disabled={isLoading || success}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-12 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                    required
                    disabled={isLoading || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    disabled={isLoading || success}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-12 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-800/50 text-white placeholder:text-slate-500"
                    required
                    disabled={isLoading || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    disabled={isLoading || success}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-2">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Terms and Conditions */}
              <p className="text-xs text-slate-400">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-accent hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-accent hover:underline">
                  Privacy Policy
                </Link>
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full py-3 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent/25"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                )}
                {success ? "Account Created!" : isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            {!success && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-800 text-slate-400">Already have an account?</span>
                  </div>
                </div>

                {/* Sign In Link */}
                <Link
                  href="/sign-in"
                  className="block w-full py-3 border-2 border-accent text-accent rounded-lg font-semibold hover:bg-accent/10 transition text-center"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
          </FadeInSection>
        </div>
      </main>
      <Footer />
    </>
  )
}