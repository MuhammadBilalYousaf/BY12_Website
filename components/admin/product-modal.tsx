"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { X, Star, Wand2, Plus, Trash2, GripVertical, Image as ImageIcon } from "lucide-react"
import { Product } from "@/lib/hooks/use-products"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"
import RichTextEditor from "./rich-text-editor"

interface SizeVariant {
  size: number
  price: number
  stock?: number
  onSale?: boolean
  saleType?: "percent" | "amount"
  saleValue?: number
  saleImageUrl?: string
  images?: string[]
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => Promise<any>
  product?: Product | null
  mode: "add" | "edit"
}

export default function ProductModal({ isOpen, onClose, onSave, product, mode }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "Men",
    price: 0,
    size: 50,
    stock: 0,
    description: "",
    imageUrl: "",
    images: [] as string[],
    status: "Active" as "Active" | "Out of Stock",
    featured: false,
    metaTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    keywords: "",
    imageFiles: [] as File[],
    altText: "",
  })
  const [sizeVariants, setSizeVariants] = useState<SizeVariant[]>([{ size: 50, price: 0, stock: 0, onSale: false, saleType: "percent", saleValue: 0, saleImageUrl: "", images: [] }])
  const [variantImageInputs, setVariantImageInputs] = useState<string[]>([""])
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (product && mode === "edit") {
      // Build images array from existing data
      const existingImages: string[] = product.images && product.images.length > 0
        ? [...product.images]
        : product.imageUrl
          ? [product.imageUrl]
          : []
      setFormData({
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        size: product.size || 50,
        stock: product.stock,
        description: product.description || "",
        imageUrl: product.imageUrl || "",
        images: existingImages,
        status: product.status,
        featured: product.featured || false,
        metaTitle: product.metaTitle || "",
        metaDescription: product.metaDescription || "",
        ogTitle: product.ogTitle || "",
        ogDescription: product.ogDescription || "",
        keywords: product.keywords || "",
        altText: product.altText || "",
        imageFiles: [],
      })
      // Load size variants or create from single size/price
      if (product.sizeVariants && product.sizeVariants.length > 0) {
        const mappedVariants = product.sizeVariants.map((variant, index) => ({
            ...variant,
            onSale: variant.onSale ?? false,
            saleType: variant.saleType ?? "percent",
            saleValue: Number.isFinite(variant.saleValue) ? Math.trunc(variant.saleValue as number) : 0,
            saleImageUrl: variant.saleImageUrl ?? "",
            images: Array.isArray(variant.images)
              ? variant.images.filter((img): img is string => typeof img === "string" && img.trim().length > 0)
              : index === 0 && Array.isArray(product.images)
                ? product.images.filter((img): img is string => typeof img === "string" && img.trim().length > 0)
                : [],
          }))
        setSizeVariants(mappedVariants)
        setVariantImageInputs(new Array(mappedVariants.length).fill(""))
      } else {
        setSizeVariants([
          {
            size: product.size || 50,
            price: product.price,
            stock: product.stock || 0,
            onSale: false,
            saleType: "percent",
            saleValue: 0,
            saleImageUrl: "",
            images: Array.isArray(product.images) ? product.images : [],
          },
        ])
        setVariantImageInputs([""])
      }
    } else {
      setFormData({
        name: "",
        brand: "",
        category: "Men",
        price: 0,
        size: 50,
        stock: 0,
        description: "",
        imageUrl: "",
        images: [],
        status: "Active",
        featured: false,
        metaTitle: "",
        metaDescription: "",
        ogTitle: "",
        ogDescription: "",
        keywords: "",
        altText: "",
        imageFiles: [],
      })
      setSizeVariants([{ size: 50, price: 0, stock: 0, onSale: false, saleType: "percent", saleValue: 0, saleImageUrl: "", images: [] }])
      setVariantImageInputs([""])
    }
    setNewImageUrl("")
    setError("")
  }, [product, mode, isOpen])

  const handleGenerateDescription = async () => {
    if (!formData.name.trim()) {
      setError("Please enter a product name first")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.name,
          existingDescription: formData.description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate description")
      }

      const data = await response.json()
      setFormData({ 
        ...formData, 
        description: data.html,
        metaTitle: data.metaTitle || formData.name,
        metaDescription: data.metaDescription || "",
        ogTitle: data.ogTitle || formData.name,
        ogDescription: data.ogDescription || data.html?.substring(0, 160),
        keywords: data.keywords || "",
        altText: data.altText || "", // <-- add this line
      })
    } catch (err: any) {
      setError(err.message || "Failed to generate description")
      console.error("Generation error:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleImageFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const files = Array.from(e.target.files)
    setIsUploading(true)
    setUploadProgress(0)
    setError("")

    console.log(`📷 Starting upload of ${files.length} file(s) to Firebase Storage...`)
    console.log("📦 Storage bucket:", storage.app.options.storageBucket)

    try {
      const uploadedUrls: string[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileName = `products/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        console.log(`📤 Uploading file ${i + 1}/${files.length}: ${fileName} (${(file.size / 1024).toFixed(1)} KB)`)
        
        const storageRef = ref(storage, fileName)
        
        // Use uploadBytesResumable for progress tracking
        const url = await new Promise<string>((resolve, reject) => {
          const uploadTask = uploadBytesResumable(storageRef, file)
          
          // Timeout after 60 seconds
          const timeout = setTimeout(() => {
            uploadTask.cancel()
            reject(new Error("Upload timed out after 60 seconds. Check Firebase Storage is enabled and rules allow writes."))
          }, 60000)
          
          uploadTask.on('state_changed',
            (snapshot) => {
              const fileProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              const totalProgress = ((i + fileProgress / 100) / files.length) * 100
              setUploadProgress(Math.round(totalProgress))
              console.log(`📊 Upload progress: ${fileProgress.toFixed(0)}% (${snapshot.state})`)
            },
            (error) => {
              clearTimeout(timeout)
              console.error("❌ Upload error:", error.code, error.message)
              
              let userMessage = "Upload failed: "
              switch (error.code) {
                case 'storage/unauthorized':
                  userMessage += "Permission denied. Firebase Storage security rules need to allow writes. Go to Firebase Console → Storage → Rules and set: allow read, write: if true;"
                  break
                case 'storage/canceled':
                  userMessage += "Upload was cancelled or timed out."
                  break
                case 'storage/retry-limit-exceeded':
                  userMessage += "Upload failed after retries. Check your internet connection."
                  break
                case 'storage/bucket-not-found':
                  userMessage += "Storage bucket not found. Enable Firebase Storage in Firebase Console."
                  break
                default:
                  userMessage += error.message || error.code
              }
              reject(new Error(userMessage))
            },
            async () => {
              clearTimeout(timeout)
              try {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
                console.log(`✅ Upload complete! URL: ${downloadUrl.substring(0, 80)}...`)
                resolve(downloadUrl)
              } catch (urlError: any) {
                console.error("❌ Failed to get download URL:", urlError)
                reject(new Error("Upload succeeded but failed to get URL: " + urlError.message))
              }
            }
          )
        })
        
        uploadedUrls.push(url)
      }
      
      console.log(`✅ All ${uploadedUrls.length} images uploaded successfully!`)
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
        imageUrl: prev.images.length === 0 ? uploadedUrls[0] : prev.imageUrl,
      }))
    } catch (err: any) {
      console.error("❌ Image upload failed:", err)
      setError(err.message || "Failed to upload image(s)")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleAddImageUrl = () => {
    const url = newImageUrl.trim()
    if (!url) return
    if (formData.images.includes(url)) {
      setError("This image URL already exists")
      return
    }
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, url],
      imageUrl: prev.images.length === 0 ? url : prev.imageUrl,
    }))
    setNewImageUrl("")
    setError("")
  }

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index)
      return {
        ...prev,
        images: newImages,
        imageUrl: newImages.length > 0 ? newImages[0] : "",
      }
    })
  }

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= formData.images.length) return
    setFormData(prev => {
      const newImages = [...prev.images]
      const [moved] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, moved)
      return {
        ...prev,
        images: newImages,
        imageUrl: newImages[0] || "",
      }
    })
  }

  const handleGenerateAltText = async () => {
    if (!formData.name.trim()) {
      setError("Please enter a product name first")
      return
    }
    setIsGenerating(true)
    setError("")
    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.name,
          type: "altText"
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate alt text")
      }
      const data = await response.json()
      setFormData({ ...formData, altText: data.altText || "" })
    } catch (err: any) {
      setError(err.message || "Failed to generate alt text")
      console.error("Alt text generation error:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSaving(true)

    // Validate size variants - ensure all have size, price, and stock >= 0
    const validVariants = sizeVariants
      .filter((v) => v.size > 0 && v.price > 0 && (v.stock ?? 0) >= 0)
      .map((v) => {
        const rawSaleValue = Math.trunc(Number(v.saleValue ?? 0))
        const saleValue = Math.max(0, rawSaleValue)
        const onSale = Boolean(v.onSale) && saleValue > 0
        const saleType = v.saleType ?? "percent"
        const saleImageUrl = typeof v.saleImageUrl === "string" ? v.saleImageUrl.trim() : ""
        const images = Array.isArray(v.images)
          ? v.images.filter((img): img is string => typeof img === "string" && img.trim().length > 0)
          : []

        return {
          size: v.size,
          price: v.price,
          stock: v.stock ?? 0,
          onSale,
          saleType,
          saleValue: onSale ? saleValue : 0,
          saleImageUrl: onSale ? saleImageUrl : "",
          images,
        }
      })
    if (validVariants.length === 0) {
      setError("Please add at least one size variant with valid size, price, and stock")
      setIsSaving(false)
      return
    }

    if (!formData.name || !formData.brand) {
      setError("Please fill in all required fields")
      setIsSaving(false)
      return
    }

    // Use the first variant's price as the base price for backward compatibility
    const basePrice = validVariants[0].price
    const baseSize = validVariants[0].size
    const baseVariantImages = validVariants[0].images ?? []
    
    // Calculate total stock from all variants
    const totalStock = validVariants.reduce((sum, v) => sum + v.stock, 0)

    // Convert stock number to inStock boolean for consistency
    const productData = {
      ...formData,
      price: basePrice,
      size: baseSize,
      stock: totalStock,
      sizeVariants: validVariants,
      inStock: totalStock > 0,
      imageUrl: baseVariantImages[0] || "",
      images: baseVariantImages,
    }

    console.log("💾 Saving product with sizeVariants:", productData.sizeVariants)
    console.log("📊 Total stock:", totalStock)

    const result = await onSave(productData)
    
    if (result.success) {
      onClose()
    } else {
      setError(result.error || "Failed to save product")
    }
    
    setIsSaving(false)
  }

  const handleSizeVariantChange = (index: number, field: keyof SizeVariant, value: any) => {
    setSizeVariants((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleVariantImageInputChange = (index: number, value: string) => {
    setVariantImageInputs((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleAddVariantImage = (index: number) => {
    const url = (variantImageInputs[index] || "").trim()
    if (!url) return

    setSizeVariants((prev) => {
      const next = [...prev]
      const currentImages = next[index].images ?? []
      if (currentImages.includes(url)) {
        return next
      }
      next[index] = {
        ...next[index],
        images: [...currentImages, url],
      }
      return next
    })

    setVariantImageInputs((prev) => {
      const next = [...prev]
      next[index] = ""
      return next
    })
  }

  const handleRemoveVariantImage = (variantIndex: number, imageIndex: number) => {
    setSizeVariants((prev) => {
      const next = [...prev]
      const currentImages = next[variantIndex].images ?? []
      next[variantIndex] = {
        ...next[variantIndex],
        images: currentImages.filter((_, idx) => idx !== imageIndex),
      }
      return next
    })
  }

  const handleMoveVariantImage = (variantIndex: number, fromIndex: number, toIndex: number) => {
    setSizeVariants((prev) => {
      const next = [...prev]
      const currentImages = [...(next[variantIndex].images ?? [])]
      if (toIndex < 0 || toIndex >= currentImages.length) return next

      const [moved] = currentImages.splice(fromIndex, 1)
      currentImages.splice(toIndex, 0, moved)

      next[variantIndex] = {
        ...next[variantIndex],
        images: currentImages,
      }
      return next
    })
  }

  const renderSizeVariants = () => (
    sizeVariants.map((variant, index) => (
      <div key={index} className="flex gap-4">
        <input
          type="number"
          value={variant.size}
          onChange={(e) => handleSizeVariantChange(index, "size", parseInt(e.target.value, 10))}
          placeholder="Size (ml)"
        />
        <input
          type="number"
          value={variant.price}
          onChange={(e) => handleSizeVariantChange(index, "price", parseInt(e.target.value, 10))}
          placeholder="Price"
        />
        <input
          type="number"
          value={variant.stock}
          onChange={(e) => handleSizeVariantChange(index, "stock", parseInt(e.target.value, 10))}
          placeholder="Stock"
        />
        <select
          value={variant.saleType}
          onChange={(e) => handleSizeVariantChange(index, "saleType", e.target.value)}
        >
          <option value="percent">Percent</option>
          <option value="amount">Amount</option>
        </select>
        <input
          type="number"
          value={variant.saleValue}
          onChange={(e) => handleSizeVariantChange(index, "saleValue", parseInt(e.target.value, 10))}
          placeholder="Sale Value"
        />
        <button onClick={() => handleSizeVariantChange(index, "onSale", !variant.onSale)}>
          {variant.onSale ? "Remove Sale" : "Add Sale"}
        </button>
      </div>
    ))
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {mode === "add" ? "Add New Product" : "Edit Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Brand *
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>Men</option>
                <option>Women</option>
                <option>Unisex</option>
              </select>
            </div>

            {/* Size Variants Section */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-300">
                  Size Variants (ml), Prices (Rs.) & Stock *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSizeVariants([
                      ...sizeVariants,
                      { size: 0, price: 0, stock: 0, onSale: false, saleType: "percent", saleValue: 0, saleImageUrl: "", images: [] },
                    ])
                    setVariantImageInputs((prev) => [...prev, ""])
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                >
                  <Plus size={16} />
                  Add Size
                </button>
              </div>
              <div className="space-y-3">
                {sizeVariants.map((variant, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Size (ml)</label>
                      <input
                        type="number"
                        value={variant.size || ''}
                        onChange={(e) => {
                          const newVariants = [...sizeVariants]
                          newVariants[index].size = parseInt(e.target.value) || 0
                          setSizeVariants(newVariants)
                        }}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="1"
                        placeholder="e.g. 50"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Price (Rs.)</label>
                      <input
                        type="number"
                        value={variant.price || ''}
                        onChange={(e) => {
                          const newVariants = [...sizeVariants]
                          newVariants[index].price = parseFloat(e.target.value) || 0
                          setSizeVariants(newVariants)
                        }}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 2500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Stock</label>
                      <input
                        type="number"
                        value={variant.stock || ''}
                        onChange={(e) => {
                          const newVariants = [...sizeVariants]
                          newVariants[index].stock = parseInt(e.target.value) || 0
                          setSizeVariants(newVariants)
                        }}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="0"
                        placeholder="e.g. 10"
                      />
                    </div>
                    <div className="flex-[1.2]">
                      <label className="block text-xs text-gray-400 mb-1">Sale</label>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          id={`sale-toggle-${index}`}
                          type="checkbox"
                          checked={Boolean(variant.onSale)}
                          onChange={(e) => handleSizeVariantChange(index, "onSale", e.target.checked)}
                          className="h-4 w-4 rounded border-slate-600 text-purple-500 focus:ring-purple-500"
                        />
                        <label htmlFor={`sale-toggle-${index}`} className="text-xs text-gray-300">
                          On Sale
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={variant.saleType ?? "percent"}
                          onChange={(e) => handleSizeVariantChange(index, "saleType", e.target.value)}
                          disabled={!variant.onSale}
                          className="w-24 px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        >
                          <option value="percent">Percent</option>
                          <option value="amount">Amount</option>
                        </select>
                        <input
                          type="number"
                          value={variant.saleValue ?? 0}
                          onChange={(e) => handleSizeVariantChange(index, "saleValue", parseInt(e.target.value, 10) || 0)}
                          placeholder="Value"
                          min="0"
                          step="1"
                          disabled={!variant.onSale}
                          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        />
                      </div>
                      <input
                        type="url"
                        value={variant.saleImageUrl ?? ""}
                        onChange={(e) => handleSizeVariantChange(index, "saleImageUrl", e.target.value)}
                        placeholder="Sale image URL (optional)"
                        disabled={!variant.onSale}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      />

                      <div className="mt-2 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={variantImageInputs[index] ?? ""}
                            onChange={(e) => handleVariantImageInputChange(index, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                handleAddVariantImage(index)
                              }
                            }}
                            placeholder="Variant image URL"
                            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddVariantImage(index)}
                            className="px-2 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs"
                          >
                            Add
                          </button>
                        </div>

                        {(variant.images?.length ?? 0) > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {variant.images?.map((img, imgIndex) => (
                              <div key={`${img}-${imgIndex}`} className="relative rounded border border-slate-600 overflow-hidden bg-slate-800">
                                <div className="aspect-square relative">
                                  <Image
                                    src={img}
                                    alt={`Variant ${variant.size}ml image ${imgIndex + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="absolute inset-x-0 bottom-0 bg-black/60 flex items-center justify-center gap-1 py-1">
                                  {imgIndex > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleMoveVariantImage(index, imgIndex, imgIndex - 1)}
                                      className="px-1 py-0.5 text-[10px] bg-slate-700 text-white rounded"
                                    >
                                      ←
                                    </button>
                                  )}
                                  {imgIndex < (variant.images?.length ?? 0) - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleMoveVariantImage(index, imgIndex, imgIndex + 1)}
                                      className="px-1 py-0.5 text-[10px] bg-slate-700 text-white rounded"
                                    >
                                      →
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVariantImage(index, imgIndex)}
                                    className="px-1 py-0.5 text-[10px] bg-red-600 text-white rounded"
                                  >
                                    X
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {sizeVariants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newVariants = sizeVariants.filter((_, i) => i !== index)
                          setSizeVariants(newVariants)
                          setVariantImageInputs((prev) => prev.filter((_, i) => i !== index))
                        }}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition mt-5"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Add multiple sizes with different prices and stock levels. The first size will be the default.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Out of Stock" })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>Active</option>
                <option>Out of Stock</option>
              </select>
            </div>

            {/* Multiple Images Section */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-300">
                  Product Images
                </label>
                <span className="text-xs text-gray-400">
                  {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} • First image is primary
                </span>
              </div>

              {/* Current Images Grid */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                  {formData.images.map((url, index) => (
                    <div
                      key={index}
                      className={`relative group rounded-lg overflow-hidden border-2 ${
                        index === 0 ? 'border-purple-500' : 'border-slate-600'
                      } bg-slate-700`}
                    >
                      <div className="aspect-square relative">
                        <Image
                          src={url}
                          alt={`Product image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                          Primary
                        </div>
                      )}
                      {/* Overlay Controls */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveImage(index, index - 1)}
                            className="p-1.5 bg-slate-700 text-white rounded hover:bg-slate-600 transition text-xs"
                            title="Move left"
                          >
                            ←
                          </button>
                        )}
                        {index < formData.images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveImage(index, index + 1)}
                            className="p-1.5 bg-slate-700 text-white rounded hover:bg-slate-600 transition text-xs"
                            title="Move right"
                          >
                            →
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
                          title="Remove image"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Image by URL */}
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl() } }}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="Paste image URL and click Add..."
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium flex items-center gap-1"
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              {/* Upload Images */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isUploading
                      ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                      : 'bg-slate-700 border border-slate-600 text-white hover:bg-slate-600'
                  }`}
                >
                  <ImageIcon size={16} />
                  {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Images'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFilesChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-500">
                  Upload multiple images or add URLs. Drag to reorder.
                </p>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Description
                </label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating || !formData.name.trim()}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition ${
                    isGenerating || !formData.name.trim()
                      ? 'bg-slate-600 text-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  <Wand2 size={16} />
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </button>
              </div>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Write a detailed product description..."
                rows={6}
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Alt Text (for image)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAltText}
                  disabled={isGenerating || !formData.name.trim()}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition ${
                    isGenerating || !formData.name.trim()
                      ? 'bg-slate-600 text-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  <Wand2 size={16} />
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </button>
              </div>
              <input
                type="text"
                value={formData.altText}
                onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe the image for accessibility"
              />
            </div>

            {/* SEO & Meta Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-4">SEO & Meta Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Leave empty to use product name"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-400 mt-1">{formData.metaTitle.length}/60 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Meta Description
                  </label>
                  <RichTextEditor
                    value={formData.metaDescription}
                    onChange={(value) => setFormData({ ...formData, metaDescription: value })}
                    placeholder="Brief description for search engines..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-400 mt-1">Recommended: 150-160 characters for best SEO results</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="perfume, fragrance, luxury, men"
                  />
                  <p className="text-xs text-gray-400 mt-1">Comma-separated keywords</p>
                </div>
              </div>
            </div>

            {/* Open Graph Settings */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-4">Open Graph Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    OG Title
                  </label>
                  <input
                    type="text"
                    value={formData.ogTitle}
                    onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Title for social media sharing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    OG Description
                  </label>
                  <RichTextEditor
                    value={formData.ogDescription}
                    onChange={(value) => setFormData({ ...formData, ogDescription: value })}
                    placeholder="Description for social media sharing..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Featured Toggle */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${formData.featured ? 'bg-yellow-500/20' : 'bg-slate-600'}`}>
                    <Star 
                      size={20} 
                      className={formData.featured ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'} 
                    />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Featured Product</p>
                    <p className="text-sm text-gray-400">
                      Display this product on the home page
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.featured ? 'bg-purple-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.featured ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : mode === "add" ? "Add Product" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


