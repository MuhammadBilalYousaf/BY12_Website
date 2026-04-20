import { useState, useEffect } from "react"
import { collection, query, onSnapshot, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, setDoc, getDoc, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Coupon {
  id: string
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minPurchase: number
  maxDiscount: number
  usageLimit: number
  usedCount: number
  expiryDate: string
  isActive: boolean
  allowedEmails?: string[]
  usedByEmails?: string[]
  isPersonalized?: boolean
  createdAt?: any
  updatedAt?: any
}

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"))
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const couponsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Coupon[]
        setCoupons(couponsData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching coupons:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const addCoupon = async (couponData: Omit<Coupon, "id" | "createdAt" | "updatedAt" | "usedCount">) => {
    try {
      // Use coupon code as document ID (uppercase)
      const couponId = couponData.code.toUpperCase().trim().replace(/\s+/g, '_')
      
      // Check if coupon code already exists
      const existingCoupon = await getDoc(doc(db, "coupons", couponId))
      if (existingCoupon.exists()) {
        return { success: false, error: "Coupon code already exists" }
      }
      
      await setDoc(doc(db, "coupons", couponId), {
        ...couponData,
        code: couponData.code.toUpperCase().trim(),
        usedCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      
      return { success: true, id: couponId }
    } catch (err: any) {
      console.error("Error adding coupon:", err)
      return { success: false, error: err.message }
    }
  }

  const updateCoupon = async (id: string, couponData: Partial<Coupon>) => {
    try {
      await updateDoc(doc(db, "coupons", id), {
        ...couponData,
        updatedAt: serverTimestamp(),
      })
      return { success: true }
    } catch (err: any) {
      console.error("Error updating coupon:", err)
      return { success: false, error: err.message }
    }
  }

  const deleteCoupon = async (id: string) => {
    try {
      await deleteDoc(doc(db, "coupons", id))
      return { success: true }
    } catch (err: any) {
      console.error("Error deleting coupon:", err)
      return { success: false, error: err.message }
    }
  }

  const toggleCouponStatus = async (id: string, isActive: boolean) => {
    return updateCoupon(id, { isActive })
  }

  // Validate a coupon code - used in cart
  const validateCoupon = async (code: string, cartTotal: number, userEmail?: string): Promise<{
    valid: boolean
    coupon?: Coupon
    error?: string
    discountAmount?: number
  }> => {
    try {
      const couponCode = code.toUpperCase().trim().replace(/\s+/g, '_')
      const couponRef = doc(db, "coupons", couponCode)
      const couponSnap = await getDoc(couponRef)
      
      console.log("Validating coupon:", couponCode, "exists:", couponSnap.exists())
      
      if (!couponSnap.exists()) {
        return { valid: false, error: "Invalid coupon code" }
      }
      
      const coupon = { id: couponSnap.id, ...couponSnap.data() } as Coupon
      console.log("Coupon data:", coupon)
      
      // Check if coupon is active
      if (!coupon.isActive) {
        return { valid: false, error: "This coupon is no longer active" }
      }
      
      // Check if coupon is restricted to specific emails
      if (coupon.allowedEmails && coupon.allowedEmails.length > 0) {
        console.log("Checking email restriction. User email:", userEmail, "Allowed:", coupon.allowedEmails)
        if (!userEmail) {
          return { valid: false, error: "Please sign in to use this coupon" }
        }
        const normalizedUserEmail = userEmail.toLowerCase().trim()
        const isAllowed = coupon.allowedEmails.some(email => email.toLowerCase().trim() === normalizedUserEmail)
        if (!isAllowed) {
          return { valid: false, error: "This coupon is not valid for your account" }
        }
        // Check if user already used this personalized coupon
        if (coupon.usedByEmails && coupon.usedByEmails.some(email => email.toLowerCase().trim() === normalizedUserEmail)) {
          return { valid: false, error: "You have already used this coupon" }
        }
        
        // For personalized comeback coupons, check if user has re-subscribed to newsletter
        if (coupon.isPersonalized) {
          const subscribersRef = collection(db, "newsletterSubscribers")
          const subQuery = query(subscribersRef, where("email", "==", normalizedUserEmail))
          const subSnapshot = await getDocs(subQuery)
          
          if (subSnapshot.empty) {
            return { valid: false, error: "Please subscribe to our newsletter first to use this coupon" }
          }
          console.log("User is subscribed to newsletter, coupon valid")
        }
      }
      
      // Check expiry date
      if (coupon.expiryDate) {
        const expiry = new Date(coupon.expiryDate)
        if (expiry < new Date()) {
          return { valid: false, error: "This coupon has expired" }
        }
      }
      
      // Check usage limit
      if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        return { valid: false, error: "This coupon has reached its usage limit" }
      }
      
      // Check minimum purchase
      if (coupon.minPurchase > 0 && cartTotal < coupon.minPurchase) {
        return { valid: false, error: `Minimum purchase of Rs.${coupon.minPurchase} required` }
      }
      
      // Calculate discount amount
      let discountAmount = 0
      if (coupon.discountType === "percentage") {
        discountAmount = (cartTotal * coupon.discountValue) / 100
        // Apply max discount limit if set
        if (coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount
        }
      } else {
        discountAmount = Math.min(coupon.discountValue, cartTotal)
      }
      
      return { valid: true, coupon, discountAmount }
    } catch (err: any) {
      console.error("Error validating coupon:", err)
      return { valid: false, error: "Error validating coupon" }
    }
  }

  // Increment usage count when coupon is used
  const useCoupon = async (code: string) => {
    try {
      const couponCode = code.toUpperCase().trim().replace(/\s+/g, '_')
      const couponRef = doc(db, "coupons", couponCode)
      const couponSnap = await getDoc(couponRef)
      
      if (couponSnap.exists()) {
        const currentCount = couponSnap.data().usedCount || 0
        await updateDoc(couponRef, {
          usedCount: currentCount + 1,
          updatedAt: serverTimestamp(),
        })
      }
      return { success: true }
    } catch (err: any) {
      console.error("Error incrementing coupon usage:", err)
      return { success: false, error: err.message }
    }
  }

  return {
    coupons,
    loading,
    error,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    validateCoupon,
    useCoupon,
  }
}
