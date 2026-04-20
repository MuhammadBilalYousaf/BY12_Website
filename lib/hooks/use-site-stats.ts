import { useState, useEffect } from "react"
import { collection, query, getCountFromServer, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface SiteStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
}

export function useSiteStats() {
  const [stats, setStats] = useState<SiteStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Count products
        const productsQuery = query(collection(db, "products"))
        const productsSnapshot = await getCountFromServer(productsQuery)
        const totalProducts = productsSnapshot.data().count

        // Count completed orders (representing happy customers)
        const ordersQuery = query(
          collection(db, "orders"),
          where("status", "==", "Completed")
        )
        const ordersSnapshot = await getCountFromServer(ordersQuery)
        const totalOrders = ordersSnapshot.data().count

        // Count total orders for customer count (unique emails would be better but this works)
        const allOrdersQuery = query(collection(db, "orders"))
        const allOrdersSnapshot = await getCountFromServer(allOrdersQuery)
        const totalCustomers = allOrdersSnapshot.data().count

        setStats({
          totalProducts,
          totalOrders,
          totalCustomers,
        })
        setLoading(false)
      } catch (err: any) {
        console.error("Error fetching site stats:", err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
  }
}
