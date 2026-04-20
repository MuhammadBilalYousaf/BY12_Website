"use client"

import { ReactNode, CSSProperties } from "react"
import { motion, Variants } from "framer-motion"

interface FadeInSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  y?: number
  /**
   * Animation variant presets:
   * - "section" - For large content blocks (default)
   * - "heading" - For headings with slightly faster animation
   * - "text" - For paragraphs
   * - "card" - For product/feature cards
   */
  variant?: "section" | "heading" | "text" | "card"
  /** Whether to animate only once or on every viewport entry */
  once?: boolean
  /** Custom amount of element that must be visible to trigger (0-1) */
  amount?: number
  /** Optional inline styles */
  style?: CSSProperties
}

const fadeInVariants: Record<string, Variants> = {
  section: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  heading: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  text: {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  },
  card: {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0 },
  },
}

/**
 * FadeInSection - A reusable scroll-triggered fade-in animation component
 * Uses Framer Motion for smooth, performance-optimized animations
 * Designed for luxury brand aesthetics with subtle, premium motion
 */
export function FadeInSection({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  y,
  variant = "section",
  once = true,
  amount = 0.2,
  style,
}: FadeInSectionProps) {
  // Allow custom y value to override variant default
  const customVariants: Variants = y !== undefined
    ? {
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0 },
      }
    : fadeInVariants[variant]

  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={customVariants}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * FadeInStagger - Container for staggered children animations
 * Wrap items that should animate in sequence
 */
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
  staggerDelay = 0.1,
  once = true,
  amount = 0.2,
  style,
}: FadeInStaggerProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * FadeInItem - Child item for use within FadeInStagger
 * Inherits animation timing from parent stagger container
 */
interface FadeInItemProps {
  children: ReactNode
  className?: string
  y?: number
  style?: CSSProperties
}

export function FadeInItem({
  children,
  className = "",
  y = 25,
  style,
}: FadeInItemProps) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: "easeOut",
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

// Default export for convenience
export default FadeInSection
