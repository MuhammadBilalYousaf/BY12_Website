"use client"

import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

interface PageTransitionProps {
  children: React.ReactNode
}

const luxuryEase = [0.22, 1, 0.36, 1] as const

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const scrollPositions = useRef<Map<string, number>>(new Map())
  const isBackNavigation = useRef(false)

  useEffect(() => {
    const handleBeforeUnload = () => {
      scrollPositions.current.set(pathname, window.scrollY)
    }

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

  useEffect(() => {
    const savedPosition = scrollPositions.current.get(pathname)

    const timeoutId = setTimeout(() => {
      if (isBackNavigation.current && savedPosition !== undefined) {
        window.scrollTo(0, savedPosition)
        isBackNavigation.current = false
      } else {
        window.scrollTo(0, 0)
      }
    }, 50)

    return () => clearTimeout(timeoutId)
  }, [pathname])

  useEffect(() => {
    const saveScrollPosition = () => {
      scrollPositions.current.set(pathname, window.scrollY)
    }

    window.addEventListener("scroll", saveScrollPosition, { passive: true })

    return () => {
      window.removeEventListener("scroll", saveScrollPosition)
      scrollPositions.current.set(pathname, window.scrollY)
    }
  }, [pathname])

  const pageVariants = reduceMotion
    ? {
        initial: { opacity: 0 },
        enter: {
          opacity: 1,
          transition: { duration: 0.2 },
        },
        exit: {
          opacity: 0,
          transition: { duration: 0.15 },
        },
      }
    : {
        initial: { opacity: 0, y: 6 },
        enter: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.45,
            ease: luxuryEase,
          },
        },
        exit: {
          opacity: 0,
          y: -4,
          transition: {
            duration: 0.28,
            ease: luxuryEase,
          },
        },
      }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        style={{
          minHeight: "100vh",
          width: "100%",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
