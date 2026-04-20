import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/cart",
          "/checkout",
          "/wishlist",
          "/profile",
          "/orders",
          "/sign-in",
          "/sign-up",
          "/unsubscribe",
          "/order-confirmation",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
        ],
      },
    ],
    sitemap: "https://bilalyousaf12.store/sitemap.xml",
    host: "https://bilalyousaf12.store",
  }
}
