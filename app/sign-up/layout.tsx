import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Account | BY12 Perfumes",
  description: "Create a BY12 Perfumes account to enjoy exclusive offers, faster checkout, and order tracking.",
  robots: "noindex, nofollow",
}

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
