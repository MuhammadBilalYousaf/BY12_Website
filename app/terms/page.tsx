"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageBreadcrumb from "@/components/page-breadcrumb"
import { FileText, ShoppingBag, CreditCard, Truck, AlertTriangle, Scale, UserX, RefreshCw, AlertCircle } from "lucide-react"
import { FadeInSection, FadeInStagger, FadeInItem } from "@/components/animated-section"

export default function TermsPage() {
  const sections = [
    {
      icon: ShoppingBag,
      title: "Orders & Purchases",
      content: [
        "All orders are subject to availability and confirmation of the order price.",
        "We reserve the right to refuse or cancel any order for any reason, including product availability, errors in pricing, or suspected fraud.",
        "Once your order is placed, you will receive an email confirmation with your order details.",
        "Prices are subject to change without notice. The price charged will be the price at the time of order confirmation.",
        "We only accept orders from Pakistan. International shipping is not available at this time.",
      ],
    },
    {
      icon: CreditCard,
      title: "Payment Terms",
      content: [
        "We accept Cash on Delivery (COD) as our primary payment method.",
        "Full payment is required upon delivery of the order.",
        "For any failed delivery attempts due to non-payment, additional delivery charges may apply.",
        "We reserve the right to verify payment information before processing orders.",
      ],
    },
    {
      icon: Truck,
      title: "Shipping & Delivery",
      content: [
        "We aim to dispatch orders within 1-2 business days of order confirmation.",
        "Standard delivery takes 3-5 business days within Pakistan.",
        "Delivery times are estimates and not guaranteed. Delays may occur due to unforeseen circumstances.",
        "Risk of loss and title for products pass to you upon delivery.",
        "Please ensure someone is available at the delivery address to receive the order.",
      ],
    },
    {
      icon: RefreshCw,
      title: "Returns & Exchanges",
      content: [
        "Products may be returned within 7 days of delivery if unopened and in original packaging.",
        "Opened or used products cannot be returned due to hygiene reasons.",
        "Defective or damaged products will be replaced at no additional cost.",
        "Return shipping costs are the responsibility of the customer unless the product is defective.",
        "Please refer to our Refund Policy for detailed information on refunds.",
      ],
    },
    {
      icon: AlertTriangle,
      title: "Product Information",
      content: [
        "We strive to display accurate product colors and images, but actual products may vary slightly.",
        "Product descriptions are for informational purposes and do not constitute a warranty.",
        "Perfumes contain allergens. Please check ingredients if you have known sensitivities.",
        "Keep perfumes away from direct sunlight and heat to maintain quality.",
        "Products are intended for external use only. Avoid contact with eyes.",
      ],
    },
    {
      icon: Scale,
      title: "Intellectual Property",
      content: [
        "All content on this website, including text, images, logos, and graphics, is the property of BY12 Perfumes.",
        "You may not reproduce, distribute, or use any content without our written permission.",
        "Trademarks and brand names mentioned are the property of their respective owners.",
        "User-submitted content (reviews, photos) may be used by BY12 for marketing purposes.",
      ],
    },
    {
      icon: UserX,
      title: "Account Responsibilities",
      content: [
        "You are responsible for maintaining the confidentiality of your account credentials.",
        "You agree to provide accurate and complete information when creating an account.",
        "You must notify us immediately of any unauthorized use of your account.",
        "We reserve the right to terminate accounts that violate these terms.",
        "You must be at least 18 years old to create an account and make purchases.",
      ],
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <PageBreadcrumb items={[{ label: "Terms of Service" }]} />
        </div>

        {/* Hero Section */}
        <div className="relative py-20 md:py-28 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <FadeInSection delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6 backdrop-blur-sm">
                <FileText className="w-4 h-4 text-accent" />
                <span className="text-accent text-sm font-medium tracking-wide uppercase">Legal Agreement</span>
              </div>
              </FadeInSection>
              <FadeInSection delay={0.2} variant="heading">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Terms of{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent">
                  Service
                </span>
              </h1>
              </FadeInSection>
              <FadeInSection delay={0.3} variant="text">
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                Please read these terms carefully before using our website or making a purchase.
              </p>
              </FadeInSection>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-8">
            <AlertCircle size={16} />
            <span>Last updated: January 29, 2026</span>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-4xl mx-auto px-4 pb-20">
          {/* Introduction */}
          <div
            className="rounded-2xl p-6 md:p-8 mb-8"
            style={{
              background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <p className="text-slate-300 leading-relaxed mb-4">
              Welcome to BY12 Perfumes. These Terms of Service (&quot;Terms&quot;) govern your use of our website 
              and the purchase of products from our online store. By accessing our website or placing an order, 
              you agree to be bound by these Terms.
            </p>
            <p className="text-slate-300 leading-relaxed">
              If you do not agree with any part of these Terms, please do not use our website or services. 
              We reserve the right to modify these Terms at any time, and your continued use of the website 
              constitutes acceptance of any changes.
            </p>
          </div>

          {/* Terms Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div
                key={index}
                className="rounded-2xl p-6 md:p-8"
                style={{
                  background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <section.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-300 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Limitation of Liability */}
          <div
            className="rounded-2xl p-6 md:p-8 mt-6"
            style={{
              background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              BY12 Perfumes shall not be liable for any indirect, incidental, special, consequential, or 
              punitive damages arising from your use of our website or products. Our total liability shall 
              not exceed the amount paid for the specific product giving rise to the claim.
            </p>
            <p className="text-slate-300 leading-relaxed">
              We do not guarantee uninterrupted or error-free operation of our website. We are not responsible 
              for any damages resulting from website downtime or technical issues.
            </p>
          </div>

          {/* Governing Law */}
          <div
            className="rounded-2xl p-6 md:p-8 mt-6"
            style={{
              background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Governing Law</h2>
            <p className="text-slate-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Pakistan. 
              Any disputes arising from these Terms or your use of our services shall be subject to the 
              exclusive jurisdiction of the courts in Lahore, Pakistan.
            </p>
          </div>

          {/* Contact Section */}
          <div
            className="rounded-2xl p-6 md:p-8 mt-6"
            style={{
              background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
            }}
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Questions About These Terms?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-slate-300">
              <p>
                <span className="text-accent font-medium">Email:</span>{" "}
                <a href="mailto:info.bilalyousaf12@gmail.com" className="hover:text-accent transition">
                  info.bilalyousaf12@gmail.com
                </a>
              </p>
              <p>
                <span className="text-accent font-medium">Phone:</span>{" "}
                <a href="tel:+923115318776" className="hover:text-accent transition">
                  +92 311 5318776
                </a>
              </p>
              <p>
                <span className="text-accent font-medium">Address:</span> DHA Phase 8, Eden City, Pakistan
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
