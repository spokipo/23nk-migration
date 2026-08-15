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
              Last Updated: August 15, 2026
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
                23NK respects the privacy of its customers and website visitors. This Privacy Policy explains how personal information is collected, used, and safeguarded when visiting the website, submitting custom measurements, or ordering upcycled garments.
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
                Personal information may be collected when necessary to process orders, create custom garments, and arrange delivery:
              </p>

              <ul className="list-disc list-inside mt-4 space-y-2 font-heading text-sm md:text-base text-foreground/80">
                <li>
                  <strong>Contact details:</strong> Name, shipping address, email address, and phone number for order communication and delivery.
                </li>

                <li>
                  <strong>Custom Tailoring Specifications:</strong> Individual body measurements and other sizing information provided for bespoke tailoring.
                </li>

                <li>
                  <strong>Order Information:</strong> Product details, order specifications, payment-related information, and shipping information necessary to process and fulfill an order.
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
                Personal information is used solely for purposes related to the customer's order and communication, including:
              </p>

              <ul className="list-disc list-inside mt-4 space-y-2 font-heading text-sm md:text-base text-foreground/80">
                <li>
                  Creating custom-tailored garments according to the customer's measurements and specifications.
                </li>

                <li>
                  Processing orders and arranging domestic or international shipping.
                </li>

                <li>
                  Providing shipping and tracking information.
                </li>

                <li>
                  Communicating with customers regarding orders, measurements, production, and delivery.
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
                Data Protection & Third Parties
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                Personal information is not sold, traded, or rented to third parties. Information may be shared only when necessary to provide requested services, such as postal services, courier companies, shipping providers, or other service providers involved in order fulfillment and delivery.
              </p>
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
                Custom Measurements
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                Body measurements submitted for custom tailoring are treated as confidential customer information and are used solely for the purpose of creating the requested garment and communicating about the related order.
              </p>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 6. PAYMENT INFORMATION */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Payment Information
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                Payment details may be exchanged directly between the customer and 23NK using the payment method agreed upon for the order. Full payment card numbers, security codes, and other sensitive payment credentials are not intentionally stored by 23NK.
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
                Questions regarding this Privacy Policy or personal information may be directed to{' '}
                <a
                  href="mailto:23nk.corset@gmail.com"
                  className="text-soft-gold hover:text-soft-gold/80 transition-colors"
                >
                  23nk.corset@gmail.com
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
