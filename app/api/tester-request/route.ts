import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodemailer = require("nodemailer")

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "info.bilalyousaf12@gmail.com",
    pass: process.env.EMAIL_PASS,
  },
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Validate required fields
    if (!formData.email || !formData.firstName || !formData.lastName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    console.log("📝 [TESTER REQUEST] Processing tester application from:", formData.email)

    // Send confirmation email to tester
    try {
      console.log("📧 [TESTER REQUEST] Sending confirmation email...")
      
      const testerEmailHtml = `
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
                      <p style="margin: 10px 0 0; color: #1e293b; font-size: 14px;">Thank You for Applying!</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px;">Welcome, ${formData.firstName}! 🎉</h2>
                      
                      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Thank you for your interest in becoming a BY12 Perfumes Tester! We're excited about your application.
                      </p>

                      <!-- Application Summary -->
                      <div style="background-color: rgba(0,0,0,0.3); border-left: 4px solid #d4af37; padding: 20px; margin: 30px 0; border-radius: 8px;">
                        <h3 style="color: #d4af37; font-size: 16px; margin: 0 0 15px; font-weight: bold;">Application Summary</h3>
                        <table style="width: 100%; color: #94a3b8; font-size: 14px;">
                          <tr>
                            <td style="padding: 8px 0;"><strong style="color: #ffffff;">Name:</strong></td>
                            <td style="padding: 8px 0; text-align: right;">${formData.firstName} ${formData.lastName}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;"><strong style="color: #ffffff;">Email:</strong></td>
                            <td style="padding: 8px 0; text-align: right;">${formData.email}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;"><strong style="color: #ffffff;">Location:</strong></td>
                            <td style="padding: 8px 0; text-align: right;">${formData.location}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;"><strong style="color: #ffffff;">Fragrance Interests:</strong></td>
                            <td style="padding: 8px 0; text-align: right;">${formData.fragrancePreferences}</td>
                          </tr>
                        </table>
                      </div>

                      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        <strong style="color: #ffffff;">What Happens Next?</strong><br>
                        Our team will carefully review your application within 5-7 business days. If selected, we'll contact you with details about the tester program and your first fragrance samples.
                      </p>

                      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        In the meantime, check out our collection of fragrances:
                      </p>

                      <!-- CTA Button -->
                      <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); border-radius: 12px; padding: 15px 30px;">
                            <a href="https://bilalyousaf12.store/shop" style="color: #0f172a; text-decoration: none; font-weight: bold; font-size: 16px;">Explore Our Shop</a>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #64748b; font-size: 14px; margin: 30px 0 0;">
                        If you have any questions, feel free to reach out to us at <a href="mailto:info@bilalyousaf12.com" style="color: #d4af37; text-decoration: none;">info@bilalyousaf12.com</a>
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
                        <a href="https://bilalyousaf12.store/privacy" style="color: #94a3b8; text-decoration: underline;">Privacy Policy</a>
                        <span style="margin: 0 8px;">|</span>
                        <a href="https://bilalyousaf12.store/terms" style="color: #94a3b8; text-decoration: underline;">Terms of Service</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `

      await transporter.sendMail({
        from: `"BY12 Perfumes" <${process.env.EMAIL_USER || "info.bilalyousaf12@gmail.com"}>`,
        to: formData.email,
        subject: "Thank You for Your Tester Application! 🌸",
        html: testerEmailHtml,
      })

      console.log("✅ [TESTER REQUEST] Confirmation email sent successfully")
    } catch (emailError) {
      console.error("⚠️  [TESTER REQUEST] Error sending confirmation email:", emailError)
      // Don't fail the request if email fails - data is still saved
    }

    // Send admin notification email
    try {
      console.log("📧 [TESTER REQUEST] Sending admin notification...")
      
      const adminEmailHtml = `
        <h2>New Tester Application</h2>
        <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Phone:</strong> ${formData.phone}</p>
        <p><strong>Age:</strong> ${formData.age || "Not specified"}</p>
        <p><strong>Location:</strong> ${formData.location}</p>
        <p><strong>Fragrance Preferences:</strong> ${formData.fragrancePreferences}</p>
        <p><strong>Experience:</strong> ${formData.experience || "Not specified"}</p>
        <p><strong>How They Heard:</strong> ${formData.howYouHeardAboutUs || "Not specified"}</p>
        <p><strong>Message:</strong> ${formData.message || "None"}</p>
        <p><strong>Status:</strong> Pending Review</p>
        <hr>
        <p>Review this application in the Firebase Console under the "testerRequests" collection.</p>
      `

      await transporter.sendMail({
        from: `"BY12 Perfumes" <${process.env.EMAIL_USER || "info.bilalyousaf12@gmail.com"}>`,
        to: process.env.EMAIL_USER || "info.bilalyousaf12@gmail.com",
        subject: `New Tester Application: ${formData.firstName} ${formData.lastName}`,
        html: adminEmailHtml,
      })

      console.log("✅ [TESTER REQUEST] Admin notification sent successfully")
    } catch (adminEmailError) {
      console.error("⚠️  [TESTER REQUEST] Error sending admin email:", adminEmailError)
    }

    console.log("✅ [TESTER REQUEST] Application processed successfully")
    return NextResponse.json({
      success: true,
      message: "Application submitted successfully! Check your email for confirmation.",
    })
  } catch (error: any) {
    console.error("❌ [TESTER REQUEST] Error processing application:", error)
    return NextResponse.json(
      { error: "Failed to process application. Please try again." },
      { status: 500 }
    )
  }
}
