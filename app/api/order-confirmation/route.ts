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

interface OrderData {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount?: number
  total: number
  paymentMethod: string
  appliedCoupon?: string
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json()

    const {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      subtotal,
      shipping,
      tax,
      discount = 0,
      total,
      paymentMethod,
      appliedCoupon,
    } = orderData

    // Validation
    if (!customerEmail || !orderId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required order information" },
        { status: 400 }
      )
    }

    // Generate order items HTML
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; align-items: center;">
              <span style="color: #ffffff; font-weight: 500;">${item.name}</span>
            </div>
          </td>
          <td style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: center; color: #94a3b8;">
            ${item.quantity}
          </td>
          <td style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; color: #d4af37; font-weight: 600;">
            Rs. ${(item.price * item.quantity).toLocaleString()}
          </td>
        </tr>
      `
      )
      .join("")

    const orderDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Send order confirmation email to customer
    try {
      await transporter.sendMail({
        from: `"BY12 Perfumes" <${process.env.EMAIL_USER || "info.bilalyousaf12@gmail.com"}>`,
        to: customerEmail,
        subject: `Order Confirmed! 🎉 Your BY12 Order #${orderId}`,
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
                    
                    <!-- Success Icon & Message -->
                    <tr>
                      <td style="padding: 40px 30px 20px; text-align: center;">
                        <div style="width: 80px; height: 80px; background: rgba(34, 197, 94, 0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                          <span style="font-size: 40px;">✅</span>
                        </div>
                        <h2 style="color: #22c55e; font-size: 28px; margin: 0 0 10px;">Order Confirmed!</h2>
                        <p style="color: #94a3b8; font-size: 16px; margin: 0;">Thank you for your purchase, ${customerName.split(" ")[0]}!</p>
                      </td>
                    </tr>
                    
                    <!-- Order Info -->
                    <tr>
                      <td style="padding: 0 30px 30px;">
                        <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 20px;">
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
                                <span style="color: #94a3b8;">Order Date:</span>
                              </td>
                              <td style="padding: 8px 0; text-align: right;">
                                <span style="color: #ffffff;">${orderDate}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #94a3b8;">Payment Method:</span>
                              </td>
                              <td style="padding: 8px 0; text-align: right;">
                                <span style="color: #ffffff;">${paymentMethod}</span>
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
                        
                        <!-- Totals -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                          <tr>
                            <td style="padding: 8px 0; color: #94a3b8;">Subtotal:</td>
                            <td style="padding: 8px 0; text-align: right; color: #ffffff;">Rs. ${subtotal.toLocaleString()}</td>
                          </tr>
                          ${
                            discount > 0
                              ? `
                          <tr>
                            <td style="padding: 8px 0; color: #22c55e;">Discount ${appliedCoupon ? `(${appliedCoupon})` : ""}:</td>
                            <td style="padding: 8px 0; text-align: right; color: #22c55e;">- Rs. ${discount.toLocaleString()}</td>
                          </tr>
                          `
                              : ""
                          }
                          <tr>
                            <td style="padding: 8px 0; color: #94a3b8;">Shipping:</td>
                            <td style="padding: 8px 0; text-align: right; color: #ffffff;">Rs. ${shipping.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
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
                          <p style="color: #94a3b8; margin: 0 0 5px;">${shippingAddress.country}</p>
                          <p style="color: #94a3b8; margin: 0;">Phone: ${customerPhone}</p>
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
      console.log("✅ Order confirmation email sent to customer:", customerEmail)
    } catch (emailError) {
      console.error("Error sending customer confirmation email:", emailError)
    }

    // Send notification email to admin
    try {
      await transporter.sendMail({
        from: `"BY12 Website" <${process.env.EMAIL_USER || "info.bilalyousaf12@gmail.com"}>`,
        to: process.env.EMAIL_USER || "info.bilalyousaf12@gmail.com",
        subject: `🛒 New Order Received! #${orderId} - Rs. ${total.toLocaleString()}`,
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
                        <h1 style="margin: 0; color: #d4af37; font-size: 22px; font-weight: bold;">🛒 New Order Received!</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 30px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                              <strong style="color: #374151;">Order ID:</strong>
                              <span style="color: #d4af37; font-weight: bold; float: right;">#${orderId}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                              <strong style="color: #374151;">Customer:</strong>
                              <span style="color: #6b7280; float: right;">${customerName}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                              <strong style="color: #374151;">Email:</strong>
                              <a href="mailto:${customerEmail}" style="color: #d4af37; text-decoration: none; float: right;">${customerEmail}</a>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                              <strong style="color: #374151;">Phone:</strong>
                              <span style="color: #6b7280; float: right;">${customerPhone}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                              <strong style="color: #374151;">Payment:</strong>
                              <span style="color: #6b7280; float: right;">${paymentMethod}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                              <strong style="color: #374151;">Items:</strong>
                              <span style="color: #6b7280; float: right;">${items.length} product(s)</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0;">
                              <strong style="color: #374151;">Total Amount:</strong>
                              <span style="color: #22c55e; font-weight: bold; font-size: 18px; float: right;">Rs. ${total.toLocaleString()}</span>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Items List -->
                        <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
                          <strong style="color: #374151; display: block; margin-bottom: 10px;">Order Items:</strong>
                          ${items
                            .map(
                              (item) => `
                            <div style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                              <span style="color: #374151;">${item.name}</span>
                              <span style="color: #6b7280; float: right;">x${item.quantity} - Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          `
                            )
                            .join("")}
                        </div>
                        
                        <!-- Shipping Address -->
                        <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
                          <strong style="color: #374151; display: block; margin-bottom: 10px;">Shipping Address:</strong>
                          <p style="color: #6b7280; margin: 0; line-height: 1.6;">
                            ${shippingAddress.street}<br>
                            ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
                            ${shippingAddress.country}
                          </p>
                        </div>
                        
                        <!-- View Order Button -->
                        <table cellpadding="0" cellspacing="0" style="margin: 25px 0 0;">
                          <tr>
                            <td style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); border-radius: 8px; padding: 12px 25px;">
                              <a href="https://bilalyousaf12.store/admin/orders" style="color: #0f172a; text-decoration: none; font-weight: bold; font-size: 14px;">View in Admin Portal</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                          Order received on ${orderDate}
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
      console.log("✅ Order notification email sent to admin")
    } catch (emailError) {
      console.error("Error sending admin notification email:", emailError)
    }

    return NextResponse.json({
      success: true,
      message: "Order confirmation emails sent successfully",
    })
  } catch (error) {
    console.error("Order confirmation email error:", error)
    return NextResponse.json(
      { error: "Failed to send order confirmation email" },
      { status: 500 }
    )
  }
}
