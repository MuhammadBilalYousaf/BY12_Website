import { useState, useEffect } from "react"
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Testimonial {
  id: string
  name: string
  email?: string
  role: string
  image: string // User avatar
  images?: string[] // Additional review images
  rating: number
  comment: string
  isApproved: boolean
  isFeatured: boolean // Featured testimonials appear first
  orderId?: string // Link to order if from customer review
  productId?: string // Link to reviewed product
  productName?: string
  source: "manual" | "review" | "import" // Where the testimonial came from
  verifiedPurchase?: boolean
  helpfulCount?: number
  createdAt: any
  updatedAt?: any
}

export function useTestimonials(onlyApproved: boolean = false) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Use simple query without composite index requirement
    const q = query(collection(db, "testimonials"), orderBy("createdAt", "desc"))
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let testimonialsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Testimonial[]
        
        // Filter client-side if only approved
        if (onlyApproved) {
          testimonialsData = testimonialsData.filter(t => t.isApproved === true)
        }
        
        // Sort featured testimonials first
        testimonialsData.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1
          if (!a.isFeatured && b.isFeatured) return 1
          return 0
        })
        
        setTestimonials(testimonialsData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching testimonials:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [onlyApproved])

  // Add new testimonial
  const addTestimonial = async (testimonialData: Omit<Testimonial, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newTestimonial = {
        ...testimonialData,
        source: testimonialData.source || "manual",
        isFeatured: testimonialData.isFeatured || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "testimonials"), newTestimonial)
      return { success: true, id: docRef.id }
    } catch (err: any) {
      console.error("Error adding testimonial:", err)
      return { success: false, error: err.message }
    }
  }

  // Update testimonial
  const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
    try {
      const docRef = doc(db, "testimonials", id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })
      return { success: true }
    } catch (err: any) {
      console.error("Error updating testimonial:", err)
      return { success: false, error: err.message }
    }
  }

  // Delete testimonial
  const deleteTestimonial = async (id: string) => {
    try {
      await deleteDoc(doc(db, "testimonials", id))
      return { success: true }
    } catch (err: any) {
      console.error("Error deleting testimonial:", err)
      return { success: false, error: err.message }
    }
  }

  // Toggle approval status
  const toggleApproval = async (id: string, currentStatus: boolean) => {
    return updateTestimonial(id, { isApproved: !currentStatus })
  }

  // Toggle featured status
  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    return updateTestimonial(id, { isFeatured: !currentStatus })
  }

  // Get featured testimonials
  const getFeaturedTestimonials = () => {
    return testimonials.filter(t => t.isFeatured && t.isApproved)
  }

  return {
    testimonials,
    loading,
    error,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleApproval,
    toggleFeatured,
    getFeaturedTestimonials,
  }
}
