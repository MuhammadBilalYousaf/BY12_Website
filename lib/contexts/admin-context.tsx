"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface Admin {
  id: string
  email: string
  name: string
  role: "admin"
}

interface AdminContextType {
  admin: Admin | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signOut: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

// Demo admin credentials (replace with actual backend authentication)
const DEMO_ADMIN = {
  email: "admin@perfume.com",
  password: "admin123",
  id: "admin-1",
  name: "Admin User",
  role: "admin" as const,
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if admin is logged in on mount
  useEffect(() => {
    const adminData = localStorage.getItem("admin")
    if (adminData) {
      try {
        setAdmin(JSON.parse(adminData))
      } catch (error) {
        localStorage.removeItem("admin")
      }
    }
    setIsLoading(false)
  }, [])

  const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    // Demo authentication (replace with actual backend call)
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      const adminData = {
        id: DEMO_ADMIN.id,
        email: DEMO_ADMIN.email,
        name: DEMO_ADMIN.name,
        role: DEMO_ADMIN.role,
      }
      setAdmin(adminData)
      localStorage.setItem("admin", JSON.stringify(adminData))
      return { success: true, message: "Login successful" }
    }

    return { success: false, message: "Invalid email or password" }
  }

  const signOut = () => {
    setAdmin(null)
    localStorage.removeItem("admin")
  }

  return (
    <AdminContext.Provider value={{ admin, isLoading, signIn, signOut }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}