"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import Script from "next/script"
import { GA_MEASUREMENT_ID, syncAnalyticsPage } from "@/lib/google-analytics"

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const lastPage = useRef("")
  const [loadTag, setLoadTag] = useState(false)
  useEffect(() => {
    if (lastPage.current === pathname) return
    // Also sets the GA disable flag when navigating to a private route.
    if (syncAnalyticsPage()) {
      lastPage.current = pathname
      setLoadTag(true)
    } else lastPage.current = ""
  }, [pathname])
  return loadTag ? <Script id="by12-google-analytics" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" /> : null
}
