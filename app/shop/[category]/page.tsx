"use client"

import { redirect } from "next/navigation"

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params

  // Redirect to main shop page - filtering will be handled client-side
  redirect("/shop")
}
