"use client"

import Link from "next/link"
import { Home, ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function PageBreadcrumb({ items, className = "" }: PageBreadcrumbProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      <Link 
        href="/" 
        className="flex items-center gap-1 text-slate-400 hover:text-accent transition-colors"
      >
        <Home size={16} />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight size={14} className="text-slate-600" />
          {item.href ? (
            <Link 
              href={item.href}
              className="text-slate-400 hover:text-accent transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-white font-medium truncate max-w-[200px] sm:max-w-none">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
