import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background font-paragraph text-foreground">
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-[120rem] mx-auto px-6 md:px-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h1 className="font-heading text-4xl md:text-6xl text-foreground mb-4 md:mb-6">
              Privacy Policy
            </h1>

            <p className="font-heading text-xs md:text-sm text-soft-gold tracking-widest uppercase">
              Last Updated: August 20, 2026
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">

            {/* 1. INTRODUCTION */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Introduction
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                I23NK respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how information is collected, used, and safeguarded when visiting the website, submitting custom measurements, or ordering handcrafted upcycled garments.
              </p>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 2. INFORMATION WE COLLECT */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Information Collected
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                Personal information is collected only when necessary to communicate, process orders, tailor custom garments, and arrange delivery:
              </p>

              <ul className="list-disc list-inside mt-4 space-y-2 font-heading text-sm md:text-base text-foreground/80">
                <li>
                  <strong>Contact Details:</strong> Full name, country, shipping address, email address, phone/WhatsApp number, or social media handle (Instagram) provided via order forms.
                </li>

                <li>
                  <strong>Tailoring Specifications:</strong> Individual body measurements, fit preferences, and specific garment notes provided for bespoke orders.
                </li>

                <li>
                  <strong>Order & Transaction Records:</strong> Selected items, order history, communication records, and delivery tracking details.
                </li>
              </ul>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 3. USE OF INFORMATION */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Use of Personal Information
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                Collected personal data is utilized strictly for order fulfillment and direct client communication, including:
              </p>

              <ul className="list-disc list-inside mt-4 space-y-2 font-heading text-sm md:text-base text-foreground/80">
                <li>
                  Crafting bespoke garments according to accurate client measurements and design requirements.
                </li>

                <li>
                  Arranging domestic and international logistics through courier and postal services.
                </li>

                <li>
                  Sending order confirmations, production updates, tracking numbers, and customer service notices.
                </li>
              </ul>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 4. DATA PROTECTION & THIRD PARTIES */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Data Sharing & Third Parties
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                Personal information is never sold, leased, or traded to third parties. Data is shared exclusively with necessary service providers involved in business operations:
              </p>

              <ul className="list-disc list-inside mt-4 space-y-2 font-heading text-sm md:text-base text-foreground/80">
                <li>
                  <strong>Shipping & Logistics:</strong> Postal and courier services (including Nova Poshta Global and national postal carriers) to deliver orders.
                </li>

                <li>
                  <strong>Payment Providers:</strong> Secure third-party payment platforms (such as Payoneer) to issue and process invoices.
                </li>

                <li>
                  <strong>Hosting & Security:</strong> Infrastructure providers (such as Cloudflare) to ensure secure website delivery and protect against malicious activity.
                </li>
              </ul>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 5. CUSTOM MEASUREMENTS */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Confidentiality of Measurements
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                Body measurements submitted for custom tailoring are treated with strict confidentiality and are used exclusively to pattern and construct the requested garment.
              </p>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 6. PAYMENT SECURITY */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Payment Security
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                All transactions are processed securely through established payment gateways (including Payoneer payment requests and electronic invoices). I23NK does not directly collect, process, or store credit card numbers, CVV codes, or sensitive banking credentials on its servers.
              </p>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 7. CONTACT */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Contact
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                Questions regarding this Privacy Policy or requests regarding personal data may be directed to{' '}
                <a
                  href="mailto:corset@i23nk.com"
                  className="text-soft-gold hover:text-soft-gold/80 transition-colors underline"
                >
                  corset@i23nk.com
                </a>.
              </p>
            </motion.section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}