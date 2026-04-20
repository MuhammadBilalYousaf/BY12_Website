"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Search, ShoppingCart, User, Heart, ChevronDown } from "lucide-react"
import { useAuth, useCart, useWishlist } from "@/lib/contexts"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import type { Deal, Product } from "@/lib/types"
import { toSlug } from "@/lib/utils"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [allDeals, setAllDeals] = useState<Deal[]>([])
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false)
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { itemCount } = useCart()
  const { wishlistCount } = useWishlist()
  const searchRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const shopMenuRef = useRef<HTMLDivElement>(null)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
        setSearchQuery("")
        setSearchResults([])
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (shopMenuRef.current && !shopMenuRef.current.contains(event.target as Node)) {
        setIsShopMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch searchable products and deals from database
  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const productsRef = collection(db, "products")
        const productsSnapshot = await getDocs(productsRef)
        const products = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]
        setAllProducts(products)

        const dealsRef = collection(db, "deals")
        const dealsSnapshot = await getDocs(dealsRef)
        const deals = dealsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Deal[]
        setAllDeals(deals)
      } catch (error) {
        console.error("Error fetching search data:", error)
      }
    }
    fetchSearchData()
  }, [])

  // Search products and deals from database
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const loweredQuery = searchQuery.toLowerCase()

      const filteredProducts = allProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )

      const now = new Date()
      const filteredDeals = allDeals
        .filter((deal) => {
          if (!deal.isActive) return false

          if (deal.endDate) {
            const endDate = deal.endDate?.toDate
              ? deal.endDate.toDate()
              : new Date(deal.endDate)

            if (endDate < now) return false
          }

          return (
            deal.title.toLowerCase().includes(loweredQuery) ||
            deal.description.toLowerCase().includes(loweredQuery) ||
            deal.badge?.toLowerCase().includes(loweredQuery) ||
            deal.includedItems?.some((item) => item.toLowerCase().includes(loweredQuery))
          )
        })
        .map((deal) => ({
          id: deal.id,
          name: deal.title,
          description: deal.description,
          brand: "BY12 Deals",
          category: "Deals",
          price: deal.dealPrice,
          originalPrice: deal.originalPrice,
          imageUrl: deal.imageUrl,
          images: deal.images,
          includedItems: deal.includedItems,
          isDeal: true,
          dealId: deal.id,
          inStock: true,
          status: "Active" as const,
        }))

      const filtered = [...filteredProducts, ...filteredDeals]

      setSearchResults(filtered.slice(0, 5))
    } else {
      setSearchResults([])
    }
  }, [searchQuery, allProducts, allDeals])

  const handleProductClick = (product: Product) => {
    if (product.isDeal) {
      const dealId = product.dealId || product.id
      router.push(`/deals/${toSlug(product.name) || dealId}`)
    } else {
      router.push(`/product/${product.id}`)
    }
    setIsSearchOpen(false)
    setSearchQuery("")
    setSearchResults([])
  }

  const handleCategoryClick = (category: string) => {
    setIsShopMenuOpen(false)
    if (category === "All") {
      router.push("/shop")
    } else {
      router.push(`/shop?category=${category}`)
    }
  }

  // Get user display name with fallback
  const getUserDisplayName = () => {
    if (!user) return ""
    return user.name || user.displayName || user.email || "User"
  }

  const shopCategories = ["All", "Men", "Women", "Unisex"]

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Image
              src="/logo.png"
              alt="BY12"
              width={80}
              height={80}
              priority
              className="rounded-lg"
            />
            <span
              className="text-2xl md:text-3xl font-extrabold tracking-widest bg-gradient-to-r from-white via-accent to-yellow-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
              style={{
                fontFamily: "'Orbitron', 'Montserrat', 'sans-serif'",
                letterSpacing: "0.15em"
              }}
            >
              
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Home Link */}
            <Link
              href="/"
              className={`font-medium transition ${
                pathname === "/" ? "text-accent" : "text-slate-300 hover:text-accent"
              }`}
            >
              Home
            </Link>

            {/* Shop Dropdown */}
            <div className="relative" ref={shopMenuRef}>
              <button
                onClick={() => setIsShopMenuOpen(!isShopMenuOpen)}
                className={`font-medium transition flex items-center gap-1 ${
                  pathname === "/shop" ? "text-accent" : "text-slate-300 hover:text-accent"
                }`}
              >
                Shop
                <ChevronDown size={16} className={`transition-transform ${isShopMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {isShopMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                  {shopCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-accent transition"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Blog Link */}
            <Link
              href="/blog"
              className={`font-medium transition ${
                pathname === "/blog" || pathname.startsWith("/blog/") ? "text-accent" : "text-slate-300 hover:text-accent"
              }`}
            >
              Blog
            </Link>

            <Link
              href="/deals"
              className={`font-medium transition ${
                pathname === "/deals" ? "text-accent" : "text-slate-300 hover:text-accent"
              }`}
            >
              Deals
            </Link>

            {/* Other Links */}
            <Link
              href="/about"
              className={`font-medium transition ${
                pathname === "/about" ? "text-accent" : "text-slate-300 hover:text-accent"
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`font-medium transition ${
                pathname === "/contact" ? "text-accent" : "text-slate-300 hover:text-accent"
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-slate-300 hover:text-accent hover:bg-slate-800/50 rounded-full transition"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Search Dropdown */}
              {isSearchOpen && (
                <div className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-20 md:top-auto md:mt-2 md:w-96 bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="p-4">
                    <input
                      type="text"
                      placeholder="Search products and deals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-slate-900/50 text-white placeholder:text-slate-500"
                      autoFocus
                    />
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="max-h-96 overflow-y-auto border-t border-slate-700">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="w-full p-3 hover:bg-slate-700/50 transition flex items-center gap-3 text-left"
                          aria-label={`View ${product.name}`}
                        >
                          <Image
                            src={product.imageUrl || "/placeholder.svg?height=60&width=60&query=perfume"}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{product.name}</p>
                            <p className="text-sm text-slate-400 truncate">
                              {product.category}{product.isDeal ? " • Deal" : ""}
                            </p>
                            <p className="text-sm font-semibold text-accent">Rs. {product.price.toFixed(2)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {searchQuery.trim().length > 0 && searchResults.length === 0 && (
                    <div className="p-6 text-center text-slate-400 border-t border-slate-700">
                      No products or deals found for "{searchQuery}"
                    </div>
                  )}

                  {/* View All Results */}
                  {searchResults.length > 0 && (
                    <div className="border-t border-slate-700 p-3">
                      <Link
                        href={`/shop`}
                        onClick={() => {
                          setIsSearchOpen(false)
                          setSearchQuery("")
                        }}
                        className="block text-center text-sm text-accent hover:text-accent/80 font-semibold"
                      >
                        View all results in Shop
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist with Badge */}
            <Link href="/wishlist" className="p-2 text-slate-300 hover:text-accent hover:bg-slate-800/50 rounded-full transition relative" aria-label="Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-red-500/30">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart with Badge */}
            <Link href="/cart" className="p-2 text-slate-300 hover:text-accent hover:bg-slate-800/50 rounded-full transition relative" aria-label="Cart">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-accent/30">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 text-slate-300 hover:text-accent hover:bg-slate-800/50 rounded-full transition"
                aria-label="User menu"
              >
                <User size={20} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-slate-700 bg-slate-900/50">
                        <p className="text-sm font-semibold text-white truncate">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-accent transition"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-accent transition"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={() => {
                          signOut()
                          setIsUserMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-700/50 transition border-t border-slate-700"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/sign-in"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-accent transition"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/sign-up"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-accent transition"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-slate-300 hover:text-accent hover:bg-slate-800/50 rounded-full transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-slate-800">
            {/* User Info (Mobile) */}
            {user && (
              <div className="px-4 py-3 bg-slate-800/50 rounded-xl mb-4 border border-slate-700">
                <p className="text-sm font-semibold text-white truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {user.email}
                </p>
              </div>
            )}

            {/* Home Link */}
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className={`block py-2 font-medium transition ${
                pathname === "/" ? "text-accent" : "text-slate-300 hover:text-accent"
              }`}
            >
              Home
            </Link>

            {/* Mobile Shop with Categories Dropdown */}
            <div className="py-2">
              <button
                onClick={() => setIsMobileShopOpen(!isMobileShopOpen)}
                className={`w-full flex items-center justify-between font-medium transition ${
                  pathname === "/shop" ? "text-accent" : "text-slate-300 hover:text-accent"
                }`}
              >
                <span>Shop</span>
                <ChevronDown size={18} className={`transition-transform ${isMobileShopOpen ? "rotate-180" : ""}`} />
              </button>
              {isMobileShopOpen && (
                <div className="pl-4 mt-2 space-y-2 border-l border-slate-700 ml-2">
                  {shopCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        handleCategoryClick(category)
                        setIsMenuOpen(false)
                        setIsMobileShopOpen(false)
                      }}
                      className="block py-1 text-sm text-slate-400 hover:text-accent transition"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Blog Link */}
            <Link
              href="/blog"
              onClick={() => setIsMenuOpen(false)}
              className={`block py-2 font-medium transition ${
                pathname === "/blog" || pathname.startsWith("/blog/") ? "text-accent" : "text-slate-300 hover:text-accent"
              }`}
            >
              Blog
            </Link>

            <Link
              href="/deals"
              onClick={() => setIsMenuOpen(false)}
              className={`block py-2 font-medium transition ${
                pathname === "/deals" ? "text-accent" : "text-slate-300 hover:text-accent"
              }`}
            >
              Deals
            </Link>

            {/* Other Links */}
            <Link
              href="/about"
              onClick={() => setIsMenuOpen(false)}
              className={`block py-2 font-medium transition ${
                pathname === "/about" ? "text-accent" : "text-slate-300 hover:text-accent"
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className={`block py-2 font-medium transition ${
                pathname === "/contact" ? "text-accent" : "text-slate-300 hover:text-accent"
              }`}
            >
              Contact
            </Link>

            {/* Mobile User Actions */}
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 font-medium text-slate-300 hover:text-accent transition"
                >
                  My Profile
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 font-medium text-slate-300 hover:text-accent transition"
                >
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    signOut()
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left py-2 font-medium text-red-400 hover:opacity-80 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 font-medium text-slate-300 hover:text-accent transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 font-medium text-slate-300 hover:text-accent transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
