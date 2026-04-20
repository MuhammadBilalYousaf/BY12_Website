import { useEffect, useState } from "react"
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Deal } from "@/lib/types"

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, "deals"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const dealsData = snapshot.docs.map((dealDoc) => ({
          id: dealDoc.id,
          ...dealDoc.data(),
        })) as Deal[]

        setDeals(dealsData)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error("Error fetching deals:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const addDeal = async (dealData: Omit<Deal, "id" | "createdAt" | "updatedAt">) => {
    try {
      const docRef = await addDoc(collection(db, "deals"), {
        ...dealData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return { success: true, id: docRef.id }
    } catch (err: any) {
      console.error("Error adding deal:", err)
      return { success: false, error: err.message }
    }
  }

  const updateDeal = async (dealId: string, dealData: Partial<Deal>) => {
    try {
      await updateDoc(doc(db, "deals", dealId), {
        ...dealData,
        updatedAt: serverTimestamp(),
      })

      return { success: true }
    } catch (err: any) {
      console.error("Error updating deal:", err)
      return { success: false, error: err.message }
    }
  }

  const deleteDeal = async (dealId: string) => {
    try {
      await deleteDoc(doc(db, "deals", dealId))
      return { success: true }
    } catch (err: any) {
      console.error("Error deleting deal:", err)
      return { success: false, error: err.message }
    }
  }

  const toggleDealStatus = async (dealId: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, "deals", dealId), {
        isActive,
        updatedAt: serverTimestamp(),
      })

      return { success: true }
    } catch (err: any) {
      console.error("Error toggling deal status:", err)
      return { success: false, error: err.message }
    }
  }

  return {
    deals,
    loading,
    error,
    addDeal,
    updateDeal,
    deleteDeal,
    toggleDealStatus,
  }
}
