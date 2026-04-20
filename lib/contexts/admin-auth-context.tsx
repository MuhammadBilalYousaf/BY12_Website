"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"

interface AdminUser {
  id: string
  email: string
  name: string
  isAdmin: boolean
}

interface AdminAuthContextType {
  user: AdminUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      // Only process auth state for admin context if we're on admin routes
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
        setUser(null)
        setLoading(false)
        return
      }

      if (firebaseUser) {
        try {
          // Get admin document from Firestore
          const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid))
          
          if (adminDoc.exists() && adminDoc.data()?.role === "admin") {
            const adminData = adminDoc.data()
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: adminData.name || firebaseUser.email?.split("@")[0] || "Admin",
              isAdmin: true,
            })
          } else {
            // User is not admin, sign them out
            await firebaseSignOut(auth)
            setUser(null)
            router.push("/admin/sign-in?error=unauthorized")
          }
        } catch (error) {
          console.error("Error fetching admin data:", error)
          await firebaseSignOut(auth)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Get admin document to check role and get name
      const adminDoc = await getDoc(doc(db, "admins", userCredential.user.uid))

      if (!adminDoc.exists() || adminDoc.data()?.role !== "admin") {
        await firebaseSignOut(auth)
        throw new Error("You are not authorized to access the admin panel")
      }

      const adminData = adminDoc.data()
      setUser({
        id: userCredential.user.uid,
        email: userCredential.user.email || "",
        name: adminData.name || userCredential.user.email?.split("@")[0] || "Admin",
        isAdmin: true,
      })

      router.push("/admin/dashboard")
    } catch (error: any) {
      console.error("Admin sign in error:", error)
      throw new Error(error.message || "Failed to sign in")
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      router.push("/admin/sign-in")
    } catch (error) {
      console.error("Admin sign out error:", error)
      throw error
    }
  }

  return (
    <AdminAuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider")
  }
  return context
}