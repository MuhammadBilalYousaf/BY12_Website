"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product } from "@/lib/types"

interface WishlistContextType {
  wishlist: Product[]
  isLoading: boolean
  addItem: (product: Product) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => Promise<void>
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Load wishlist from Firestore or localStorage
  useEffect(() => {
    const loadWishlist = async () => {
      setIsLoading(true)
      try {
        if (user) {
          // Clear localStorage wishlist when user signs in (separate from guest wishlist)
          localStorage.removeItem("wishlist")
          
          // Load from Firestore for authenticated users only
          const wishlistDoc = await getDoc(doc(db, "wishlists", user.id))
          if (wishlistDoc.exists()) {
            setWishlist(wishlistDoc.data().items || [])
          } else {
            // No wishlist exists yet for this user, initialize empty
            setWishlist([])
          }
        } else {
          // Load from localStorage for guests
          const localWishlist = localStorage.getItem("wishlist")
          if (localWishlist) {
            setWishlist(JSON.parse(localWishlist))
          } else {
            setWishlist([])
          }
        }
      } catch (error) {
        console.error("Error loading wishlist:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadWishlist()
  }, [user])

  // Save to localStorage for guests
  useEffect(() => {
    if (!user && wishlist.length > 0) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist))
    }
  }, [wishlist, user])

  const addItem = async (product: Product) => {
    try {
      // Check if product already exists in wishlist
      if (wishlist.some(item => item.id === product.id)) {
        return
      }

      const newWishlist = [...wishlist, product]
      setWishlist(newWishlist)

      if (user) {
        // Save to Firestore for authenticated users
        const wishlistRef = doc(db, "wishlists", user.id)
        const wishlistDoc = await getDoc(wishlistRef)

        if (wishlistDoc.exists()) {
          await updateDoc(wishlistRef, {
            items: arrayUnion(product),
            updatedAt: new Date(),
          })
        } else {
          await setDoc(wishlistRef, {
            userId: user.id,
            items: [product],
            updatedAt: new Date(),
          })
        }
      } else {
        // Save to localStorage for guest users
        localStorage.setItem("wishlist", JSON.stringify(newWishlist))
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error)
    }
  }

  const removeItem = async (productId: string) => {
    try {
      const newWishlist = wishlist.filter((item) => item.id !== productId)
      setWishlist(newWishlist)

      if (user) {
        // Remove from Firestore
        const productToRemove = wishlist.find((item) => item.id === productId)
        if (productToRemove) {
          await updateDoc(doc(db, "wishlists", user.id), {
            items: arrayRemove(productToRemove),
            updatedAt: new Date(),
          })
        }
      } else {
        // Update localStorage for guest users
        localStorage.setItem("wishlist", JSON.stringify(newWishlist))
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error)
    }
  }

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId)
  }

  const clearWishlist = async () => {
    try {
      setWishlist([])

      if (user) {
        await updateDoc(doc(db, "wishlists", user.id), {
          items: [],
          updatedAt: new Date(),
        })
      } else {
        localStorage.removeItem("wishlist")
      }
    } catch (error) {
      console.error("Error clearing wishlist:", error)
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLoading,
        addItem,
        removeItem,
        isInWishlist,
        clearWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within WishlistProvider")
  }
  return context
}