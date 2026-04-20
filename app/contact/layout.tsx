import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | BY12 Perfumes Pakistan",
  description: "Get in touch with BY12 Perfumes. Contact us for inquiries, orders, or customer support. We're here to help you find your perfect fragrance.",
  keywords: "contact BY12, perfume shop Pakistan, customer support, order inquiry, BY12 Perfumes contact",
  alternates: {
    canonical: "https://bilalyousaf12.store/contact",
  },
  openGraph: {
    title: "Contact Us | BY12 Perfumes Pakistan",
    description: "Get in touch with BY12 Perfumes for inquiries and support.",
    type: "website",
    url: "https://bilalyousaf12.store/contact",
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
