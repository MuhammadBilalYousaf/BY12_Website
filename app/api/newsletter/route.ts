import { NextRequest, NextResponse } from "next/server"

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

export async function POST(request: NextRequest) {
  try {
    const { email, isNewSubscriber = true } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      )
    }

    // Only send welcome email for new subscribers
    if (isNewSubscriber) {
      try {
        await transporter.sendMail({
          from: `"BY12 Perfumes" <${process.env.EMAIL_USER || "info.bilalyousaf12@gmail.com"}>`,
          to: email,
          subject: "Welcome to BY12 Perfumes Newsletter! 🌸",
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
        console.log("✅ Welcome email sent to:", email)
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError)
        // Don't fail the subscription if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter!",
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    )
  }
}
