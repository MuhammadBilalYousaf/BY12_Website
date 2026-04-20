import { useState, useEffect } from "react"
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, updateDoc, doc, getDoc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
  brand?: string
  selectedSize?: number // Size in ml
  selectedPrice?: number // Price for the selected size
}

export interface Order {
  id: string
  orderId: string
  userId?: string // Optional for guest orders
  customerName: string
  customerEmail: string
  customerPhone?: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: "Pending" | "Processing" | "Shipped" | "Completed" | "Cancelled"
  paymentMethod: string
  createdAt: any
  updatedAt?: any
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"))
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[]
        setOrders(ordersData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching orders:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Generate unique order ID
  const generateOrderId = () => {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `ORD-${timestamp}-${random}`
  }

  // Create new order
  const createOrder = async (orderData: Omit<Order, "id" | "orderId" | "createdAt" | "updatedAt" | "status">) => {
    try {
      const orderId = generateOrderId()
      
      const newOrder = {
        ...orderData,
        orderId,
        status: "Pending" as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      console.log("Creating order:", newOrder) // Debug log

      const docRef = await addDoc(collection(db, "orders"), newOrder)
      
      console.log("Order created successfully:", docRef.id) // Debug log

      // Decrement stock for each product in the order
      console.log("📦 Updating product stock levels...")
      for (const item of orderData.items) {
        try {
          console.log(`🔍 Processing item: ${item.name}, selectedSize: ${item.selectedSize}, quantity: ${item.quantity}`)
          
          const productRef = doc(db, "products", item.id)
          const productSnap = await getDoc(productRef)
          
          if (productSnap.exists()) {
            const productData = productSnap.data()
            const sizeVariants = productData.sizeVariants || []
            
            console.log(`📋 Product has ${sizeVariants.length} size variants:`, sizeVariants)
            
            // Check if this product has size variants and a size was selected
            if (sizeVariants.length > 0 && item.selectedSize !== undefined && item.selectedSize !== null) {
              // Update stock for the specific size variant
              let foundVariant = false
              const updatedVariants = sizeVariants.map((variant: { size: number; price: number; stock: number }) => {
                // Compare as numbers to handle type mismatches
                if (Number(variant.size) === Number(item.selectedSize)) {
                  foundVariant = true
                  const newStock = Math.max(0, (variant.stock || 0) - item.quantity)
                  console.log(`✅ Matched size ${item.selectedSize}ml: stock ${variant.stock} → ${newStock}`)
                  return { ...variant, stock: newStock }
                }
                return variant
              })
              
              if (!foundVariant) {
                console.log(`⚠️ No matching variant found for size ${item.selectedSize}ml`)
              }
              
              // Calculate total stock from all variants
              const totalStock = updatedVariants.reduce((sum: number, v: { stock: number }) => sum + (v.stock || 0), 0)
              
              console.log(`📊 New total stock: ${totalStock}`)
              
              await updateDoc(productRef, {
                sizeVariants: updatedVariants,
                stock: totalStock,
                inStock: totalStock > 0,
                status: totalStock > 0 ? "Active" : "Out of Stock",
                updatedAt: serverTimestamp(),
              })
              
              console.log(`✅ Stock updated successfully for ${item.name}`)
            } else {
              console.log(`⚠️ No size variants or no selectedSize, using fallback stock update`)
              // Fallback: Update overall stock for products without size variants
              const currentStock = productData.stock || 0
              const newStock = Math.max(0, currentStock - item.quantity)
              
              await updateDoc(productRef, {
                stock: newStock,
                inStock: newStock > 0,
                status: newStock > 0 ? "Active" : "Out of Stock",
                updatedAt: serverTimestamp(),
              })
              
              console.log(`✅ Updated stock for ${item.name}: ${currentStock} → ${newStock}`)
            }
          } else {
            console.log(`❌ Product not found: ${item.id}`)
          }
        } catch (stockError) {
          console.error(`Failed to update stock for product ${item.id}:`, stockError)
          // Continue with other products even if one fails
        }
      }
      
      return { success: true, orderId, id: docRef.id }
    } catch (err: any) {
      console.error("Error creating order:", err)
      return { success: false, error: err.message }
    }
  }

  // Update order status and send email notification
  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      // Find the order to get customer details
      const order = orders.find(o => o.id === orderId)
      
      // Check if order is being cancelled - restore stock
      if (order && status === "Cancelled" && order.status !== "Cancelled") {
        console.log("📦 Restoring stock for cancelled order...")
        for (const item of order.items) {
          try {
            console.log(`🔄 Restoring item: ${item.name}, selectedSize: ${item.selectedSize}, quantity: ${item.quantity}`)
            
            const productRef = doc(db, "products", item.id)
            const productSnap = await getDoc(productRef)
            
            if (productSnap.exists()) {
              const productData = productSnap.data()
              const sizeVariants = productData.sizeVariants || []
              
              // Check if this product has size variants and a size was selected
              if (sizeVariants.length > 0 && item.selectedSize !== undefined && item.selectedSize !== null) {
                // Restore stock for the specific size variant
                const updatedVariants = sizeVariants.map((variant: { size: number; price: number; stock: number }) => {
                  if (Number(variant.size) === Number(item.selectedSize)) {
                    const newStock = (variant.stock || 0) + item.quantity
                    console.log(`✅ Restored stock for ${item.name} (${item.selectedSize}ml): ${variant.stock} → ${newStock}`)
                    return { ...variant, stock: newStock }
                  }
                  return variant
                })
                
                // Calculate total stock from all variants
                const totalStock = updatedVariants.reduce((sum: number, v: { stock: number }) => sum + (v.stock || 0), 0)
                
                await updateDoc(productRef, {
                  sizeVariants: updatedVariants,
                  stock: totalStock,
                  inStock: totalStock > 0,
                  status: totalStock > 0 ? "Active" : "Out of Stock",
                  updatedAt: serverTimestamp(),
                })
                
                console.log(`📊 New total stock after restore: ${totalStock}`)
              } else {
                // Fallback: Restore overall stock for products without size variants
                const currentStock = productData.stock || 0
                const newStock = currentStock + item.quantity
                
                await updateDoc(productRef, {
                  stock: newStock,
                  inStock: true,
                  status: "Active",
                  updatedAt: serverTimestamp(),
                })
                
                console.log(`✅ Restored stock for ${item.name}: ${currentStock} → ${newStock}`)
              }
            }
          } catch (stockError) {
            console.error(`Failed to restore stock for product ${item.id}:`, stockError)
          }
        }
      }
      
      await updateDoc(doc(db, "orders", orderId), {
        status,
        updatedAt: serverTimestamp(),
      })

      // Send email notification for status changes (except Pending)
      if (order && status !== "Pending") {
        try {
          await fetch("/api/order-status-update", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: order.orderId,
              customerName: order.customerName,
              customerEmail: order.customerEmail,
              newStatus: status,
              items: order.items,
              total: order.total,
              shippingAddress: order.shippingAddress,
            }),
          })
          console.log(`✅ Status update email sent for order ${order.orderId} - Status: ${status}`)
        } catch (emailError) {
          console.error("Failed to send status update email:", emailError)
          // Don't fail the status update if email fails
        }
      }

      return { success: true }
    } catch (err: any) {
      console.error("Error updating order:", err)
      return { success: false, error: err.message }
    }
  }

  // Get order statistics
  const getOrderStats = () => {
    return {
      pending: orders.filter(o => o.status === "Pending").length,
      processing: orders.filter(o => o.status === "Processing").length,
      shipped: orders.filter(o => o.status === "Shipped").length,
      completed: orders.filter(o => o.status === "Completed").length,
      cancelled: orders.filter(o => o.status === "Cancelled").length,
      totalRevenue: orders
        .filter(o => o.status === "Completed")
        .reduce((sum, order) => sum + order.total, 0),
    }
  }

  return { 
    orders, 
    loading, 
    error, 
    createOrder, 
    updateOrderStatus,
    getOrderStats 
  }
}