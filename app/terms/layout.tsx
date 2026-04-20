import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | BY12 Perfumes",
  description: "Review our terms of service for orders, payments, shipping, and returns at BY12 Perfumes Pakistan.",
  keywords: "terms of service, terms and conditions, BY12 terms, order terms",
  alternates: {
    canonical: "https://bilalyousaf12.store/terms",
  },
  openGraph: {
    title: "Terms of Service | BY12 Perfumes",
    description: "Terms and conditions for shopping at BY12 Perfumes.",
    type: "website",
    url: "https://bilalyousaf12.store/terms",
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
