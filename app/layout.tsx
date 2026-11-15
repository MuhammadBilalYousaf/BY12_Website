import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider, CartProvider, AdminProvider, WishlistProvider } from "@/lib/contexts"
import { Toaster } from "@/components/ui/toaster"
import { OrganizationSchema, WebsiteSchema, LocalBusinessSchema } from "@/components/seo-schemas"
import { PageTransition } from "@/components/page-transition"
import VisitorTracker from "@/components/visitor-tracker"
import GoogleAnalytics from "@/components/google-analytics"

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bilalyousaf12.store"),
  title: {
    default: "BY12 Perfumes | Inspired Fragrances in Pakistan",
    template: "%s"
  },
  description: "Explore BY12 inspired perfumes for men and women in Pakistan. Compare scent profiles, sizes and prices, with Cash on Delivery across Pakistan.",
  icons: {
    icon: "/tab_icon.png",

  },
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
    url: "https://www.bilalyousaf12.store",
    siteName: "BY12 Perfumes",
    title: "BY12 Perfumes | Inspired Fragrances in Pakistan",
    description: "Explore BY12 inspired perfumes for men and women in Pakistan. Compare scent profiles, bottle sizes and current prices.",
    images: [
      {
        url: "/opengraph-image",
        alt: "BY12 Perfumes Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BY12 Perfumes | Inspired Fragrances in Pakistan",
    description: "Explore BY12 inspired perfumes in Pakistan, with current bottle sizes, prices and available samples.",
    images: ["/opengraph-image"],
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
        <OrganizationSchema />
        <WebsiteSchema />
      </head>
      <body className="font-sans">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <AdminProvider>
              <CartProvider>
                <WishlistProvider>
                  <VisitorTracker />
                  <GoogleAnalytics />
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
