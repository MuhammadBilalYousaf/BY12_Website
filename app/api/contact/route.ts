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
    const { firstName, lastName, email, subject, message } = await request.json()

    // Validation
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      )
    }

    // Message is stored in Firestore from client-side
    // This API route only handles email notifications

    // Send notification email to admin
    try {
      await transporter.sendMail({
        from: `"BY12 Website" <${process.env.EMAIL_USER || "info.bilalyousaf12@gmail.com"}>`,
        to: process.env.EMAIL_USER || "info.bilalyousaf12@gmail.com",
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 25px 30px;">
                        <h1 style="margin: 0; color: #d4af37; font-size: 22px; font-weight: bold;">📬 New Contact Form Submission</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 30px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                              <strong style="color: #374151; width: 120px; display: inline-block;">From:</strong>
                              <span style="color: #6b7280;">${firstName} ${lastName}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                              <strong style="color: #374151; width: 120px; display: inline-block;">Email:</strong>
                              <a href="mailto:${email}" style="color: #d4af37; text-decoration: none;">${email}</a>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                              <strong style="color: #374151; width: 120px; display: inline-block;">Subject:</strong>
                              <span style="color: #6b7280;">${subject}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 20px 0 0;">
                              <strong style="color: #374151; display: block; margin-bottom: 10px;">Message:</strong>
                              <div style="background: #f9fafb; border-radius: 8px; padding: 15px; color: #4b5563; line-height: 1.6; border-left: 4px solid #d4af37;">
                                ${message.replace(/\n/g, "<br>")}
                              </div>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Reply Button -->
                        <table cellpadding="0" cellspacing="0" style="margin: 25px 0 0;">
                          <tr>
                            <td style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); border-radius: 8px; padding: 12px 25px;">
                              <a href="mailto:${email}?subject=Re: ${subject}" style="color: #0f172a; text-decoration: none; font-weight: bold; font-size: 14px;">Reply to Customer</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                          View all messages in <a href="https://bilalyousaf12.store/admin/messages" style="color: #d4af37;">Admin Portal</a>
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
    } catch (emailError) {
      console.error("Error sending notification email:", emailError)
      // Don't fail if email notification fails - message is stored in Firestore from client
    }

    // Send confirmation email to the customer
    try {
      await transporter.sendMail({
        from: `"BY12 Perfumes" <${process.env.EMAIL_USER || "info.bilalyousaf12@gmail.com"}>`,
        to: email,
        subject: "We've Received Your Message - BY12 Perfumes",
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
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px;">Thank You for Reaching Out! ✨</h2>
                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                          Hi ${firstName},
                        </p>
                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                          We've received your message and our team will get back to you within 24-48 hours. We appreciate your patience!
                        </p>
                        
                        <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 20px; margin: 25px 0;">
                          <p style="color: #d4af37; font-size: 14px; font-weight: bold; margin: 0 0 10px;">Your Message:</p>
                          <p style="color: #94a3b8; font-size: 14px; margin: 0 0 10px;"><strong>Subject:</strong> ${subject}</p>
                          <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.6;">${message.substring(0, 200)}${message.length > 200 ? "..." : ""}</p>
                        </div>
                        
                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 20px 0 0;">
                          In the meantime, feel free to explore our latest collection!
                        </p>
                        
                        <!-- CTA Button -->
                        <table cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                          <tr>
                            <td style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); border-radius: 12px; padding: 15px 30px;">
                              <a href="https://bilalyousaf12.store/shop" style="color: #0f172a; text-decoration: none; font-weight: bold; font-size: 16px;">Browse Collection</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: rgba(0,0,0,0.3); padding: 25px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
                        <p style="color: #64748b; font-size: 12px; margin: 0 0 10px;">
                          © 2026 BY12 Perfumes. All rights reserved.
                        </p>
                        <p style="color: #64748b; font-size: 12px; margin: 0;">
                          DHA Phase 8, Eden City, Pakistan | +92 311 5318776
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
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError)
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    )
  }
}
