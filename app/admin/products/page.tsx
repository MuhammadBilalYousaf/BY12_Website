"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, Eye, AlertCircle, X, Star } from "lucide-react"
import { useProducts, Product } from "@/lib/hooks/use-products"
import ProductModal from "@/components/admin/product-modal"

export default function AdminProducts() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProducts()

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "All Categories" || product.category === categoryFilter
    const matchesStatus = statusFilter === "All Status" || product.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleAddProduct = () => {
    setModalMode("add")
    setSelectedProduct(null)
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setModalMode("edit")
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleSaveProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    if (modalMode === "add") {
      return await addProduct(productData)
    } else if (selectedProduct) {
      return await updateProduct(selectedProduct.id, productData)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (deleteConfirm === productId) {
      await deleteProduct(productId)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(productId)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-white font-semibold">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 text-red-400 mb-2">
            <AlertCircle size={24} />
            <h2 className="text-xl font-bold">Error Loading Products</h2>
          </div>
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Products Management</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} total
              {' • '}
              {products.filter(p => p.featured).length} featured
            </p>
          </div>
          <button
            onClick={handleAddProduct}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm sm:text-base"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {/* Search and Filters */}
        <div className="bg-slate-800 rounded-lg p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>All Categories</option>
                <option>Men</option>
                <option>Women</option>
                <option>Unisex</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products - Mobile Cards / Desktop Table */}
        {filteredProducts.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 sm:p-12 text-center">
            <p className="text-gray-400 text-base sm:text-lg mb-4">No products found</p>
            <button
              onClick={handleAddProduct}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm sm:text-base"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-slate-800 rounded-lg p-4 relative">
                  {product.featured && (
                    <div className="absolute top-3 right-3">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3 pr-6">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-400">{product.brand}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      product.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Category</p>
                      <p className="text-white">{product.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Price</p>
                      <p className="text-white font-semibold">Rs. {product.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Stock</p>
                      <p className={product.stock === 0 ? "text-red-400 font-semibold" : "text-white"}>
                        {product.stock}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 flex items-center justify-center gap-2 p-2 text-green-400 bg-green-500/10 hover:bg-green-500/20 rounded transition"
                    >
                      <Edit size={16} />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className={`flex-1 flex items-center justify-center gap-2 p-2 rounded transition ${
                        deleteConfirm === product.id
                          ? "bg-red-500 text-white"
                          : "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                      }`}
                    >
                      <Trash2 size={16} />
                      <span className="text-sm">
                        {deleteConfirm === product.id ? "Confirm" : "Delete"}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-slate-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Brand</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-700/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {product.featured && (
                              <Star size={14} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
                            )}
                            <p className="text-white font-semibold">{product.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-gray-300">{product.category}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-gray-300">{product.brand}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-white font-semibold">Rs. {product.price.toFixed(2)}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className={product.stock === 0 ? "text-red-400 font-semibold" : "text-gray-300"}>
                            {product.stock}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            product.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-2 text-green-400 hover:bg-green-500/10 rounded transition"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className={`p-2 rounded transition ${
                                deleteConfirm === product.id
                                  ? "bg-red-500 text-white"
                                  : "text-red-400 hover:bg-red-500/10"
                              }`}
                              title={deleteConfirm === product.id ? "Click again to confirm" : "Delete"}
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
            </div>
          </>
        )}
      </main>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={selectedProduct}
        mode={modalMode}
      />
    </div>
  )
}
