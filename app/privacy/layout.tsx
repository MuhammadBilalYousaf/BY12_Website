import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | BY12 Perfumes",
  description: "Read our privacy policy to understand how BY12 Perfumes collects, uses, and protects your personal information.",
  keywords: "privacy policy, data protection, BY12 privacy, personal information",
  alternates: {
    canonical: "https://bilalyousaf12.store/privacy",
  },
  openGraph: {
    title: "Privacy Policy | BY12 Perfumes",
    description: "How BY12 Perfumes protects your privacy and personal data.",
    type: "website",
    url: "https://bilalyousaf12.store/privacy",
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
