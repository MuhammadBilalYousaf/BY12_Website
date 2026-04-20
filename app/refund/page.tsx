"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageBreadcrumb from "@/components/page-breadcrumb"
import { RotateCcw, Package, Clock, CheckCircle, XCircle, AlertTriangle, CreditCard, HelpCircle, AlertCircle } from "lucide-react"
import { FadeInSection } from "@/components/animated-section"

export default function RefundPage() {
  const eligibleItems = [
    "Unopened products in original sealed packaging",
    "Products received damaged or defective",
    "Wrong product delivered",
    "Products with manufacturing defects",
    "Items that don't match the website description",
  ]

  const nonEligibleItems = [
    "Opened or used perfumes (due to hygiene reasons)",
    "Products without original packaging",
    "Items damaged due to customer mishandling",
    "Products returned after 7 days of delivery",
    "Gift cards or promotional items",
    "Products marked as 'Final Sale' or 'Non-Returnable'",
  ]

  const refundProcess = [
    {
      step: 1,
      title: "Contact Us",
      description: "Email us at info.bilalyousaf12@gmail.com or call +92 311 5318776 within 7 days of receiving your order.",
    },
    {
      step: 2,
      title: "Provide Details",
      description: "Share your order number, reason for return, and photos of the product (if damaged/defective).",
    },
    {
      step: 3,
      title: "Approval",
      description: "We'll review your request and respond within 24-48 hours with return instructions if approved.",
    },
    {
      step: 4,
      title: "Ship the Product",
      description: "Pack the item securely in its original packaging and ship it to our address. Keep the tracking number.",
    },
    {
      step: 5,
      title: "Inspection",
      description: "Once received, we'll inspect the product within 2-3 business days.",
    },
    {
      step: 6,
      title: "Refund Processed",
      description: "If approved, your refund will be processed within 5-7 business days via your original payment method or bank transfer.",
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <PageBreadcrumb items={[{ label: "Refund Policy" }]} />
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
                <RotateCcw className="w-4 h-4 text-accent" />
                <span className="text-accent text-sm font-medium tracking-wide uppercase">Easy Returns</span>
              </div>
              </FadeInSection>
              <FadeInSection delay={0.2} variant="heading">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Refund{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent">
                  Policy
                </span>
              </h1>
              </FadeInSection>
              <FadeInSection delay={0.3} variant="text">
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                We want you to be completely satisfied with your purchase. Learn about our hassle-free return and refund process.
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
          {/* Return Window */}
          <div
            className="rounded-2xl p-6 md:p-8 mb-8"
            style={{
              background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-accent/20 rounded-xl">
                <Clock className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">7-Day Return Window</h2>
                <p className="text-slate-400">From the date of delivery</p>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed">
              You have 7 days from the date of delivery to initiate a return request. Please ensure the product 
              is in its original condition with all packaging intact.
            </p>
          </div>

          {/* Eligible & Non-Eligible Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Eligible */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(145deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-white">Eligible for Return</h3>
              </div>
              <ul className="space-y-3">
                {eligibleItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Non-Eligible */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-white">Not Eligible for Return</h3>
              </div>
              <ul className="space-y-3">
                {nonEligibleItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Refund Process */}
          <div
            className="rounded-2xl p-6 md:p-8 mb-8"
            style={{
              background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Package className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">How to Request a Refund</h2>
            </div>
            
            <div className="space-y-6">
              {refundProcess.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-accent font-bold">{step.step}</span>
                    </div>
                    {index < refundProcess.length - 1 && (
                      <div className="w-px h-full bg-accent/20 mx-auto mt-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                    <p className="text-slate-400 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Refund Methods */}
          <div
            className="rounded-2xl p-6 md:p-8 mb-8"
            style={{
              background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent/20 rounded-lg">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Refund Methods</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>
                <span className="text-white font-medium">Bank Transfer:</span> Refunds will be credited to your 
                provided bank account within 5-7 business days after approval.
              </p>
              <p>
                <span className="text-white font-medium">Store Credit:</span> Alternatively, you can opt for store 
                credit which can be used for future purchases. Store credits are issued immediately upon approval.
              </p>
              <p>
                <span className="text-white font-medium">Exchange:</span> If you prefer, we can exchange the product 
                for a different item of equal or lesser value. You&apos;ll pay the difference for higher-priced items.
              </p>
            </div>
          </div>

          {/* Shipping Costs */}
          <div
            className="rounded-2xl p-6 md:p-8 mb-8"
            style={{
              background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Important Notes</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                <span className="text-slate-300">
                  <span className="text-white font-medium">Return Shipping:</span> Customers are responsible for 
                  return shipping costs unless the product is defective or we made an error.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                <span className="text-slate-300">
                  <span className="text-white font-medium">Original Packaging:</span> Please return items in their 
                  original packaging with all tags and accessories included.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                <span className="text-slate-300">
                  <span className="text-white font-medium">Inspection Required:</span> All returned items will be 
                  inspected before the refund is processed.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                <span className="text-slate-300">
                  <span className="text-white font-medium">Partial Refunds:</span> In some cases, partial refunds may 
                  be issued if the product shows signs of use or missing components.
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div
            className="rounded-2xl p-6 md:p-8"
            style={{
              background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent/20 rounded-lg">
                <HelpCircle className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Need Help with a Return?</h2>
            </div>
            <p className="text-slate-300 leading-relaxed mb-4">
              Our customer support team is here to help you with any questions about returns or refunds.
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
                <span className="text-accent font-medium">WhatsApp:</span>{" "}
                <a href="https://wa.me/923115318776" className="hover:text-accent transition">
                  +92 311 5318776
                </a>
              </p>
              <p className="text-slate-400 text-sm mt-4">
                Response time: Within 24 hours on business days
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
