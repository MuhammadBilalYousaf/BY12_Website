"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { trackSignUp, trackSignIn } from "@/lib/tracking"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if this is an admin user - if so, don't set them as logged in on website
          const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid))
          if (adminDoc.exists() && adminDoc.data()?.role === "admin") {
            // This is an admin user - don't set them as website user
            setUser(null)
            setLoading(false)
            return
          }

          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || userData.name || "",
              role: userData.role || "customer",
              createdAt: userData.createdAt?.toDate() || new Date(),
            })
          } else {
            // Fallback if no Firestore document
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || "",
              role: "customer",
              createdAt: new Date(),
            })
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "",
            role: "customer",
            createdAt: new Date(),
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Check if this is an admin user - reject them from website login
      try {
        const adminDoc = await getDoc(doc(db, "admins", userCredential.user.uid))
        if (adminDoc.exists() && adminDoc.data()?.role === "admin") {
          // Sign them out immediately - admin credentials not allowed on website
          await firebaseSignOut(auth)
          setUser(null)
          return { success: false, message: "Invalid email or password" }
        }
      } catch (adminCheckError) {
        console.error("Error checking admin status:", adminCheckError)
      }
      
      // Get user data from Firestore
      try {
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUser({
            id: userCredential.user.uid,
            email: userCredential.user.email || "",
            name: userCredential.user.displayName || userData.name || "",
            role: userData.role || "customer",
            createdAt: userData.createdAt?.toDate() || new Date(),
          })
        }
      } catch (firestoreError) {
        console.error("Error fetching user data from Firestore:", firestoreError)
      }

      // Track sign-in
      trackSignIn(
        email.toLowerCase(),
        userCredential.user.uid,
        userCredential.user.displayName || undefined
      ).catch(() => {
        // Silently fail - don't disrupt user experience
      })
      
      return { success: true, message: "Sign in successful" }
    } catch (error: any) {
      console.error("Sign in error:", error)
      let message = "Failed to sign in"
      
      switch (error.code) {
        case "auth/invalid-email":
          message = "Invalid email address"
          break
        case "auth/user-disabled":
          message = "This account has been disabled"
          break
        case "auth/user-not-found":
          message = "No account found with this email"
          break
        case "auth/wrong-password":
          message = "Incorrect password"
          break
        case "auth/invalid-credential":
          message = "Invalid email or password"
          break
        case "auth/too-many-requests":
          message = "Too many failed attempts. Please try again later"
          break
        case "auth/network-request-failed":
          message = "Network error. Please check your internet connection"
          break
        default:
          message = error.message || "Failed to sign in"
      }
      
      return { success: false, message }
    }
  }

  const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log("Starting sign up process...")
      
      // Verify Firebase is configured
      if (!auth) {
        throw new Error("Firebase Authentication is not initialized")
      }

      if (!db) {
        throw new Error("Firestore is not initialized")
      }

      // Create user with Firebase Auth
      console.log("Creating user with email:", email)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log("User created successfully:", userCredential.user.uid)
      
      // Update display name
      console.log("Updating display name...")
      await updateProfile(userCredential.user, {
        displayName: name,
      })
      console.log("Display name updated")

      // Create user document in Firestore
      console.log("Creating Firestore document...")
      const userData = {
        email,
        name,
        role: "customer",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await setDoc(doc(db, "users", userCredential.user.uid), userData)
      console.log("Firestore document created successfully")

      setUser({
        id: userCredential.user.uid,
        email,
        name,
        role: "customer",
        createdAt: new Date(),
      })

      // Track sign-up
      trackSignUp(
        email.toLowerCase(),
        name,
        userCredential.user.uid
      ).catch(() => {
        // Silently fail - don't disrupt user experience
      })

      return { success: true, message: "Account created successfully" }
    } catch (error: any) {
      console.error("Sign up error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      
      let message = "Failed to create account"
      
      switch (error.code) {
        case "auth/email-already-in-use":
          message = "This email is already registered. Please sign in instead."
          break
        case "auth/invalid-email":
          message = "Invalid email address format"
          break
        case "auth/operation-not-allowed":
          message = "Email/Password sign-up is not enabled. Please enable it in Firebase Console under Authentication > Sign-in method > Email/Password."
          break
        case "auth/weak-password":
          message = "Password is too weak. Please use at least 6 characters"
          break
        case "auth/configuration-not-found":
          message = "Email/Password authentication is not properly configured. Please enable it in Firebase Console."
          break
        case "auth/network-request-failed":
          message = "Network error. Please check your internet connection"
          break
        case "permission-denied":
          message = "Permission denied. Please check Firestore security rules"
          break
        default:
          message = error.message || "Failed to create account. Please try again."
      }
      
      return { success: false, message }
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
