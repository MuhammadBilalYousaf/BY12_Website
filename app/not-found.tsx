"use client"

import Link from "next/link"
import { Home, Search, ShoppingBag, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-bold text-primary/10 select-none leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Page Not Found
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          Oops! The page you're looking for seems to have vanished like a wisp of perfume. 
          Let's help you find your way back.
        </p>

        {/* Quick Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/shop">
              <ShoppingBag className="w-4 h-4" />
              Browse Shop
            </Link>
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="border-t pt-8">
          <p className="text-sm text-muted-foreground mb-4">
            Popular destinations:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link 
              href="/shop?category=men" 
              className="text-sm text-primary hover:underline"
            >
              Men's Perfumes
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              href="/shop?category=women" 
              className="text-sm text-primary hover:underline"
            >
              Women's Perfumes
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              href="/blog" 
              className="text-sm text-primary hover:underline"
            >
              Blog
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              href="/contact" 
              className="text-sm text-primary hover:underline"
            >
              Contact Us
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              href="/track-order" 
              className="text-sm text-primary hover:underline"
            >
              Track Order
            </Link>
          </div>
        </div>

        {/* Back Button */}
        <button 
          onClick={() => window.history.back()}
          className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back to previous page
        </button>
      </div>
    </div>
  )
}
