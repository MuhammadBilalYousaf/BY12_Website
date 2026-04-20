import { useState, useEffect } from "react"
import { collection, query, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  createdAt: any
  role: string
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"))
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const customersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Customer[]
        // Filter out admin users
        const regularCustomers = customersData.filter(c => c.role !== "admin")
        setCustomers(regularCustomers)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching customers:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { customers, loading, error }
}