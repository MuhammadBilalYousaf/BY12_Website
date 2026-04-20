"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/contexts"
import type { Order } from "./use-orders"

export interface UserAddress {
  id: string
  label: string // "Home", "Work", "Other"
  firstName: string
  lastName: string
  phone: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

export interface UserProfile {
  id: string
  email: string
  name: string
  displayName?: string
  phone?: string
  avatar?: string
  dateOfBirth?: string
  gender?: "male" | "female" | "other" | "prefer-not-to-say"
  addresses: UserAddress[]
  createdAt: any
  updatedAt?: any
}

export function useUserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)

  // Fetch user profile
  useEffect(() => {
    if (!user?.id) {
      setProfile(null)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setProfile({
            id: user.id,
            email: user.email,
            name: data.name || user.name || "",
            displayName: data.displayName || user.displayName,
            phone: data.phone || "",
            avatar: data.avatar || "",
            dateOfBirth: data.dateOfBirth || "",
            gender: data.gender,
            addresses: data.addresses || [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          })
        } else {
          // Create initial profile if doesn't exist
          const newProfile: Partial<UserProfile> = {
            email: user.email,
            name: user.name || "",
            addresses: [],
            createdAt: serverTimestamp(),
          }
          await setDoc(docRef, newProfile)
          setProfile({
            id: user.id,
            email: user.email,
            name: user.name || "",
            addresses: [],
            createdAt: new Date(),
          })
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  // Fetch user orders
  useEffect(() => {
    if (!user?.email) {
      setOrders([])
      setOrdersLoading(false)
      return
    }

    // Query orders by customer email
    // Note: This compound query requires a Firestore index on (customerEmail, createdAt)
    // If index doesn't exist, we fall back to a simpler query
    const fetchOrders = async () => {
      try {
        // First try with compound query (requires index)
        const q = query(
          collection(db, "orders"),
          where("customerEmail", "==", user.email),
          orderBy("createdAt", "desc")
        )

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const ordersData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Order[]
            setOrders(ordersData)
            setOrdersLoading(false)
          },
          async (error) => {
            console.error("Error fetching user orders with compound query:", error)
            
            // Fallback: Query without orderBy, sort client-side
            try {
              const simpleQ = query(
                collection(db, "orders"),
                where("customerEmail", "==", user.email)
              )
              
              const unsubSimple = onSnapshot(simpleQ, (snapshot) => {
                const ordersData = snapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                })) as Order[]
                
                // Sort client-side by createdAt descending
                ordersData.sort((a, b) => {
                  const dateA = a.createdAt?.toDate?.() || new Date(0)
                  const dateB = b.createdAt?.toDate?.() || new Date(0)
                  return dateB.getTime() - dateA.getTime()
                })
                
                setOrders(ordersData)
                setOrdersLoading(false)
              })
              
              return () => unsubSimple()
            } catch (fallbackError) {
              console.error("Fallback query also failed:", fallbackError)
              setOrdersLoading(false)
            }
          }
        )

        return () => unsubscribe()
      } catch (error) {
        console.error("Error setting up orders listener:", error)
        setOrdersLoading(false)
      }
    }

    fetchOrders()
  }, [user?.email])

  // Update profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user?.id) return { success: false, error: "Not authenticated" }

    try {
      const docRef = doc(db, "users", user.id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })

      setProfile((prev) => prev ? { ...prev, ...data } : null)
      return { success: true }
    } catch (error: any) {
      console.error("Error updating profile:", error)
      return { success: false, error: error.message }
    }
  }

  // Add address
  const addAddress = async (address: Omit<UserAddress, "id">) => {
    if (!user?.id || !profile) return { success: false, error: "Not authenticated" }

    try {
      const newAddress: UserAddress = {
        ...address,
        id: `addr_${Date.now()}`,
      }

      // If this is default, remove default from others
      let updatedAddresses = [...profile.addresses]
      if (address.isDefault) {
        updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }))
      }
      updatedAddresses.push(newAddress)

      await updateDoc(doc(db, "users", user.id), {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp(),
      })

      setProfile((prev) => prev ? { ...prev, addresses: updatedAddresses } : null)
      return { success: true }
    } catch (error: any) {
      console.error("Error adding address:", error)
      return { success: false, error: error.message }
    }
  }

  // Update address
  const updateAddress = async (addressId: string, data: Partial<UserAddress>) => {
    if (!user?.id || !profile) return { success: false, error: "Not authenticated" }

    try {
      let updatedAddresses = profile.addresses.map((addr) =>
        addr.id === addressId ? { ...addr, ...data } : addr
      )

      // If setting as default, remove default from others
      if (data.isDefault) {
        updatedAddresses = updatedAddresses.map((a) =>
          a.id === addressId ? a : { ...a, isDefault: false }
        )
      }

      await updateDoc(doc(db, "users", user.id), {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp(),
      })

      setProfile((prev) => prev ? { ...prev, addresses: updatedAddresses } : null)
      return { success: true }
    } catch (error: any) {
      console.error("Error updating address:", error)
      return { success: false, error: error.message }
    }
  }

  // Delete address
  const deleteAddress = async (addressId: string) => {
    if (!user?.id || !profile) return { success: false, error: "Not authenticated" }

    try {
      const updatedAddresses = profile.addresses.filter((a) => a.id !== addressId)

      await updateDoc(doc(db, "users", user.id), {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp(),
      })

      setProfile((prev) => prev ? { ...prev, addresses: updatedAddresses } : null)
      return { success: true }
    } catch (error: any) {
      console.error("Error deleting address:", error)
      return { success: false, error: error.message }
    }
  }

  // Get order statistics
  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "Pending").length,
      processing: orders.filter((o) => o.status === "Processing").length,
      completed: orders.filter((o) => o.status === "Completed").length,
      cancelled: orders.filter((o) => o.status === "Cancelled").length,
      totalSpent: orders
        .filter((o) => o.status === "Completed")
        .reduce((sum, o) => sum + o.total, 0),
    }
  }

  return {
    profile,
    orders,
    loading,
    ordersLoading,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    getOrderStats,
  }
}
