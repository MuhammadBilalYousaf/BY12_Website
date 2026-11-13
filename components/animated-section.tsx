"use client"

import {
  ReactNode,
  CSSProperties,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { motion, useReducedMotion, Variants, Transition } from "framer-motion"

type RevealDirection = "up" | "left" | "right" | "scale" | "none" | "scroll"
type ScrollDir = "up" | "down"

/* ── Shared scroll-direction listener (one listener for the whole app) ── */
const scrollListeners = new Set<(dir: ScrollDir) => void>()
let currentScrollDir: ScrollDir = "down"
let scrollAttached = false

function attachScrollDirectionListener() {
  if (scrollAttached || typeof window === "undefined") return
  scrollAttached = true
  let lastY = window.scrollY

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY
      if (Math.abs(y - lastY) < 8) return
      const next: ScrollDir = y > lastY ? "down" : "up"
      lastY = y
      if (next === currentScrollDir) return
      currentScrollDir = next
      scrollListeners.forEach((listener) => listener(next))
    },
    { passive: true }
  )
}

function useScrollDirection(): ScrollDir {
  const [dir, setDir] = useState<ScrollDir>(currentScrollDir)

  useEffect(() => {
    attachScrollDirectionListener()
    setDir(currentScrollDir)
    scrollListeners.add(setDir)
    return () => {
      scrollListeners.delete(setDir)
    }
  }, [])

  return dir
}

const ScrollDirContext = createContext<ScrollDir>("down")

const luxuryEase: Transition["ease"] = [0.22, 1, 0.36, 1]

function buildVariants(
  direction: RevealDirection,
  yOverride: number | undefined,
  blur: boolean,
  reduceMotion: boolean | null,
  scrollDir: ScrollDir = "down"
): Variants {
  if (reduceMotion) {
    return {
      hidden: { opacity: 1 },
      visible: { opacity: 1 },
    }
  }

  const distance = yOverride ?? (direction === "scale" ? 0 : 28)
  const hidden: Record<string, number | string> = { opacity: 0 }
  const visible: Record<string, number | string> = {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
  }

  switch (direction) {
    case "scroll":
      // Enter from below when scrolling down; from above when scrolling up
      hidden.y = scrollDir === "down" ? distance : -distance
      hidden.scale = 0.98
      break
    case "left":
      hidden.x = -distance
      break
    case "right":
      hidden.x = distance
      break
    case "scale":
      hidden.scale = 0.96
      break
    case "none":
      break
    case "up":
    default:
      hidden.y = distance
      break
  }

  if (blur) {
    hidden.filter = "blur(8px)"
    visible.filter = "blur(0px)"
  }

  return { hidden, visible }
}

const presetDistance: Record<string, number> = {
  section: 36,
  heading: 24,
  text: 18,
  card: 28,
}

interface FadeInSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  y?: number
  variant?: "section" | "heading" | "text" | "card"
  /** Use "scroll" (default) for direction-aware enter/exit on scroll */
  direction?: RevealDirection
  blur?: boolean
  /** false = replay every time the section enters view (default) */
  once?: boolean
  amount?: number
  style?: CSSProperties
}

/**
 * Continuous scroll reveal — re-animates when scrolling up or down.
 * Direction-aware: rises in on scroll-down, settles from above on scroll-up.
 */
export function FadeInSection({
  children,
  className = "",
  delay = 0,
  duration = 0.7,
  y,
  variant = "section",
  direction = "scroll",
  blur = false,
  once = false,
  amount = 0.22,
  style,
}: FadeInSectionProps) {
  const reduceMotion = useReducedMotion()
  const scrollDir = useScrollDirection()
  const distance = y ?? presetDistance[variant] ?? 28
  const variants = buildVariants(direction, distance, blur, reduceMotion, scrollDir)

  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: "0px 0px -8% 0px" }}
      variants={variants}
      transition={{
        duration: reduceMotion ? 0.15 : duration,
        delay: reduceMotion ? 0 : delay,
        ease: luxuryEase,
      }}
    >
      {children}
    </motion.div>
  )
}

interface FadeInStaggerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  once?: boolean
  amount?: number
  style?: CSSProperties
}

export function FadeInStagger({
  children,
  className = "",
  staggerDelay = 0.08,
  once = false,
  amount = 0.15,
  style,
}: FadeInStaggerProps) {
  const reduceMotion = useReducedMotion()
  const scrollDir = useScrollDirection()

  return (
    <ScrollDirContext.Provider value={scrollDir}>
      <motion.div
        className={className}
        style={style}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount, margin: "0px 0px -6% 0px" }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: reduceMotion ? 0 : staggerDelay,
              staggerDirection: scrollDir === "down" ? 1 : -1,
            },
          },
        }}
      >
        {children}
      </motion.div>
    </ScrollDirContext.Provider>
  )
}

interface FadeInItemProps {
  children: ReactNode
  className?: string
  y?: number
  direction?: RevealDirection
  blur?: boolean
  style?: CSSProperties
}

export function FadeInItem({
  children,
  className = "",
  y = 28,
  direction = "scroll",
  blur = false,
  style,
}: FadeInItemProps) {
  const reduceMotion = useReducedMotion()
  const scrollDir = useContext(ScrollDirContext)
  const variants = buildVariants(direction, y, blur, reduceMotion, scrollDir)

  return (
    <motion.div
      className={className}
      style={style}
      variants={variants}
      transition={{
        duration: reduceMotion ? 0.15 : 0.55,
        ease: luxuryEase,
      }}
    >
      {children}
    </motion.div>
  )
}

interface HeroRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: RevealDirection
  blur?: boolean
  style?: CSSProperties
}

/** Mount-time hero reveal (page load only — not scroll-replayed). */
export function HeroReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.55,
  direction = "up",
  blur = true,
  style,
}: HeroRevealProps) {
  const reduceMotion = useReducedMotion()
  const variants = buildVariants(direction, 16, blur, reduceMotion, "down")

  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{
        duration: reduceMotion ? 0.2 : duration,
        delay: reduceMotion ? 0 : delay,
        ease: luxuryEase,
      }}
    >
      {children}
    </motion.div>
  )
}

export default FadeInSection
