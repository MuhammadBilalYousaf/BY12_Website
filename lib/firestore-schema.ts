export interface Product {
  id?: string
  name: string
  description: string
  price: number
  image: string
  category: string
  rating: number
  reviews: number
  stock: number
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id?: string
  email: string
  displayName: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id?: string
  userId: string
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: Address
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Cart {
  id?: string
  userId: string
  items: CartItem[]
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface Review {
  id?: string
  productId: string
  userId: string
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
}

export interface Deal {
  id?: string
  title: string
  description: string
  includedItems?: string[]
  imageUrl: string
  originalPrice: number
  dealPrice: number
  badge?: string
  productId?: string
  endDate?: Date | null
  isActive: boolean
  featured?: boolean
  createdAt: Date
  updatedAt: Date
}
