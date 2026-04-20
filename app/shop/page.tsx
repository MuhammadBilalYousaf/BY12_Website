"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"
import ProductCard from "@/components/product-card"
import Footer from "@/components/footer"
import PageBreadcrumb from "@/components/page-breadcrumb"
import type { Product } from "@/lib/types"
import { ChevronDown, SlidersHorizontal, X } from "lucide-react"
import { collection, query, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { FadeInSection } from "@/components/animated-section"

function ShopContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "All")
  const [sortBy, setSortBy] = useState<string>("featured")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000])
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, 500000])
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const MIN_PRICE = 0
  const MAX_PRICE = 500000

  // Fetch products from Firebase
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"))
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]
        setAllProducts(productsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching products:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Update selected category when URL parameter changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [categoryParam])

  useEffect(() => {
    let filtered = [...allProducts]

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    // Price range filter
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    )

    // Sort products
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else if (sortBy === "featured") {
      // Sort featured items first
      filtered.sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return 0
      })
    }

    setProducts(filtered)
  }, [allProducts, selectedCategory, sortBy, priceRange])

  const categories = ["All", "Men", "Women", "Unisex"]

  const handlePriceChange = (index: number, value: number) => {
    const newRange: [number, number] = [...tempPriceRange]
    newRange[index] = value
    
    if (index === 0 && value > tempPriceRange[1]) {
      newRange[1] = value
    } else if (index === 1 && value < tempPriceRange[0]) {
      newRange[0] = value
    }
    
    setTempPriceRange(newRange)
  }

  const applyPriceFilter = () => {
    setPriceRange(tempPriceRange)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <PageBreadcrumb 
            items={[
              { label: "Shop" }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="relative py-16 md:py-20 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <FadeInSection className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent">
                  Collection
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300">Discover our complete range of luxury fragrances</p>
            </FadeInSection>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          {/* Mobile Filter Controls */}
          <div className="flex gap-3 mb-6 lg:hidden">
            {/* Category Dropdown - Mobile */}
            <div className="relative flex-1">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white"
              >
                <span>{selectedCategory}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCategoryOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-xl overflow-hidden z-40">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat)
                        setIsCategoryOpen(false)
                      }}
                      className={`w-full text-left px-4 py-3 transition-all duration-300 ${
                        selectedCategory === cat
                          ? "bg-accent text-slate-900 font-semibold"
                          : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Button - Mobile */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white hover:bg-slate-700/50 transition"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filter</span>
            </button>
          </div>

          {/* Mobile Filter Drawer */}
          {isFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-slate-900 border-l border-slate-700 overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Filters</h3>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="p-2 text-slate-400 hover:text-white transition"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Price Range Filter - Mobile */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Price Range</h4>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm">
                        <span className="text-slate-400">Min: </span>
                        <span className="font-semibold text-white">Rs. {tempPriceRange[0]}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-400">Max: </span>
                        <span className="font-semibold text-white">Rs. {tempPriceRange[1]}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Minimum</label>
                        <input
                          type="range"
                          min={MIN_PRICE}
                          max={MAX_PRICE}
                          step={10}
                          value={tempPriceRange[0]}
                          onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Maximum</label>
                        <input
                          type="range"
                          min={MIN_PRICE}
                          max={MAX_PRICE}
                          step={10}
                          value={tempPriceRange[1]}
                          onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        applyPriceFilter()
                        setIsFilterOpen(false)
                      }}
                      className="w-full bg-accent text-slate-900 py-3 rounded-xl hover:bg-accent/90 transition-all duration-300 font-semibold text-sm shadow-lg shadow-accent/20"
                    >
                      Apply Filter
                    </button>

                    {(priceRange[0] !== MIN_PRICE || priceRange[1] !== MAX_PRICE) && (
                      <button
                        onClick={() => {
                          setPriceRange([MIN_PRICE, MAX_PRICE])
                          setTempPriceRange([MIN_PRICE, MAX_PRICE])
                        }}
                        className="w-full mt-2 text-sm text-slate-400 hover:text-white transition"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Filters (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-1">
              <div 
                className="p-6 rounded-2xl sticky top-24"
                style={{
                  background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Category Filter */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Category</h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                          selectedCategory === cat
                            ? "bg-accent text-slate-900 font-semibold shadow-lg shadow-accent/25"
                            : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Price Range</h3>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm">
                      <span className="text-slate-400">Min: </span>
                      <span className="font-semibold text-white">Rs. {tempPriceRange[0]}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-400">Max: </span>
                      <span className="font-semibold text-white">Rs. {tempPriceRange[1]}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Minimum</label>
                      <input
                        type="range"
                        min={MIN_PRICE}
                        max={MAX_PRICE}
                        step={10}
                        value={tempPriceRange[0]}
                        onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Maximum</label>
                      <input
                        type="range"
                        min={MIN_PRICE}
                        max={MAX_PRICE}
                        step={10}
                        value={tempPriceRange[1]}
                        onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                    </div>
                  </div>

                  <button
                    onClick={applyPriceFilter}
                    className="w-full bg-accent text-slate-900 py-3 rounded-xl hover:bg-accent/90 transition-all duration-300 font-semibold text-sm shadow-lg shadow-accent/20"
                  >
                    Apply Filter
                  </button>

                  {(priceRange[0] !== MIN_PRICE || priceRange[1] !== MAX_PRICE) && (
                    <button
                      onClick={() => {
                        setPriceRange([MIN_PRICE, MAX_PRICE])
                        setTempPriceRange([MIN_PRICE, MAX_PRICE])
                      }}
                      className="w-full mt-2 text-sm text-slate-400 hover:text-white transition"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
                <p className="text-slate-300 font-medium">
                  {loading ? (
                    "Loading products..."
                  ) : (
                    <>
                      Showing <span className="font-bold text-white">{products.length}</span> products
                    </>
                  )}
                </p>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 pr-10"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
                  <p className="mt-4 text-slate-400">Loading products...</p>
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div 
                  className="text-center py-16 rounded-2xl"
                  style={{
                    background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.3) 0%, rgba(30, 41, 59, 0.3) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <p className="text-slate-400 text-lg">No products found matching your filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  )
}
function ShopLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent />
    </Suspense>
  )
}