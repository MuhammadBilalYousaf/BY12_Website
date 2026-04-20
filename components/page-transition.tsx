"use client"

import { motion, AnimatePresence, easeInOut } from "framer-motion"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

interface PageTransitionProps {
  children: React.ReactNode
}

// Page transition variants - fade + subtle slide
const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easeInOut,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.3,
      ease: easeInOut,
    },
  },
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const scrollPositions = useRef<Map<string, number>>(new Map())
  const isBackNavigation = useRef(false)

  // Handle scroll restoration
  useEffect(() => {
    // Save current scroll position before navigation
    const handleBeforeUnload = () => {
      scrollPositions.current.set(pathname, window.scrollY)
    }

    // Detect back/forward navigation
    const handlePopState = () => {
      isBackNavigation.current = true
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [pathname])

  // Restore scroll position or scroll to top
  useEffect(() => {
    const savedPosition = scrollPositions.current.get(pathname)
    
    // Small delay to ensure content is rendered
    const timeoutId = setTimeout(() => {
      if (isBackNavigation.current && savedPosition !== undefined) {
        window.scrollTo(0, savedPosition)
        isBackNavigation.current = false
      } else {
        // Scroll to top for new navigation
        window.scrollTo(0, 0)
      }
    }, 50)

    return () => clearTimeout(timeoutId)
  }, [pathname])

  // Save scroll position on route change
  useEffect(() => {
    const saveScrollPosition = () => {
      scrollPositions.current.set(pathname, window.scrollY)
    }

    // Save position when user scrolls
    window.addEventListener("scroll", saveScrollPosition, { passive: true })

    return () => {
      window.removeEventListener("scroll", saveScrollPosition)
      // Save final position when leaving page
      scrollPositions.current.set(pathname, window.scrollY)
    }
  }, [pathname])

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        style={{
          // Prevent layout shift during transitions
          minHeight: "100vh",
          width: "100%",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
