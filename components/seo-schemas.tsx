// JSON-LD Schema Components for SEO
// These components add structured data markup for search engines

export interface OrganizationSchemaProps {
  name?: string
  url?: string
  logo?: string
  description?: string
  email?: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    country: string
    postalCode?: string
  }
  socialLinks?: string[]
}

export function OrganizationSchema({
  name = "BY12 Perfumes",
  url = "https://bilalyousaf12.store",
  logo = "https://bilalyousaf12.store/favicon.ico",
  description = "Premium luxury perfumes and fragrances in Pakistan. Authentic scents for men and women.",
  email = "info.bilalyousaf12@gmail.com",
  phone = "+92 311 5318776",
  address = {
    street: "DHA Phase 8, Eden City",
    city: "Lahore",
    state: "Punjab",
    country: "Pakistan"
  },
  socialLinks = [
    "https://www.facebook.com/by12perfumes",
    "https://www.instagram.com/by12perfumes"
  ]
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    email,
    telephone: phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.state,
      addressCountry: address.country,
      postalCode: address.postalCode
    },
    sameAs: socialLinks
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export interface WebsiteSchemaProps {
  name?: string
  url?: string
  description?: string
}

export function WebsiteSchema({
  name = "BY12 Perfumes",
  url = "https://bilalyousaf12.store",
  description = "Premium luxury perfumes and fragrances in Pakistan"
}: WebsiteSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/shop?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export interface BreadcrumbSchemaProps {
  items: Array<{
    name: string
    url?: string
  }>
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://bilalyousaf12.store"
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.name,
        ...(item.url && { item: `https://bilalyousaf12.store${item.url}` })
      }))
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export interface ProductSchemaProps {
  name: string
  description: string
  image: string
  price: number
  currency?: string
  brand?: string
  category?: string
  inStock?: boolean
  rating?: number
  reviewCount?: number
  sku?: string
  url?: string
}

export function ProductSchema({
  name,
  description,
  image,
  price,
  currency = "PKR",
  brand = "BY12",
  category,
  inStock = true,
  rating,
  reviewCount,
  sku,
  url
}: ProductSchemaProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description?.replace(/<[^>]*>/g, '').substring(0, 500), // Strip HTML tags
    image,
    brand: {
      "@type": "Brand",
      name: brand
    },
    category,
    sku,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: inStock 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      url,
      seller: {
        "@type": "Organization",
        name: "BY12 Perfumes"
      }
    }
  }

  if (rating && reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount: reviewCount,
      bestRating: 5,
      worstRating: 1
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export interface FAQSchemaProps {
  questions: Array<{
    question: string
    answer: string
  }>
}

export function FAQSchema({ questions }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export interface BlogPostSchemaProps {
  title: string
  description: string
  image: string
  author: string
  datePublished: string
  dateModified?: string
  url?: string
}

export function BlogPostSchema({
  title,
  description,
  image,
  author,
  datePublished,
  dateModified,
  url
}: BlogPostSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image,
    author: {
      "@type": "Person",
      name: author
    },
    publisher: {
      "@type": "Organization",
      name: "BY12 Perfumes",
      logo: {
        "@type": "ImageObject",
        url: "https://bilalyousaf12.store/favicon.ico"
      }
    },
    datePublished,
    dateModified: dateModified || datePublished,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export interface LocalBusinessSchemaProps {
  name?: string
  url?: string
  phone?: string
  email?: string
  address?: {
    street: string
    city: string
    state: string
    country: string
  }
  priceRange?: string
}

export function LocalBusinessSchema({
  name = "BY12 Perfumes",
  url = "https://bilalyousaf12.store",
  phone = "+92 311 5318776",
  email = "info.bilalyousaf12@gmail.com",
  address = {
    street: "DHA Phase 8, Eden City",
    city: "Lahore",
    state: "Punjab",
    country: "Pakistan"
  },
  priceRange = "Rs. 1000 - Rs. 50000"
}: LocalBusinessSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name,
    url,
    telephone: phone,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.state,
      addressCountry: address.country
    },
    priceRange,
    openingHours: "Mo-Su 10:00-22:00",
    paymentAccepted: "Cash on Delivery"
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
