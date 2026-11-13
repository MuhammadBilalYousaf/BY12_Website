"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product } from "@/lib/types"
import { Plus, Edit, Trash2, AlertCircle, X, Check } from "lucide-react"

export default function AdminTesters() {
  const [testers, setTesters] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [selectedTester, setSelectedTester] = useState<Product | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "Unisex",
    price: 0,
    quantity: 100,
    testerSize: 5,
    description: "",
    imageUrl: "",
  })

  // Fetch testers from Firebase
  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("isTester", "==", true)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const testersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]
        setTesters(testersData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching testers:", error)
        setError("Failed to load testers")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const filteredTesters = testers.filter((tester) =>
    tester.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tester.brand.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenAddModal = () => {
    setModalMode("add")
    setSelectedTester(null)
    setFormData({
      name: "",
      brand: "",
      category: "Unisex",
      price: 0,
      quantity: 100,
      testerSize: 5,
      description: "",
      imageUrl: "",
    })
    setIsModalOpen(true)
  }

  const handleEditTester = (tester: Product) => {
    setModalMode("edit")
    setSelectedTester(tester)
    setFormData({
      name: tester.name,
      brand: tester.brand,
      category: tester.category,
      price: tester.price || 0,
      quantity: tester.testerQuantity || 100,
      testerSize: tester.testerSize || 5,
      description: tester.description || "",
      imageUrl: tester.imageUrl || "",
    })
    setIsModalOpen(true)
  }

  const generateTesterId = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .substring(0, 50)
  }

  const handleSaveTester = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccessMsg("")

    try {
      if (!formData.name || !formData.brand) {
        setError("Product name and brand are required")
        setIsSaving(false)
        return
      }

      if (modalMode === "add") {
        // Create new tester
        const testerId = generateTesterId(formData.name)
        
        const newTester: any = {
          name: formData.name,
          brand: formData.brand,
          category: formData.category,
          price: parseFloat(formData.price.toString()),
          stock: parseInt(formData.quantity.toString()),
          testerQuantity: parseInt(formData.quantity.toString()),
          testerSize: parseInt(formData.testerSize.toString()),
          isTester: true,
          description: formData.description,
          imageUrl: formData.imageUrl,
          images: formData.imageUrl ? [formData.imageUrl] : [],
          status: "Active",
          featured: false,
          inStock: parseInt(formData.quantity.toString()) > 0,
          sizeVariants: [
            {
              size: 5,
              price: parseFloat(formData.price.toString()),
              stock: parseInt(formData.quantity.toString()),
            }
          ],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }

        await setDoc(doc(db, "products", testerId), newTester)
        setSuccessMsg("Tester added successfully! ✅")
        
      } else if (selectedTester) {
        // Update existing tester
        await updateDoc(doc(db, "products", selectedTester.id), {
          name: formData.name,
          brand: formData.brand,
          category: formData.category,
          price: parseFloat(formData.price.toString()),
          stock: parseInt(formData.quantity.toString()),
          testerQuantity: parseInt(formData.quantity.toString()),
          testerSize: parseInt(formData.testerSize.toString()),
          description: formData.description,
          imageUrl: formData.imageUrl,
          images: formData.imageUrl ? [formData.imageUrl] : [],
          inStock: parseInt(formData.quantity.toString()) > 0,
          updatedAt: serverTimestamp(),
        })
        setSuccessMsg("Tester updated successfully! ✅")
      }

      setTimeout(() => {
        setIsModalOpen(false)
        setSelectedTester(null)
      }, 1500)

    } catch (err) {
      console.error("Error saving tester:", err)
      setError(err instanceof Error ? err.message : "Failed to save tester")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTester = async (testerId: string) => {
    if (deleteConfirm === testerId) {
      try {
        await deleteDoc(doc(db, "products", testerId))
        setDeleteConfirm(null)
        setSuccessMsg("Tester deleted successfully! ✅")
      } catch (error) {
        console.error("Error deleting tester:", error)
        setError("Failed to delete tester")
      }
    } else {
      setDeleteConfirm(testerId)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-white font-semibold">Loading testers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Tester Products</h1>
            <p className="text-slate-400 text-sm mt-2">Manage fragrance tester samples</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-6 py-2 bg-accent text-black rounded-lg font-semibold hover:bg-accent/90 transition whitespace-nowrap"
          >
            <Plus size={20} />
            Add New Tester
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            💡 Click "Add New Tester" to create a new fragrance sample product directly. Configure name, brand, quantity, and price.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search testers by name or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-accent transition"
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Testers Table */}
        {filteredTesters.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">Brand</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">Stock</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">Price</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">Size</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTesters.map((tester) => (
                  <tr key={tester.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-white">{tester.name}</td>
                    <td className="px-4 py-3 text-slate-300">{tester.brand}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        (tester.testerQuantity || 0) > 0
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}>
                        {tester.testerQuantity || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {tester.price ? `PKR ${tester.price.toLocaleString()}` : "Free"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{tester.testerSize || 5}ml</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTester(tester)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteTester(tester.id)}
                          className={`p-2 rounded-lg transition ${
                            deleteConfirm === tester.id
                              ? "bg-red-500/30 text-red-300"
                              : "text-red-400 hover:bg-red-500/20"
                          }`}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg mb-4">🎁 No testers available yet</p>
            <p className="text-slate-500 text-sm mb-6">
              Get started by creating your first tester product
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-block px-6 py-2 bg-accent text-black rounded-lg font-semibold hover:bg-accent/90 transition"
            >
              Create First Tester
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="fixed bottom-6 right-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3 max-w-sm">
            <Check size={20} className="text-green-400" />
            <p className="text-green-300">{successMsg}</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-2xl w-full my-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {modalMode === "add" ? "🎁 Add New Tester" : "✏️ Edit Tester"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X size={24} />
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-400" />
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleSaveTester} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Product Name * 
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={modalMode === "edit"}
                      className={`w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-accent transition ${
                        modalMode === "edit" ? "cursor-not-allowed opacity-60" : ""
                      }`}
                      placeholder="e.g., Rose Elegance Tester"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Brand *
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-accent transition"
                      placeholder="e.g., BY12"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-accent transition"
                    >
                      <option>Men</option>
                      <option>Women</option>
                      <option>Unisex</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Price (PKR) - 0 for Free
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-accent transition"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Available Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-accent transition"
                      placeholder="e.g., 100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Tester Size (ml)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.testerSize}
                      onChange={(e) => setFormData({ ...formData, testerSize: parseInt(e.target.value) || 5 })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-accent transition"
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Product Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-accent transition"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-accent transition resize-none"
                    placeholder="Describe the fragrance..."
                  />
                </div>

                <div className="flex gap-3 pt-6 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-accent text-black rounded-lg font-semibold hover:bg-accent/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        {modalMode === "add" ? "Add Tester" : "Save Changes"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
