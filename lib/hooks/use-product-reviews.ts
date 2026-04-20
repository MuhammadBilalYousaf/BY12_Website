import { useState, useEffect } from "react"
import { collection, query, onSnapshot, orderBy, where, addDoc, updateDoc, doc, serverTimestamp, getDocs, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface ProductReview {
  id: string
  productId: string
  productName: string
  name: string
  email?: string
  role: string
  image: string // User avatar
  images: string[] // Review images (product photos)
  rating: number
  title?: string // Review title/headline
  comment: string
  pros?: string[] // What they liked
  cons?: string[] // What they didn't like
  isApproved: boolean
  isVerifiedPurchase: boolean // Verified they bought the product
  isFeatured: boolean // Admin can feature this review
  helpfulCount: number // Number of helpful votes
  helpfulVotes?: string[] // User IDs who voted helpful
  orderId?: string
  adminResponse?: string // Admin can respond to reviews
  adminResponseDate?: any
  createdAt: any
  updatedAt?: any
}

export function useProductReviews(productId?: string) {
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 })

  useEffect(() => {
    if (!productId) {
      setLoading(false)
      return
    }

    // Query reviews for this specific product (without orderBy to avoid composite index requirement)
    const q = query(
      collection(db, "productReviews"),
      where("productId", "==", productId)
    )
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reviewsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ProductReview[]
        
        // Only show approved reviews
        const approvedReviews = reviewsData.filter(r => r.isApproved)
        
        // Sort client-side by createdAt descending
        approvedReviews.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0)
          const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0)
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        })
        
        setReviews(approvedReviews)
        
        // Calculate stats from approved reviews
        if (approvedReviews.length > 0) {
          const total = approvedReviews.reduce((sum, r) => sum + r.rating, 0)
          setStats({
            averageRating: total / approvedReviews.length,
            totalReviews: approvedReviews.length
          })
        } else {
          setStats({ averageRating: 0, totalReviews: 0 })
        }
        
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching product reviews:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [productId])

  // Add new product review
  const addReview = async (reviewData: Omit<ProductReview, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newReview = {
        ...reviewData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "productReviews"), newReview)
      return { success: true, id: docRef.id }
    } catch (err: any) {
      console.error("Error adding product review:", err)
      return { success: false, error: err.message }
    }
  }

  // Check if user has already reviewed this product from a specific order
  const hasReviewedProduct = async (orderId: string, productId: string) => {
    try {
      const q = query(
        collection(db, "productReviews"),
        where("orderId", "==", orderId),
        where("productId", "==", productId)
      )
      const snapshot = await getDocs(q)
      return !snapshot.empty
    } catch (err) {
      console.error("Error checking existing review:", err)
      return false
    }
  }

  // Vote review as helpful
  const voteHelpful = async (reviewId: string, visitorId: string) => {
    try {
      const reviewRef = doc(db, "productReviews", reviewId)
      await updateDoc(reviewRef, {
        helpfulCount: increment(1),
        helpfulVotes: [...(reviews.find(r => r.id === reviewId)?.helpfulVotes || []), visitorId],
        updatedAt: serverTimestamp(),
      })
      return { success: true }
    } catch (err: any) {
      console.error("Error voting helpful:", err)
      return { success: false, error: err.message }
    }
  }

  // Get rating distribution for the product
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating as keyof typeof distribution]++
      }
    })
    return distribution
  }

  return {
    reviews,
    loading,
    error,
    stats,
    addReview,
    hasReviewedProduct,
    voteHelpful,
    getRatingDistribution,
  }
}

// Hook to get all reviews by a specific user email
export function useUserReviews(userEmail?: string) {
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userEmail) {
      setReviews([])
      setLoading(false)
      return
    }

    // Use simple query without orderBy to avoid needing composite index
    // Sort client-side instead
    const q = query(
      collection(db, "productReviews"),
      where("email", "==", userEmail)
    )
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reviewsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ProductReview[]
        
        // Sort client-side by createdAt descending
        reviewsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0)
          const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0)
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        })
        
        setReviews(reviewsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching user reviews:", error)
        setReviews([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userEmail])

  return { reviews, loading }
}

// Hook to get product review stats for product cards
// export function useProductReviewStats(productId?: string) {
//   const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 })
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     if (!productId) {
//       setLoading(false)
//       return
//     }

//     const q = query(
//       collection(db, "productReviews"),
//       where("productId", "==", productId),
//       where("isApproved", "==", true)
//     )
    
//     const unsubscribe = onSnapshot(
//       q,
//       (snapshot) => {
//         const reviewsData = snapshot.docs.map((doc) => doc.data())
        
//         if (reviewsData.length > 0) {
//           const total = reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0)
//           setStats({
//             averageRating: total / reviewsData.length,
//             totalReviews: reviewsData.length
//           })
//         } else {
//           setStats({ averageRating: 0, totalReviews: 0 })
//         }
        
//         setLoading(false)
//       },
//       (err) => {
//         console.error("Error fetching product review stats:", err)
//         setLoading(false)
//       }
//     )

//     return () => unsubscribe()
//   }, [productId])

//   return { stats, loading }
// }
