import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodemailer = require("nodemailer")

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "info.bilalyousaf12@gmail.com",
    pass: process.env.EMAIL_PASS, // App password from Gmail
  },
})

// Verify transporter is configured
if (!process.env.EMAIL_PASS) {
  console.error("⚠️ [NEWSLETTER] WARNING: EMAIL_PASS environment variable is not set!")
}

// Generate unique coupon code for newsletter subscriber
function generateUniqueCouponCode(email: string): string {
  const emailPrefix = email.split("@")[0].substring(0, 3).toUpperCase()
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4)
  const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `WELCOME${emailPrefix}${timestamp}${randomPart}`
}

// Save coupon to Firebase database
async function saveWelcomeCoupon(email: string, couponCode: string): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    const normalizedCode = couponCode.toUpperCase().trim()
    const couponId = normalizedCode.replace(/\s+/g, '_')
    
    console.log("💾 [COUPON SAVE] Starting save process")
    console.log("💾 [COUPON SAVE] Original code:", couponCode)
    console.log("💾 [COUPON SAVE] Normalized code:", normalizedCode)
    console.log("💾 [COUPON SAVE] Document ID:", couponId)
    console.log("💾 [COUPON SAVE] Email:", email.toLowerCase())
    console.log("💾 [COUPON SAVE] Database instance:", adminDb ? "✅ Initialized" : "❌ NOT initialized")
    
    if (!adminDb) {
      console.error("❌ [COUPON SAVE] Firebase Admin DB not initialized!")
      return { success: false, error: "Database not initialized" }
    }
    
    // Check if coupon already exists
    console.log("💾 [COUPON SAVE] Checking if coupon exists...")
    const existingCoupon = await adminDb!.collection("coupons").doc(couponId).get()
    console.log("💾 [COUPON SAVE] Document check complete. Exists:", existingCoupon.exists)
    
    if (existingCoupon.exists) {
      console.log("✅ [COUPON SAVE] Coupon already exists in database")
      return { success: true, code: normalizedCode }
    }
    
    // Set expiry to 30 days from now
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)
    
    // Create welcome coupon data
    const couponData = {
      code: normalizedCode,
      discountType: "percentage",
      discountValue: 10,
      minPurchase: 0,
      maxDiscount: 0,
      usageLimit: 1,
      usedCount: 0,
      isActive: true,
      allowedEmails: [email.toLowerCase()],
      isPersonalized: true,
      subscriberEmail: email.toLowerCase(),
      expiryDate: expiryDate.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usedByEmails: [],
    }
    
    console.log("💾 [COUPON SAVE] Data ready to save:", JSON.stringify(couponData, null, 2))
    console.log("💾 [COUPON SAVE] About to call set()...")
    console.log("💾 [COUPON SAVE] Path: coupons/" + couponId)
    
    // Attempt to save using Firebase Admin
    await adminDb!.collection("coupons").doc(couponId).set(couponData)
    
    console.log("✅ [COUPON SAVE] set() call completed successfully")
    console.log("✅ [COUPON SAVE] Coupon successfully saved to Firebase")
    console.log("✅ [COUPON SAVE] Document path: coupons/" + couponId)
    console.log("✅ [COUPON SAVE] Coupon code: " + normalizedCode)
    
    return { success: true, code: normalizedCode }
  } catch (err: any) {
    console.error("❌ [COUPON SAVE] ERROR during save:", err)
    console.error("❌ [COUPON SAVE] Error message:", err.message)
    console.error("❌ [COUPON SAVE] Error code:", err.code)
    console.error("❌ [COUPON SAVE] Full error object:", JSON.stringify(err, null, 2))
    return { success: false, error: err.message }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, isNewSubscriber = true } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      )
    }

    // Verify Firebase Admin is initialized
    if (!adminDb) {
      console.error("❌ [NEWSLETTER] Firebase Admin DB not initialized!")
      return NextResponse.json(
        { error: "Server configuration error. Please try again later." },
        { status: 500 }
      )
    }

    // Only send welcome email for new subscribers
    if (isNewSubscriber) {
      try {
        // Check if already subscribed
        console.log("🔍 [EMAIL] Checking if email already subscribed...")
        const snapshot = await adminDb!.collection("newsletterSubscribers").where("email", "==", email.toLowerCase()).get()
        
        // If not already subscribed, add to database
        if (snapshot.empty) {
          try {
            console.log("➕ [EMAIL] Adding new subscriber...")
            await adminDb!.collection("newsletterSubscribers").add({
              email: email.toLowerCase(),
              subscribedAt: FieldValue.serverTimestamp(),
              status: "active",
            })
            console.log("✅ Subscriber saved to database:", email)
          } catch (dbError) {
            console.error("Error saving subscriber:", dbError)
            // Continue with email even if save fails
          }
        } else {
          console.log("⚠️  Email already subscribed")
          return NextResponse.json(
            { error: "This email is already subscribed to our newsletter" },
            { status: 400 }
          )
        }
      } catch (queryError) {
        console.error("Error checking existing subscriber:", queryError)
        // Continue anyway
      }
      
      // Generate unique welcome coupon
      const couponCode = generateUniqueCouponCode(email)
      console.log("🎁 [EMAIL] Generated coupon code:", couponCode)
      
      // Save coupon to database - IMPORTANT: verify it saves before sending email
      let savedCouponCode = null
      try {
        console.log("🎁 [EMAIL] Attempting to save coupon...")
        const couponSaveResult = await saveWelcomeCoupon(email, couponCode)
        
        if (couponSaveResult.success) {
          savedCouponCode = couponSaveResult.code
          console.log("✅ [EMAIL] Coupon saved successfully:", savedCouponCode)
        } else {
          console.error("❌ [EMAIL] Coupon save failed:", couponSaveResult.error)
          // Still continue with email, showing the code
          savedCouponCode = couponCode
        }
      } catch (couponError) {
        console.error("❌ [EMAIL] Error in coupon save:", couponError)
        // Continue with email even if coupon save fails
      }
      
      try {
        // Always include coupon HTML with the saved/generated code
        const couponHtml = `
                        <!-- Welcome Coupon Section -->
                        <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(244, 208, 63, 0.2) 100%); border: 2px solid #d4af37; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                          <p style="color: #d4af37; font-size: 14px; margin: 0 0 10px; font-weight: bold; letter-spacing: 1px;">🎁 EXCLUSIVE WELCOME OFFER</p>
                          <p style="color: #94a3b8; font-size: 16px; margin: 0 0 15px;">Get 10% off your first purchase with this unique coupon code:</p>
                          <div style="background-color: #0f172a; border: 2px dashed #d4af37; border-radius: 8px; padding: 15px 20px; margin: 15px 0;">
                            <p style="color: #d4af37; font-size: 24px; font-weight: bold; font-family: 'Courier New', monospace; margin: 0; letter-spacing: 2px;">${savedCouponCode || couponCode}</p>
                          </div>
                          <p style="color: #64748b; font-size: 12px; margin: 10px 0 0;">Valid for 30 days • One-time use • Limited to your email address</p>
                        </div>
                        `
        
        await transporter.sendMail({
          from: `"BY12 Perfumes" <${process.env.EMAIL_USER || "info.bilalyousaf12@gmail.com"}>`,
          to: email,
          subject: "Welcome to BY12 Perfumes Newsletter! 🌸 + Exclusive 10% Off Coupon",
          html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%); padding: 30px; text-align: center;">
                        <h1 style="margin: 0; color: #0f172a; font-size: 28px; font-weight: bold;">BY12 Perfumes</h1>
                        <p style="margin: 10px 0 0; color: #1e293b; font-size: 14px;">Premium Fragrances</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px;">Welcome to the Family! 🎉</h2>
                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                          Thank you for subscribing to the BY12 Perfumes newsletter! You're now part of an exclusive community that appreciates the finer things in life.
                        </p>
                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                          Here's what you can expect from us:
                        </p>
                        <ul style="color: #94a3b8; font-size: 16px; line-height: 1.8; margin: 0 0 30px; padding-left: 20px;">
                          <li>🌟 Exclusive discounts and early access to sales</li>
                          <li>🆕 First look at new arrivals</li>
                          <li>💡 Fragrance tips and guides</li>
                          <li>🎁 Special birthday offers</li>
                        </ul>
                        
                        ${couponHtml}
                        
                        <!-- CTA Button -->
                        <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                          <tr>
                            <td style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); border-radius: 12px; padding: 15px 30px;">
                              <a href="https://bilalyousaf12.store/shop" style="color: #0f172a; text-decoration: none; font-weight: bold; font-size: 16px;">Shop Now</a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="color: #64748b; font-size: 14px; margin: 30px 0 0;">
                          Follow us on social media for daily inspiration!
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: rgba(0,0,0,0.3); padding: 25px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
                        <p style="color: #64748b; font-size: 12px; margin: 0 0 10px;">
                          © 2026 BY12 Perfumes. All rights reserved.
                        </p>
                        <p style="color: #64748b; font-size: 12px; margin: 0 0 15px;">
                          DHA Phase 8, Eden City, Pakistan
                        </p>
                        <p style="color: #64748b; font-size: 11px; margin: 0;">
                          <a href="https://bilalyousaf12.store/unsubscribe?email=${encodeURIComponent(email)}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
                          <span style="margin: 0 8px;">|</span>
                          <a href="https://bilalyousaf12.store/privacy" style="color: #94a3b8; text-decoration: underline;">Privacy Policy</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        })
        console.log("✅ Welcome email with coupon sent to:", email)
      } catch (emailError) {
        console.error("❌ Error sending welcome email:", emailError)
        // Don't fail the subscription if email fails - still return success
      }
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter!",
    })
  } catch (error: any) {
    console.error("❌ Newsletter subscription error:", error)
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    )
  }
}
