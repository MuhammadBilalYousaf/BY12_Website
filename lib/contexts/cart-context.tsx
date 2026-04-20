"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { trackCartOperation, getOrCreateGuestId } from "@/lib/tracking"
import type { Product, CartItem } from "@/lib/types"

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, selectedSize?: number, selectedPrice?: number) => void
  removeItem: (productId: string, selectedSize?: number) => void
  updateQuantity: (productId: string, quantity: number, selectedSize?: number) => void
  clearCart: () => void
  total: number
  itemCount: number
  isLoading: boolean
  discount: number
  appliedCoupon: string | null
  applyDiscount: (couponCode: string, discountAmount: number) => void
  removeDiscount: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [discount, setDiscount] = useState(0)
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const { user } = useAuth()

  // Load cart from Firestore or localStorage
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true)
      try {
        if (user) {
          // Clear localStorage cart when user signs in (separate from guest cart)
          localStorage.removeItem("cart")
          localStorage.removeItem("cart_discount")
          localStorage.removeItem("applied_coupon")
          
          // Load from Firestore for authenticated users only
          const cartDoc = await getDoc(doc(db, "carts", user.id))
          if (cartDoc.exists()) {
            const data = cartDoc.data()
            setItems(data.items || [])
            setDiscount(data.discount || 0)
            setAppliedCoupon(data.appliedCoupon || null)
          } else {
            // No cart exists yet for this user, initialize empty
            setItems([])
            setDiscount(0)
            setAppliedCoupon(null)
          }
        } else {
          // User signed out - reset cart state for guest
          setItems([])
          setDiscount(0)
          setAppliedCoupon(null)
          
          // Then load from localStorage if any guest items exist
          const localCart = localStorage.getItem("cart")
          const localDiscount = localStorage.getItem("cart_discount")
          const localCoupon = localStorage.getItem("applied_coupon")
          
          if (localCart) {
            try {
              setItems(JSON.parse(localCart))
            } catch (error) {
              console.error("Failed to parse cart:", error)
            }
          }
          
          if (localDiscount) {
            try {
              setDiscount(JSON.parse(localDiscount))
            } catch (error) {
              console.error("Failed to parse discount:", error)
            }
          }
          
          if (localCoupon) {
            setAppliedCoupon(localCoupon)
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [user])

  // Save cart to Firestore or localStorage
  const saveCart = async (newItems: CartItem[], newDiscount: number, newCoupon: string | null) => {
    try {
      if (user) {
        // Save to Firestore for authenticated users
        await setDoc(doc(db, "carts", user.id), {
          userId: user.id,
          items: newItems,
          discount: newDiscount,
          appliedCoupon: newCoupon,
          updatedAt: new Date(),
        }, { merge: true })
      } else {
        // Save to localStorage for guests
        localStorage.setItem("cart", JSON.stringify(newItems))
        localStorage.setItem("cart_discount", JSON.stringify(newDiscount))
        if (newCoupon) {
          localStorage.setItem("applied_coupon", newCoupon)
        } else {
          localStorage.removeItem("applied_coupon")
        }
      }
    } catch (error) {
      console.error("Error saving cart:", error)
    }
  }

  const calculateSalePrice = (price: number, saleType?: "percent" | "amount", saleValue?: number) => {
    if (!saleType || !saleValue) return price
    return saleType === "percent"
      ? Math.round(price * (1 - saleValue / 100))
      : Math.max(0, price - saleValue)
  }

  const resolveItemSelection = (product: Product, selectedSize?: number, selectedPrice?: number) => {
    // Keep explicit selections from product page untouched.
    if (selectedPrice !== undefined) {
      return { resolvedSize: selectedSize, resolvedPrice: selectedPrice }
    }

    // For products with variants, default to first in-stock variant (or first variant).
    if (product.sizeVariants && product.sizeVariants.length > 0) {
      const variant =
        (selectedSize !== undefined
          ? product.sizeVariants.find((v) => v.size === selectedSize)
          : undefined) ||
        product.sizeVariants.find((v) => v.stock > 0) ||
        product.sizeVariants[0]

      const variantPrice = variant.onSale
        ? calculateSalePrice(variant.price, variant.saleType, variant.saleValue)
        : variant.price

      return {
        resolvedSize: selectedSize ?? variant.size,
        resolvedPrice: variantPrice,
      }
    }

    // Backward-compatible single-price products.
    const basePrice =
      product.onSale && product.salePrice !== undefined
        ? product.salePrice
        : product.price

    return { resolvedSize: selectedSize, resolvedPrice: basePrice }
  }

  const addItem = (product: Product, quantity: number = 1, selectedSize?: number, selectedPrice?: number) => {
    const { resolvedSize, resolvedPrice } = resolveItemSelection(product, selectedSize, selectedPrice)

    setItems((currentItems) => {
      // Find existing item with same product ID AND same size
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id && item.selectedSize === resolvedSize
      )
      let newItems: CartItem[]

      if (existingItem) {
        newItems = currentItems.map((item) =>
          item.product.id === product.id && item.selectedSize === resolvedSize
            ? { ...item, quantity: item.quantity + quantity, selectedPrice: resolvedPrice }
            : item
        )
      } else {
        newItems = [...currentItems, { 
          product, 
          quantity, 
          productId: product.id,
          selectedSize: resolvedSize,
          selectedPrice: resolvedPrice,
        }]
      }

      // Track cart add operation for both signed-in and guest users
      const trackEmail = user?.email
      const guestId = !user ? getOrCreateGuestId() : undefined

      if (trackEmail || guestId) {
        trackCartOperation(
          trackEmail || "", // Empty string for guests - will be filled by guestId
          product.name,
          product.id,
          quantity,
          "cart_add",
          user?.id,
          guestId // Pass guest ID for guest users
        ).catch(() => {
          // Silently fail - don't disrupt user experience
        })
      }

      // Save after state update
      saveCart(newItems, discount, appliedCoupon)
      return newItems
    })
  }

  const removeItem = (productId: string, selectedSize?: number) => {
    setItems((currentItems) => {
      const itemToRemove = currentItems.find(
        (item) => item.product.id === productId && item.selectedSize === selectedSize
      )

      const newItems = currentItems.filter(
        (item) => !(item.product.id === productId && item.selectedSize === selectedSize)
      )

      // Track cart remove operation for both signed-in and guest users
      if (itemToRemove) {
        const trackEmail = user?.email
        const guestId = !user ? getOrCreateGuestId() : undefined

        if (trackEmail || guestId) {
          trackCartOperation(
            trackEmail || "", // Empty string for guests - will be filled by guestId
            itemToRemove.product.name,
            productId,
            itemToRemove.quantity,
            "cart_remove",
            user?.id,
            guestId // Pass guest ID for guest users
          ).catch(() => {
            // Silently fail - don't disrupt user experience
          })
        }
      }

      saveCart(newItems, discount, appliedCoupon)
      return newItems
    })
  }

  const updateQuantity = (productId: string, quantity: number, selectedSize?: number) => {
    if (quantity < 1) {
      removeItem(productId, selectedSize)
      return
    }

    setItems((currentItems) => {
      const newItems = currentItems.map((item) => 
        item.product.id === productId && item.selectedSize === selectedSize
          ? { ...item, quantity } 
          : item
      )
      saveCart(newItems, discount, appliedCoupon)
      return newItems
    })
  }

  const clearCart = async () => {
    setItems([])
    setDiscount(0)
    setAppliedCoupon(null)
    
    try {
      if (user) {
        await setDoc(doc(db, "carts", user.id), {
          userId: user.id,
          items: [],
          discount: 0,
          appliedCoupon: null,
          updatedAt: new Date(),
        })
      } else {
        localStorage.removeItem("cart")
        localStorage.removeItem("cart_discount")
        localStorage.removeItem("applied_coupon")
      }
    } catch (error) {
      console.error("Error clearing cart:", error)
    }
  }

  const applyDiscount = (couponCode: string, discountAmount: number) => {
    setDiscount(discountAmount)
    setAppliedCoupon(couponCode)
    saveCart(items, discountAmount, couponCode)
  }

  const removeDiscount = () => {
    setDiscount(0)
    setAppliedCoupon(null)
    saveCart(items, 0, null)
  }

  const total = items.reduce((sum, item) => {
    const price = item.selectedPrice ?? item.product.price
    return sum + price * item.quantity
  }, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        isLoading,
        discount,
        appliedCoupon,
        applyDiscount,
        removeDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
