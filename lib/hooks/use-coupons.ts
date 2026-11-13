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
      
      console.log("🔍 [VALIDATE] Starting coupon validation")
      console.log("🔍 [VALIDATE] Input code:", code)
      console.log("🔍 [VALIDATE] Normalized code:", couponCode)
      console.log("🔍 [VALIDATE] User email:", userEmail)
      console.log("🔍 [VALIDATE] Cart total:", cartTotal)
      
      const couponRef = doc(db, "coupons", couponCode)
      console.log("🔍 [VALIDATE] Looking up document: coupons/" + couponCode)
      
      const couponSnap = await getDoc(couponRef)
      console.log("🔍 [VALIDATE] Document exists:", couponSnap.exists())
      
      if (!couponSnap.exists()) {
        console.log("❌ [VALIDATE] Document not found for code:", couponCode)
        return { valid: false, error: "Invalid coupon code" }
      }
      
      const coupon = { id: couponSnap.id, ...couponSnap.data() } as Coupon
      console.log("✅ [VALIDATE] Coupon found:", coupon.code, "| Data:", JSON.stringify(coupon))
      
      // Check if coupon is active
      if (!coupon.isActive) {
        return { valid: false, error: "This coupon is no longer active" }
      }
      
      // Check if coupon is restricted to specific emails
      if (coupon.allowedEmails && coupon.allowedEmails.length > 0) {
        console.log("🔍 [VALIDATE] Coupon has email restrictions")
        console.log("🔍 [VALIDATE] Allowed emails:", coupon.allowedEmails)
        console.log("🔍 [VALIDATE] User email:", userEmail)
        
        if (!userEmail) {
          console.log("❌ [VALIDATE] User not signed in")
          return { valid: false, error: "Please sign in to use this coupon" }
        }
        
        const normalizedUserEmail = userEmail.toLowerCase().trim()
        const isAllowed = coupon.allowedEmails.some(email => email.toLowerCase().trim() === normalizedUserEmail)
        console.log("🔍 [VALIDATE] Normalized user email:", normalizedUserEmail)
        console.log("🔍 [VALIDATE] Is email allowed:", isAllowed)
        
        if (!isAllowed) {
          console.log("❌ [VALIDATE] User email not in allowed list")
          return { valid: false, error: "This coupon is not valid for your account" }
        }
        // Check if user already used this personalized coupon
        if (coupon.usedByEmails && coupon.usedByEmails.some(email => email.toLowerCase().trim() === normalizedUserEmail)) {
          console.log("❌ [VALIDATE] User already used this coupon")
          return { valid: false, error: "You have already used this coupon" }
        }
        
        // For personalized comeback coupons, check if user has subscribed to newsletter
        if (coupon.isPersonalized) {
          console.log("🔍 [VALIDATE] Coupon is personalized, checking newsletter subscription")
          const subscribersRef = collection(db, "newsletterSubscribers")
          const subQuery = query(subscribersRef, where("email", "==", normalizedUserEmail))
          const subSnapshot = await getDocs(subQuery)
          
          if (subSnapshot.empty) {
            console.log("❌ [VALIDATE] User is not subscribed to newsletter")
            return { valid: false, error: "Please subscribe to our newsletter first to use this coupon" }
          }
          console.log("✅ [VALIDATE] User is subscribed to newsletter, coupon valid")
        }
      }
      
      // Check expiry date
      if (coupon.expiryDate) {
        const expiry = new Date(coupon.expiryDate)
        console.log("🔍 [VALIDATE] Checking expiry. Expiry date:", coupon.expiryDate, "| Current date:", new Date().toISOString())
        if (expiry < new Date()) {
          console.log("❌ [VALIDATE] Coupon has expired")
          return { valid: false, error: "This coupon has expired" }
        }
      }
      
      // Check usage limit
      if (coupon.usageLimit > 0) {
        console.log("🔍 [VALIDATE] Checking usage limit. Used:", coupon.usedCount, "| Limit:", coupon.usageLimit)
        if (coupon.usedCount >= coupon.usageLimit) {
          console.log("❌ [VALIDATE] Usage limit reached")
          return { valid: false, error: "This coupon has reached its usage limit" }
        }
      }
      
      // Check minimum purchase
      if (coupon.minPurchase > 0 && cartTotal < coupon.minPurchase) {
        console.log("❌ [VALIDATE] Cart total below minimum purchase requirement")
        return { valid: false, error: `Minimum purchase of Rs.${coupon.minPurchase} required` }
      }
      
      // Calculate discount amount
      let discountAmount = 0
      console.log("✅ [VALIDATE] All validations passed!")
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
  const useCoupon = async (code: string, userEmail?: string) => {
    try {
      const couponCode = code.toUpperCase().trim().replace(/\s+/g, '_')
      console.log("💳 [USE_COUPON] Starting coupon usage tracking")
      console.log("💳 [USE_COUPON] Coupon code:", couponCode)
      console.log("💳 [USE_COUPON] User email:", userEmail)
      
      const couponRef = doc(db, "coupons", couponCode)
      const couponSnap = await getDoc(couponRef)
      
      if (couponSnap.exists()) {
        console.log("💳 [USE_COUPON] Coupon found, updating usage")
        const couponData = couponSnap.data()
        const currentCount = couponData.usedCount || 0
        const usedByEmails = couponData.usedByEmails || []
        
        // Track email if this is a personalized coupon and email is provided
        const updatedUsedByEmails = userEmail && couponData.isPersonalized 
          ? [...usedByEmails, userEmail.toLowerCase()]
          : usedByEmails
        
        console.log("💳 [USE_COUPON] Current usage count:", currentCount)
        console.log("💳 [USE_COUPON] Updated usage count:", currentCount + 1)
        console.log("💳 [USE_COUPON] Updated used by emails:", updatedUsedByEmails)
        
        await updateDoc(couponRef, {
          usedCount: currentCount + 1,
          usedByEmails: updatedUsedByEmails,
          updatedAt: serverTimestamp(),
        })
        
        console.log("✅ [USE_COUPON] Coupon usage successfully updated")
      } else {
        console.log("❌ [USE_COUPON] Coupon not found for code:", couponCode)
      }
      return { success: true }
    } catch (err: any) {
      console.error("❌ [USE_COUPON] Error incrementing coupon usage:", err)
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
