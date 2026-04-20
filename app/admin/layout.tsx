"use client"

import { AdminAuthProvider, useAdminAuth } from "@/lib/contexts/admin-auth-context"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import AdminSidebar from "@/components/admin/admin-sidebar"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Allow access to sign-in and sign-up pages without authentication
    if (pathname === "/admin/sign-in" || pathname === "/admin/sign-up" || loading) return

    // Redirect to sign-in if not authenticated
    if (!user) {
      router.push("/admin/sign-in")
    }
  }, [user, loading, pathname, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-white font-semibold">Loading...</p>
        </div>
      </div>
    )
  }

  // Allow sign-in and sign-up pages to render without authentication
  if (pathname === "/admin/sign-in" || pathname === "/admin/sign-up") {
    return <>{children}</>
  }

  // Protect all other admin routes
  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64">
        {children}
      </main>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  )
}