import { useState, useEffect } from "react"
import { collection, query, onSnapshot, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, getDocs, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface SizeVariant {
  size: number
  price: number
  stock: number // Stock for this specific size
  onSale?: boolean
  saleType?: "percent" | "amount"
  saleValue?: number
  saleImageUrl?: string
  images?: string[]
}

export interface Product {
  id: string
  name: string
  brand: string
  category: string
  price: number
  size?: number
  sizeVariants?: SizeVariant[]
  stock: number
  description?: string
  imageUrl?: string
  images?: string[]
  status: "Active" | "Out of Stock"
  featured: boolean
  metaTitle?: string
  metaDescription?: string
  ogTitle?: string
  ogDescription?: string
  keywords?: string
  createdAt: Date
  updatedAt: Date
  altText?: string
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"))
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]
        setProducts(productsData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching products:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Generate unique product ID from name
  const generateProductId = async (productName: string, excludeId?: string): Promise<string> => {
    // Convert name to lowercase and replace spaces with underscores
    const baseId = productName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_+/g, '_') // Replace multiple underscores with single underscore
      .replace(/^_|_$/g, '') // Remove leading/trailing underscores

    // Check if ID exists (excluding the current product being updated)
    const productsSnapshot = await getDocs(collection(db, "products"))
    const existingIds = productsSnapshot.docs
      .map(doc => doc.id)
      .filter(id => id !== excludeId) // Exclude current product ID
    
    // If base ID doesn't exist, use it
    if (!existingIds.includes(baseId)) {
      return baseId
    }

    // If it exists, append number starting from 1
    let counter = 1
    let newId = `${baseId}_${counter}`
    
    while (existingIds.includes(newId)) {
      counter++
      newId = `${baseId}_${counter}`
    }
    
    return newId
  }

  const addProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Generate ID from product name
      const productId = await generateProductId(productData.name)
      
      // Use setDoc instead of addDoc to set custom ID
      await setDoc(doc(db, "products", productId), {
        ...productData,
        featured: productData.featured || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      
      return { success: true, id: productId }
    } catch (err: any) {
      console.error("Error adding product:", err)
      return { success: false, error: err.message }
    }
  }

  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    try {
      // Get current product data from Firebase (not from state)
      const productRef = doc(db, "products", productId)
      const productSnap = await getDoc(productRef)
      
      if (!productSnap.exists()) {
        return { success: false, error: "Product not found" }
      }
      
      const currentProduct = { id: productSnap.id, ...productSnap.data() } as Product
      
      // If name is being updated and it's different from current name
      if (productData.name && productData.name !== currentProduct.name) {
        // Generate new ID, excluding current product ID
        const newProductId = await generateProductId(productData.name, productId)
        
        // If the new ID is different from the current ID
        if (newProductId !== productId) {
          // Create new document with new ID
          await setDoc(doc(db, "products", newProductId), {
            ...currentProduct,
            ...productData,
            updatedAt: serverTimestamp(),
          })
          
          // Delete old document
          await deleteDoc(doc(db, "products", productId))
          
          return { success: true, id: newProductId, renamed: true }
        }
      }
      
      // Normal update if name didn't change or new ID is same as old ID
      await updateDoc(doc(db, "products", productId), {
        ...productData,
        updatedAt: serverTimestamp(),
      })
      
      return { success: true, id: productId }
    } catch (err: any) {
      console.error("Error updating product:", err)
      return { success: false, error: err.message }
    }
  }

  const deleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, "products", productId))
      return { success: true }
    } catch (err: any) {
      console.error("Error deleting product:", err)
      return { success: false, error: err.message }
    }
  }

  return { products, loading, error, addProduct, updateProduct, deleteProduct }
}