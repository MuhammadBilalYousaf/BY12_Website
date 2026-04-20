import { NextRequest, NextResponse } from "next/server"

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

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

interface OrderStatusUpdateData {
  orderId: string
  customerName: string
  customerEmail: string
  newStatus: "Processing" | "Completed" | "Cancelled" | "Shipped"
  items: OrderItem[]
  total: number
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

// Get status-specific content
const getStatusContent = (status: string, customerName: string) => {
  const firstName = customerName.split(" ")[0]
  
  switch (status) {
    case "Processing":
      return {
        icon: "📦",
        title: "Your Order is Being Processed!",
        message: `Great news, ${firstName}! We've started preparing your order. Our team is carefully packaging your luxurious perfumes with love and care.`,
        color: "#3b82f6", // Blue
        bgColor: "rgba(59, 130, 246, 0.2)",
        timeline: "Your order will be shipped within 1-2 business days.",
      }
    case "Shipped":
      return {
        icon: "🚚",
        title: "Your Order Has Been Shipped!",
        message: `Exciting news, ${firstName}! Your order is on its way! Your luxurious perfumes have been dispatched and are heading to your doorstep.`,
        color: "#8b5cf6", // Purple
        bgColor: "rgba(139, 92, 246, 0.2)",
        timeline: "Expected delivery within 3-5 business days.",
      }
    case "Completed":
      return {
        icon: "✅",
        title: "Your Order Has Been Delivered!",
        message: `Congratulations, ${firstName}! Your order has been successfully delivered. We hope you enjoy your new fragrances!`,
        color: "#22c55e", // Green
        bgColor: "rgba(34, 197, 94, 0.2)",
        timeline: "Thank you for shopping with BY12 Perfumes!",
      }
    case "Cancelled":
      return {
        icon: "❌",
        title: "Your Order Has Been Cancelled",
        message: `Hello ${firstName}, we're sorry to inform you that your order has been cancelled. If you did not request this cancellation, please contact our support team immediately.`,
        color: "#ef4444", // Red
        bgColor: "rgba(239, 68, 68, 0.2)",
        timeline: "If eligible, your refund will be processed within 5-7 business days.",
      }
    default:
      return {
        icon: "📋",
        title: "Order Status Update",
        message: `Hello ${firstName}, there's an update on your order.`,
        color: "#d4af37",
        bgColor: "rgba(212, 175, 55, 0.2)",
        timeline: "",
      }
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderStatusUpdateData = await request.json()

    const {
      orderId,
      customerName,
      customerEmail,
      newStatus,
      items,
      total,
      shippingAddress,
    } = orderData

    // Validation
    if (!customerEmail || !orderId || !newStatus) {
      return NextResponse.json(
        { error: "Missing required order information" },
        { status: 400 }
      )
    }

    const statusContent = getStatusContent(newStatus, customerName)
    const updateDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Generate order items HTML
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <span style="color: #ffffff; font-weight: 500;">${item.name}</span>
          </td>
          <td style="padding: 12px 15px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: center; color: #94a3b8;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 15px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; color: #d4af37; font-weight: 600;">
            Rs. ${(item.price * item.quantity).toLocaleString()}
          </td>
        </tr>
      `
      )
      .join("")

    // Send order status update email to customer
    try {
      await transporter.sendMail({
        from: `"BY12 Perfumes" <${process.env.EMAIL_USER || "info.bilalyousaf12@gmail.com"}>`,
        to: customerEmail,
        subject: `${statusContent.icon} Order Update: Your BY12 Order #${orderId} is now ${newStatus}`,
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
                    
                    <!-- Status Icon & Message -->
                    <tr>
                      <td style="padding: 40px 30px 20px; text-align: center;">
                        <div style="width: 80px; height: 80px; background: ${statusContent.bgColor}; border-radius: 50%; margin: 0 auto 20px; line-height: 80px;">
                          <span style="font-size: 40px;">${statusContent.icon}</span>
                        </div>
                        <h2 style="color: ${statusContent.color}; font-size: 26px; margin: 0 0 15px;">${statusContent.title}</h2>
                        <p style="color: #94a3b8; font-size: 16px; margin: 0; line-height: 1.6;">${statusContent.message}</p>
                      </td>
                    </tr>
                    
                    <!-- Timeline Info -->
                    ${statusContent.timeline ? `
                    <tr>
                      <td style="padding: 0 30px 20px; text-align: center;">
                        <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; padding: 15px;">
                          <p style="color: #d4af37; font-size: 14px; margin: 0; font-weight: 500;">${statusContent.timeline}</p>
                        </div>
                      </td>
                    </tr>
                    ` : ''}
                    
                    <!-- Order Info -->
                    <tr>
                      <td style="padding: 0 30px 30px;">
                        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #94a3b8;">Order Number:</span>
                              </td>
                              <td style="padding: 8px 0; text-align: right;">
                                <span style="color: #d4af37; font-weight: bold;">#${orderId}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #94a3b8;">Status Updated:</span>
                              </td>
                              <td style="padding: 8px 0; text-align: right;">
                                <span style="color: #ffffff;">${updateDate}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #94a3b8;">New Status:</span>
                              </td>
                              <td style="padding: 8px 0; text-align: right;">
                                <span style="color: ${statusContent.color}; font-weight: bold; text-transform: uppercase;">${newStatus}</span>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Order Items -->
                    <tr>
                      <td style="padding: 0 30px 30px;">
                        <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Order Summary</h3>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr style="background: rgba(255,255,255,0.05);">
                            <th style="padding: 12px 15px; text-align: left; color: #94a3b8; font-weight: 600;">Item</th>
                            <th style="padding: 12px 15px; text-align: center; color: #94a3b8; font-weight: 600;">Qty</th>
                            <th style="padding: 12px 15px; text-align: right; color: #94a3b8; font-weight: 600;">Price</th>
                          </tr>
                          ${itemsHtml}
                        </table>
                        
                        <!-- Total -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px;">
                          <tr>
                            <td style="padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                              <table width="100%">
                                <tr>
                                  <td style="color: #ffffff; font-size: 18px; font-weight: bold;">Total:</td>
                                  <td style="text-align: right; color: #d4af37; font-size: 24px; font-weight: bold;">Rs. ${total.toLocaleString()}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Shipping Address -->
                    <tr>
                      <td style="padding: 0 30px 30px;">
                        <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Shipping Address</h3>
                        <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px;">
                          <p style="color: #ffffff; margin: 0 0 5px; font-weight: 500;">${customerName}</p>
                          <p style="color: #94a3b8; margin: 0 0 5px;">${shippingAddress.street}</p>
                          <p style="color: #94a3b8; margin: 0 0 5px;">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}</p>
                          <p style="color: #94a3b8; margin: 0;">${shippingAddress.country}</p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Track Order Button -->
                    <tr>
                      <td style="padding: 0 30px 30px; text-align: center;">
                        <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                          <tr>
                            <td style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); border-radius: 12px; padding: 15px 40px;">
                              <a href="https://bilalyousaf12.store/track-order" style="color: #0f172a; text-decoration: none; font-weight: bold; font-size: 16px;">Track Your Order</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Help Section -->
                    <tr>
                      <td style="padding: 0 30px 30px;">
                        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; text-align: center;">
                          <p style="color: #94a3b8; font-size: 14px; margin: 0 0 10px;">Need help with your order?</p>
                          <p style="margin: 0;">
                            <a href="mailto:info.bilalyousaf12@gmail.com" style="color: #d4af37; text-decoration: none;">info.bilalyousaf12@gmail.com</a>
                            <span style="color: #64748b; margin: 0 10px;">|</span>
                            <a href="tel:+923115318776" style="color: #d4af37; text-decoration: none;">+92 311 5318776</a>
                          </p>
                        </div>
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
                          <a href="https://bilalyousaf12.store/unsubscribe?email=${encodeURIComponent(customerEmail)}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
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
      console.log(`✅ Order status update email sent to customer: ${customerEmail} (Status: ${newStatus})`)
    } catch (emailError) {
      console.error("Error sending order status update email:", emailError)
      return NextResponse.json(
        { error: "Failed to send status update email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Order status update email sent successfully for status: ${newStatus}`,
    })
  } catch (error) {
    console.error("Order status update email error:", error)
    return NextResponse.json(
      { error: "Failed to send order status update email" },
      { status: 500 }
    )
  }
}
