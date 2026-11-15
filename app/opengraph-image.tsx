import { ImageResponse } from "next/og"

export const alt = "BY12 Perfumes — Inspired Fragrances in Pakistan"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, background: "#0f172a", color: "#ffffff", border: "16px solid #d4af37" }}>
      <div style={{ display: "flex", fontSize: 110, fontWeight: 700, color: "#d4af37" }}>BY12</div>
      <div style={{ display: "flex", fontSize: 54, marginTop: 20 }}>Inspired Fragrances in Pakistan</div>
      <div style={{ display: "flex", fontSize: 30, marginTop: 32, color: "#cbd5e1" }}>Discover your signature scent.</div>
    </div>, size,
  )
}
