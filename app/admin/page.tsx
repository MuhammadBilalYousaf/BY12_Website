"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/lib/contexts/admin-auth-context"
import { Package, ShoppingCart, Users, Banknote, TrendingUp, Clock, Lock, Mail, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useProducts } from "@/lib/hooks/use-products"
import { useOrders } from "@/lib/hooks/use-orders"
import { useCustomers } from "@/lib/hooks/use-customers"

function LoginPage({ onSubmit, isSubmitting, error, email, setEmail, password, setPassword, showPassword, setShowPassword }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl font-bold text-primary hover:opacity-80 transition mb-2">
            Perfume Admin
          </Link>
          <p className="text-muted-foreground">Sign in to access admin panel</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-lg shadow-xl border border-border p-8">
          <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6">
            <Lock className="text-primary" size={32} />
          </div>

          <h1 className="text-2xl font-bold text-center text-foreground mb-6">Admin Login</h1>

          {/* Demo Credentials Info */}
          <div className="mb-6 p-4 bg-muted/50 border border-border rounded-lg">
            <p className="text-sm font-semibold text-foreground mb-2">Demo Credentials:</p>
            <p className="text-xs text-muted-foreground">Email: admin@perfume.com</p>
            <p className="text-xs text-muted-foreground">Password: admin123</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@perfume.com"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Back to Website */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-primary hover:underline">
              ← Back to Website
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            This is an admin-only area. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  )
}

function AdminDashboard() {
  const { user } = useAdminAuth()
  const { products, loading: productsLoading } = useProducts()
  const { orders, loading: ordersLoading, getOrderStats } = useOrders()
  const { customers, loading: customersLoading } = useCustomers()

  const orderStats = getOrderStats()
  
  // Calculate monthly revenue from orders
  const monthlyRevenue = orders
    .filter(order => order.status === "Completed")
    .reduce((sum, order) => sum + order.total, 0)

  const stats = [
    { 
      name: "Total Products", 
      value: productsLoading ? "..." : products.length.toString(), 
      icon: Package, 
      color: "from-purple-600 to-purple-800", 
      link: "/admin/products" 
    },
    { 
      name: "Pending Orders", 
      value: ordersLoading ? "..." : orderStats.pending.toString(), 
      icon: ShoppingCart, 
      color: "from-blue-600 to-blue-800", 
      link: "/admin/orders" 
    },
    { 
      name: "Total Customers", 
      value: customersLoading ? "..." : customers.length.toString(), 
      icon: Users, 
      color: "from-green-600 to-green-800", 
      link: "/admin/customers" 
    },
    { 
      name: "Monthly Revenue", 
      value: ordersLoading ? "..." : `Rs. ${monthlyRevenue.toFixed(2)}`, 
      icon: Banknote, 
      color: "from-pink-600 to-pink-800", 
      link: "/admin/dashboard" 
    },
  ]

  // Get recent orders (last 3)
  const recentOrders = orders.slice(0, 3).map(order => ({
    id: order.orderId || order.id,
    customer: order.customerName || "Unknown",
    amount: `Rs. ${order.total.toFixed(2)}`,
    status: order.status,
  }))

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Welcome back, {user?.name}!</p>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Clock size={16} />
            <span className="text-sm">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link
                key={stat.name}
                href={stat.link}
                className={`bg-gradient-to-br ${stat.color} rounded-lg p-6 text-white hover:scale-105 transition-transform cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon size={32} />
                  <span className="text-3xl font-bold">{stat.value}</span>
                </div>
                <p className="text-white/80">{stat.name}</p>
              </Link>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm text-purple-400 hover:text-purple-300">
                View All →
              </Link>
            </div>
            {ordersLoading ? (
              <div className="text-center py-8 text-gray-400">Loading orders...</div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No orders yet</div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex-1">
                      <p className="text-white font-semibold">{order.id}</p>
                      <p className="text-sm text-gray-400">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{order.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.status === "Completed" ? "bg-green-500/20 text-green-400" :
                        order.status === "Processing" ? "bg-blue-500/20 text-blue-400" :
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/admin/products"
                className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
              >
                <p className="font-semibold mb-1">Manage Products</p>
                <p className="text-sm text-gray-400">Add, edit, or remove products</p>
              </Link>
              <Link
                href="/admin/orders"
                className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
              >
                <p className="font-semibold mb-1">View Orders</p>
                <p className="text-sm text-gray-400">Process customer orders</p>
              </Link>
              <Link
                href="/admin/customers"
                className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
              >
                <p className="font-semibold mb-1">Customer Management</p>
                <p className="text-sm text-gray-400">View and manage customers</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="mt-6 bg-slate-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-green-400" size={24} />
            <h2 className="text-xl font-bold text-white">Sales Performance</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-700 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{orderStats.pending}</p>
            </div>
            <div className="p-4 bg-slate-700 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Processing</p>
              <p className="text-2xl font-bold text-blue-400">{orderStats.processing}</p>
            </div>
            <div className="p-4 bg-slate-700 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-400">{orderStats.completed}</p>
            </div>
            <div className="p-4 bg-slate-700 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Cancelled</p>
              <p className="text-2xl font-bold text-red-400">{orderStats.cancelled}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AdminPage() {
  const { user, loading, signIn } = useAdminAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // If admin is already logged in, show dashboard
  if (!loading && user) {
    return <AdminDashboard />
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show login form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      await signIn(email, password)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <LoginPage 
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      error={error}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
    />
  )
}
