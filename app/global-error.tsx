"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div 
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            fontFamily: "system-ui, sans-serif",
            background: "linear-gradient(to bottom, #fff, #f5f5f5)"
          }}
        >
          <div style={{ maxWidth: "500px", textAlign: "center" }}>
            <div 
              style={{
                width: "80px",
                height: "80px",
                margin: "0 auto 2rem",
                borderRadius: "50%",
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <AlertTriangle style={{ width: "40px", height: "40px", color: "#dc2626" }} />
            </div>
            
            <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "1rem", color: "#111" }}>
              Critical Error
            </h1>
            
            <p style={{ color: "#666", marginBottom: "2rem" }}>
              A critical error has occurred. Please try refreshing the page.
            </p>
            
            <button
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                background: "#111",
                color: "#fff",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500"
              }}
            >
              <RefreshCw style={{ width: "16px", height: "16px" }} />
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
