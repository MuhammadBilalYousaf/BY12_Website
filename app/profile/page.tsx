"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Settings, 
  Star, 
  LogOut, 
  Edit2, 
  Plus, 
  Trash2, 
  ChevronRight,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Camera,
  Save,
  X,
  BookHeart
} from "lucide-react"
import { useAuth, useWishlist } from "@/lib/contexts"
import { useUserProfile, UserAddress } from "@/lib/hooks/use-user-profile"
import { useUserReviews } from "@/lib/hooks/use-product-reviews"
import { useLikedBlogs } from "@/lib/hooks/use-liked-blogs"
import type { Product } from "@/lib/types"

type TabType = "overview" | "orders" | "wishlist" | "addresses" | "reviews" | "liked-articles" | "settings"

export default function ProfilePage() {
  const router = useRouter()
  const { user, signOut, loading: authLoading } = useAuth()
  const { profile, orders, loading, ordersLoading, updateProfile, addAddress, updateAddress, deleteAddress, getOrderStats } = useUserProfile()
  const { wishlist, removeItem } = useWishlist()
  const { reviews: userReviews, loading: reviewsLoading } = useUserReviews(user?.email)
  const { likedBlogs, likedCount, unlikeBlog, loading: likedBlogsLoading } = useLikedBlogs()
  
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null)
  const [saving, setSaving] = useState(false)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "" as "" | "male" | "female" | "other" | "prefer-not-to-say",
  })

  // Address form state
  const [addressForm, setAddressForm] = useState<Omit<UserAddress, "id">>({
    label: "Home",
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Pakistan",
    isDefault: false,
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in?redirect=/profile")
    }
  }, [user, authLoading, router])

  // Initialize profile form
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || "",
        phone: profile.phone || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
      })
    }
  }, [profile])

  const orderStats = getOrderStats()

  const handleSaveProfile = async () => {
    setSaving(true)
    const dataToSave = {
      ...profileForm,
      gender: profileForm.gender || undefined,
    }
    await updateProfile(dataToSave)
    setSaving(false)
    setIsEditingProfile(false)
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (editingAddress) {
      await updateAddress(editingAddress.id, addressForm)
    } else {
      await addAddress(addressForm)
    }

    setSaving(false)
    setIsAddressModalOpen(false)
    setEditingAddress(null)
    setAddressForm({
      label: "Home",
      firstName: "",
      lastName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Pakistan",
      isDefault: false,
    })
  }

  const openEditAddress = (address: UserAddress) => {
    setEditingAddress(address)
    setAddressForm(address)
    setIsAddressModalOpen(true)
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      await deleteAddress(addressId)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-yellow-400 bg-yellow-400/10"
      case "Processing":
        return "text-blue-400 bg-blue-400/10"
      case "Completed":
        return "text-green-400 bg-green-400/10"
      case "Cancelled":
        return "text-red-400 bg-red-400/10"
      default:
        return "text-gray-400 bg-gray-400/10"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock size={14} />
      case "Processing":
        return <Truck size={14} />
      case "Completed":
        return <CheckCircle size={14} />
      case "Cancelled":
        return <XCircle size={14} />
      default:
        return <Package size={14} />
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: User },
    { id: "orders" as TabType, label: "Orders", icon: Package, count: orders.length },
    { id: "wishlist" as TabType, label: "Wishlist", icon: Heart, count: wishlist.length },
    { id: "liked-articles" as TabType, label: "Liked Articles", icon: BookHeart, count: likedCount },
    { id: "addresses" as TabType, label: "Addresses", icon: MapPin, count: profile?.addresses?.length || 0 },
    { id: "reviews" as TabType, label: "My Reviews", icon: Star, count: userReviews.length },
    { id: "settings" as TabType, label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                {profile?.avatar ? (
                  <Image src={profile.avatar} alt={profile.name} fill className="rounded-full object-cover" />
                ) : (
                  (profile?.name || user.email)?.[0]?.toUpperCase() || "U"
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-slate-800 rounded-full border border-slate-700 hover:bg-slate-700 transition">
                <Camera size={14} className="text-gray-400" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{profile?.name || user.name || "User"}</h1>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {profile?.createdAt?.toDate?.()?.toLocaleDateString() || new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{orderStats.total}</p>
                <p className="text-sm text-gray-400">Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{wishlist.length}</p>
                <p className="text-sm text-gray-400">Wishlist</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{likedCount}</p>
                <p className="text-sm text-gray-400">Liked</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{userReviews.length}</p>
                <p className="text-sm text-gray-400">Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden sticky top-24">
              <nav className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
                      activeTab === tab.id
                        ? "bg-purple-500/20 text-purple-400"
                        : "text-gray-300 hover:bg-slate-700/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon size={18} />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-gray-300">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
                
                <hr className="my-2 border-slate-700" />
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <ShoppingBag size={20} className="text-purple-400" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{orderStats.total}</p>
                    <p className="text-sm text-gray-400">Total Orders</p>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <CheckCircle size={20} className="text-green-400" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{orderStats.completed}</p>
                    <p className="text-sm text-gray-400">Completed</p>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-pink-500/20 rounded-lg">
                        <Heart size={20} className="text-pink-400" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{wishlist.length}</p>
                    <p className="text-sm text-gray-400">Wishlist Items</p>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-rose-500/20 rounded-lg">
                        <BookHeart size={20} className="text-rose-400" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{likedCount}</p>
                    <p className="text-sm text-gray-400">Liked Articles</p>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Star size={20} className="text-yellow-400" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{userReviews.length}</p>
                    <p className="text-sm text-gray-400">Reviews</p>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white">Personal Information</h2>
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition"
                    >
                      <Edit2 size={16} />
                      {isEditingProfile ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  {isEditingProfile ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={profileForm.dateOfBirth}
                            onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Gender</label>
                          <select
                            value={profileForm.gender}
                            onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value as any })}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                      >
                        <Save size={16} />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-400">Full Name</p>
                        <p className="text-white font-medium">{profile?.name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="text-white font-medium">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Phone</p>
                        <p className="text-white font-medium">{profile?.phone || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Date of Birth</p>
                        <p className="text-white font-medium">{profile?.dateOfBirth || "—"}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent Orders */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Recent Orders</h2>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-sm text-purple-400 hover:text-purple-300 transition flex items-center gap-1"
                    >
                      View All <ChevronRight size={16} />
                    </button>
                  </div>

                  {ordersLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package size={48} className="text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No orders yet</p>
                      <Link href="/shop" className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block">
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                              <Package size={20} className="text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{order.orderId}</p>
                              <p className="text-sm text-gray-400">
                                {order.items?.length || 0} items • Rs. {order.total?.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <h2 className="text-lg font-bold text-white mb-6">My Orders</h2>

                {ordersLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={64} className="text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
                    <p className="text-gray-400 mb-4">When you place orders, they'll appear here</p>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      <ShoppingBag size={18} />
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-slate-700 rounded-xl overflow-hidden"
                      >
                        {/* Order Header */}
                        <div className="bg-slate-700/30 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-semibold text-white">{order.orderId}</p>
                              <p className="text-sm text-gray-400">
                                {order.createdAt?.toDate?.()?.toLocaleDateString() || "—"}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>

                        {/* Order Items */}
                        <div className="p-4">
                          <div className="space-y-3">
                            {order.items?.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4">
                                <Image
                                  src={item.imageUrl || "/placeholder.svg?height=60&width=60"}
                                  alt={item.name}
                                  width={56}
                                  height={56}
                                  className="object-cover rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-white truncate">{item.name}</p>
                                  <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-white font-medium">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            ))}
                            {(order.items?.length || 0) > 2 && (
                              <p className="text-sm text-gray-400">+{order.items.length - 2} more items</p>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                            <p className="text-gray-400">Total</p>
                            <p className="text-lg font-bold text-white">Rs. {order.total?.toFixed(2)}</p>
                          </div>

                          <div className="flex gap-3 mt-4">
                            <Link
                              href={`/track-order?orderId=${order.orderId}&email=${encodeURIComponent(order.customerEmail || user?.email || "")}`}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition"
                            >
                              <Eye size={16} />
                              Track Order
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <h2 className="text-lg font-bold text-white mb-6">My Wishlist</h2>

                {wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart size={64} className="text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Wishlist is empty</h3>
                    <p className="text-gray-400 mb-4">Save items you love for later</p>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      <ShoppingBag size={18} />
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((product) => (
                      <div
                        key={product.id}
                        className="bg-slate-700/30 rounded-xl overflow-hidden border border-slate-700 group"
                      >
                        <Link href={`/product/${product.id}`}>
                          <div className="aspect-square relative">
                            <Image
                              src={product.imageUrl || "/placeholder.svg?height=200&width=200"}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </Link>
                        <div className="p-4">
                          <Link href={`/product/${product.id}`}>
                            <h3 className="font-semibold text-white hover:text-purple-400 transition truncate">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-400">{product.brand}</p>
                          <div className="flex items-center justify-between mt-3">
                            <p className="text-lg font-bold text-white">Rs. {product.price?.toFixed(2)}</p>
                            <button
                              onClick={() => removeItem(product.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Liked Articles Tab */}
            {activeTab === "liked-articles" && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <h2 className="text-lg font-bold text-white mb-6">Liked Articles</h2>

                {likedBlogsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : likedBlogs.length === 0 ? (
                  <div className="text-center py-12">
                    <BookHeart size={64} className="text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No liked articles yet</h3>
                    <p className="text-gray-400 mb-4">Explore our blog and like articles to save them here</p>
                    <Link
                      href="/blog"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      <BookHeart size={18} />
                      Browse Blog
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {likedBlogs.map((blog) => (
                      <div
                        key={blog.id}
                        className="bg-slate-700/30 rounded-xl overflow-hidden border border-slate-700 group"
                      >
                        <Link href={`/blog/${blog.id}`}>
                          <div className="aspect-video relative">
                            <Image
                              src={blog.imageUrl || "/placeholder.svg?height=200&width=300"}
                              alt={blog.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded">
                              {blog.category}
                            </span>
                          </div>
                        </Link>
                        <div className="p-4">
                          <Link href={`/blog/${blog.id}`}>
                            <h3 className="font-semibold text-white hover:text-purple-400 transition line-clamp-2 mb-2">
                              {blog.title}
                            </h3>
                          </Link>
                          <p className="text-xs text-gray-500 mb-3">
                            Liked on {new Date(blog.likedAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center justify-between">
                            <Link
                              href={`/blog/${blog.id}`}
                              className="text-sm text-purple-400 hover:text-purple-300 transition"
                            >
                              Read Article →
                            </Link>
                            <button
                              onClick={() => unlikeBlog(blog.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                              title="Remove from liked"
                            >
                              <Heart size={18} fill="currentColor" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">Saved Addresses</h2>
                  <button
                    onClick={() => {
                      setEditingAddress(null)
                      setAddressForm({
                        label: "Home",
                        firstName: "",
                        lastName: "",
                        phone: "",
                        street: "",
                        city: "",
                        state: "",
                        zipCode: "",
                        country: "Pakistan",
                        isDefault: false,
                      })
                      setIsAddressModalOpen(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    <Plus size={18} />
                    Add Address
                  </button>
                </div>

                {!profile?.addresses || profile.addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin size={64} className="text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No saved addresses</h3>
                    <p className="text-gray-400">Add an address for faster checkout</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-4 rounded-xl border ${
                          address.isDefault
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-slate-700 bg-slate-700/30"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-xs font-medium bg-slate-700 text-gray-300 rounded">
                              {address.label}
                            </span>
                            {address.isDefault && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-purple-500/30 text-purple-400 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditAddress(address)}
                              className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-slate-700 rounded transition"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-slate-700 rounded transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="font-medium text-white">
                          {address.firstName} {address.lastName}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">{address.phone}</p>
                        <p className="text-sm text-gray-400 mt-2">
                          {address.street}, {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-sm text-gray-400">{address.country}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <h2 className="text-lg font-bold text-white mb-6">My Reviews</h2>

                {reviewsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : userReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star size={64} className="text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No reviews yet</h3>
                    <p className="text-gray-400">Share your thoughts on products you've purchased</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userReviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-4 bg-slate-700/30 rounded-xl border border-slate-700"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Link
                              href={`/product/${review.productId}`}
                              className="font-semibold text-white hover:text-purple-400 transition"
                            >
                              {review.productName}
                            </Link>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {review.createdAt?.toDate?.()?.toLocaleDateString() || "—"}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {review.images.map((img, idx) => (
                              <Image
                                key={idx}
                                src={img}
                                alt={`Review ${idx + 1}`}
                                width={64}
                                height={64}
                                className="object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                        {review.isApproved ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-400 mt-3">
                            <CheckCircle size={12} />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-yellow-400 mt-3">
                            <Clock size={12} />
                            Pending Approval
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Account Settings */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                  <h2 className="text-lg font-bold text-white mb-6">Account Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="font-medium text-white">Email Address</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="font-medium text-white">Password</p>
                        <p className="text-sm text-gray-400">••••••••</p>
                      </div>
                      <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                        Change
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-6">
                  <h2 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h2>
                  <p className="text-sm text-gray-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>
              <button
                onClick={() => {
                  setIsAddressModalOpen(false)
                  setEditingAddress(null)
                }}
                className="p-2 text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddressSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Address Label</label>
                <select
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">First Name</label>
                  <input
                    type="text"
                    value={addressForm.firstName}
                    onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={addressForm.lastName}
                    onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone</label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Street Address</label>
                <input
                  type="text"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">State/Province</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">ZIP/Postal Code</label>
                  <input
                    type="text"
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Country</label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="isDefault" className="text-gray-300">
                  Set as default address
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddressModalOpen(false)
                    setEditingAddress(null)
                  }}
                  className="flex-1 px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingAddress ? "Update" : "Add Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
