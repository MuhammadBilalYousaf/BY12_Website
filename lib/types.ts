export interface SizeVariant {
  size: number // Size in ml
  price: number
  stock: number // Stock for this specific size
  onSale?: boolean // Indicates if the variant is on sale
  saleType?: "percent" | "amount" // Type of sale: percentage or fixed amount
  saleValue?: number // Sale value (integer only)
  saleImageUrl?: string // Optional image shown when this variant is on sale
  images?: string[] // Variant-specific gallery; not shared across variants
}

export interface Product {
  id: string
  name: string
  brand: string
  category: string
  includedItems?: string[]
  isDeal?: boolean
  dealId?: string
  price: number // Default/base price (first size variant price)
  originalPrice?: number
  onSale?: boolean
  salePrice?: number
  salePercentage?: number
  size?: number // Default size (for backward compatibility)
  sizeVariants?: SizeVariant[] // Multiple sizes with prices
  description?: string
  imageUrl?: string
  images?: string[]
  rating?: number
  reviews?: number
  stock?: number
  inStock?: boolean
  featured?: boolean
  status?: "Active" | "Out of Stock"
  metaTitle?: string
  metaDescription?: string
  ogTitle?: string
  ogDescription?: string
  keywords?: string
  createdAt?: any
  updatedAt?: any
  altText?: string
}

export interface CartItem {
  productId: string
  quantity: number
  product: Product
  selectedSize?: number // Selected size in ml
  selectedPrice?: number // Price for the selected size
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: Address
  billingAddress: Address
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  firstName: string
  lastName: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface User {
  id: string
  email: string
  name: string
  displayName?: string
  role: "customer" | "admin"
  createdAt: Date
}

export interface Category {
  id: string
  name: "Men" | "Women" | "Unisex"
  description: string
}

export interface Coupon {
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minPurchase?: number
  maxDiscount?: number
  expiryDate?: Date
  isActive: boolean
}

export interface Deal {
  id: string
  title: string
  description: string
  includedItems?: string[]
  imageUrl: string
  images?: string[]
  originalPrice: number
  dealPrice: number
  badge?: string
  productId?: string
  endDate?: any
  isActive: boolean
  featured?: boolean
  createdAt?: any
  updatedAt?: any
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  authorBio?: string
  authorImage?: string
  date: string
  readTime: string
  category: string
  imageUrl: string
  featured: boolean
  tags: string[]
  status: "published" | "draft"
  createdAt?: any
  updatedAt?: any
}

export interface CustomerInteraction {
  id?: string
  // Customer info
  customerId?: string // Optional - for signed-in users
  email: string
  name?: string
  phone?: string
  
  // Guest tracking
  guestSessionId?: string // Temporary ID for guest users - cleared after email is linked
  
  // Interaction tracking
  interactionType: "contact_form" | "checkout" | "cart_add" | "cart_remove" | "sign_up" | "sign_in" | "product_view"
  interactionSource?: "contact_form" | "checkout_form" | "cart" | "sign_up_form" | "sign_in_form" | "product_page" | "wishlist"
  
  // Form field tracking (for contact and checkout)
  fieldsFilled?: {
    [key: string]: string | number | boolean // Maps field names to their values
  }
  fieldNames?: string[] // List of fields that have been filled
  fieldsCount?: number // Number of fields filled
  formCompletionPercentage?: number // 0-100
  
  // Cart interactions
  productId?: string
  productName?: string
  quantity?: number
  
  // Checkout specific
  checkoutStep?: "shipping" | "billing" | "payment" | "order_review" | "completed"
  orderTotal?: number
  orderId?: string // Set when order is completed
  paymentMethod?: string
  
  // Timestamps
  startedAt: Date | any
  lastActivityAt: Date | any
  createdAt?: Date | any
  updatedAt?: Date | any
  
  // Conversion tracking
  converted?: boolean // Did they complete an action (submit form, place order, etc.)
  conversionType?: "contact_submission" | "order_completed" | "signup_completed"
  
  // Additional metadata
  userAgent?: string
  ipAddress?: string
  referrer?: string
  notes?: string // Single note (backward compatibility)
  notesHistory?: Array<{
    text: string
    timestamp: Date | any
    updatedBy?: string // Optional: track who added the note
  }>
}
