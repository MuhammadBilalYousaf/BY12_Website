import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider, CartProvider, AdminProvider, WishlistProvider } from "@/lib/contexts"
import { Toaster } from "@/components/ui/toaster"
import { OrganizationSchema, WebsiteSchema, LocalBusinessSchema } from "@/components/seo-schemas"
import { PageTransition } from "@/components/page-transition"

export const metadata: Metadata = {
  metadataBase: new URL("https://bilalyousaf12.store"),
  title: {
    default: "BY12 Perfumes | Luxury Fragrances in Pakistan",
    template: "%s | BY12 Perfumes"
  },
  description: "Discover BY12's exclusive collection of luxury perfumes for men and women. Authentic fragrances, premium quality, and fast delivery across Pakistan.",
  keywords: ["perfumes", "luxury perfumes", "fragrances", "BY12", "perfume Pakistan", "men perfumes", "women perfumes", "unisex perfumes", "buy perfumes online"],
  authors: [{ name: "BY12 Perfumes" }],
  creator: "BY12 Perfumes",
  publisher: "BY12 Perfumes",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bilalyousaf12.store",
    siteName: "BY12 Perfumes",
    title: "BY12 Perfumes | Luxury Fragrances in Pakistan",
    description: "Discover BY12's exclusive collection of luxury perfumes for men and women.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "BY12 Perfumes Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BY12 Perfumes | Luxury Fragrances in Pakistan",
    description: "Discover BY12's exclusive collection of luxury perfumes.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add these when you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="description" content="Discover BY12's exclusive collection of luxury perfumes for men and women. Authentic fragrances, premium quality, and fast delivery across Pakistan." />
        <OrganizationSchema />
        <WebsiteSchema />
        <LocalBusinessSchema />
      </head>
      <body className="font-sans">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <AdminProvider>
              <CartProvider>
                <WishlistProvider>
                  <div id="main-content">
                    <PageTransition>
                      {children}
                    </PageTransition>
                  </div>
                  <Toaster />
                </WishlistProvider>
              </CartProvider>
            </AdminProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
