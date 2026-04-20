"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageBreadcrumb from "@/components/page-breadcrumb"
import { Shield, Lock, Eye, Database, Mail, Cookie, UserCheck, AlertCircle } from "lucide-react"
import { FadeInSection, FadeInStagger, FadeInItem } from "@/components/animated-section"

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        "Personal information (name, email, phone number, shipping address) when you place an order or create an account.",
        "Payment information processed securely through our payment partners.",
        "Browsing data and cookies to improve your shopping experience.",
        "Communication preferences when you subscribe to our newsletter.",
      ],
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        "To process and fulfill your orders, including shipping and delivery.",
        "To communicate with you about your orders, account, or customer service inquiries.",
        "To send promotional emails and newsletters (with your consent).",
        "To improve our website, products, and services based on your feedback and usage patterns.",
        "To prevent fraud and ensure the security of our platform.",
      ],
    },
    {
      icon: Lock,
      title: "Data Protection",
      content: [
        "We use industry-standard SSL encryption to protect your personal data during transmission.",
        "Your payment information is processed through secure, PCI-compliant payment processors.",
        "We limit access to your personal information to employees who need it to perform their jobs.",
        "We regularly review our security practices to ensure your data remains protected.",
      ],
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: [
        "Access: You can request a copy of the personal data we hold about you.",
        "Correction: You can update or correct your personal information at any time.",
        "Deletion: You can request deletion of your account and associated data.",
        "Opt-out: You can unsubscribe from marketing communications at any time.",
      ],
    },
    {
      icon: Cookie,
      title: "Cookies & Tracking",
      content: [
        "We use essential cookies to enable core website functionality.",
        "Analytics cookies help us understand how visitors interact with our website.",
        "Marketing cookies may be used to deliver personalized advertisements.",
        "You can manage cookie preferences through your browser settings.",
      ],
    },
    {
      icon: Mail,
      title: "Third-Party Sharing",
      content: [
        "We share information with shipping carriers to deliver your orders.",
        "Payment processors receive necessary data to process transactions securely.",
        "We may use analytics services to improve our website performance.",
        "We never sell your personal information to third parties for marketing purposes.",
      ],
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <PageBreadcrumb items={[{ label: "Privacy Policy" }]} />
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
                <Shield className="w-4 h-4 text-accent" />
                <span className="text-accent text-sm font-medium tracking-wide uppercase">Your Privacy Matters</span>
              </div>
              </FadeInSection>
              <FadeInSection delay={0.2} variant="heading">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Privacy{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent">
                  Policy
                </span>
              </h1>
              </FadeInSection>
              <FadeInSection delay={0.3} variant="text">
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                We are committed to protecting your privacy and ensuring the security of your personal information.
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
            <p className="text-slate-300 leading-relaxed">
              At BY12 Perfumes, we value your trust and are committed to protecting your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
              you visit our website or make a purchase. Please read this policy carefully to understand our 
              practices regarding your personal data.
            </p>
          </div>

          {/* Policy Sections */}
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

          {/* Data Retention */}
          <div
            className="rounded-2xl p-6 md:p-8 mt-6"
            style={{
              background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Data Retention</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              We retain your personal information for as long as necessary to fulfill the purposes outlined 
              in this Privacy Policy, unless a longer retention period is required by law. When we no longer 
              need your data, we will securely delete or anonymize it.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Order information is retained for a minimum of 5 years for legal and accounting purposes. 
              You may request deletion of your account data at any time by contacting us.
            </p>
          </div>

          {/* Children's Privacy */}
          <div
            className="rounded-2xl p-6 md:p-8 mt-6"
            style={{
              background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Children&apos;s Privacy</h2>
            <p className="text-slate-300 leading-relaxed">
              Our website is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children. If you are a parent or guardian and believe your child 
              has provided us with personal information, please contact us immediately.
            </p>
          </div>

          {/* Policy Updates */}
          <div
            className="rounded-2xl p-6 md:p-8 mt-6"
            style={{
              background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Policy Updates</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or 
              for legal, operational, or regulatory reasons. We will notify you of any material changes 
              by posting the updated policy on this page with a new &quot;Last Updated&quot; date.
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
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
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
