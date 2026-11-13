"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/contexts"
import { trackPageView, getOrCreateGuestId } from "@/lib/tracking"

/**
 * Tracks page visits for guests and signed-in users.
 * Mount once in the root layout (client side).
 */
export default function VisitorTracker() {
  const pathname = usePathname()
  const { user } = useAuth()
  const lastPathRef = useRef<string>("")

  useEffect(() => {
    // Skip admin routes
    if (!pathname || pathname.startsWith("/admin")) return
    if (pathname === lastPathRef.current) return
    lastPathRef.current = pathname

    // Ensure guest session exists ASAP
    getOrCreateGuestId()

    trackPageView(pathname, user?.email, user?.id).catch(() => {})
  }, [pathname, user?.email, user?.id])

  return null
}
