import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

export default function TermsConditionsPage() {
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
              Terms & Conditions
            </h1>

            <p className="font-heading text-xs md:text-sm text-soft-gold tracking-widest uppercase">
              Effective Date: August 20, 2026
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">

            {/* 1. BRAND & TRADEMARK DISCLAIMER */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Trademark & Brand Disclaimer
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed mb-4">
                I23NK is an independent, artisanal upcycling studio. All garments displayed and sold are individually handcrafted using authentic, pre-owned vintage textiles and materials acquired through legitimate secondary and resale channels.
              </p>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                I23NK is not affiliated, associated, authorized, endorsed by, or in any way officially connected with any original trademark holders, fashion houses, or brands whose historical insignias or textile patterns may appear on repurposed fabrics. All brand names, trademarks, and logos remain the sole intellectual property of their respective owners.
              </p>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 2. ITEM CONDITION & NATURE OF UPCYCLING */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Item Condition & Upcycled Materials
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed mb-4">
                Due to the nature of reworked vintage materials, every piece is unique. Garments may showcase subtle vintage characteristics, gentle fabric fading, patina, or historical stitch marks inherent to rescued textiles. These distinct attributes reflect the authenticity of upcycling and are not considered manufacturing defects.
              </p>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                Accurate sizing details and high-resolution photographs are provided for each listing. For custom orders, garments are crafted strictly in accordance with measurements provided by the client. I23NK cannot be held responsible for fit discrepancies resulting from inaccurate measurements supplied by the customer.
              </p>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 3. ORDERING & PAYMENT */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Ordering & Payment Terms
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed mb-4">
                Orders are processed upon submission via website forms, electronic invoices, or confirmed direct consultation. 
              </p>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                Payments are securely settled via official payment providers (including Payoneer invoices and checkout links). Production of custom bespoke pieces and dispatch of ready-to-ship inventory begins only after full payment confirmation.
              </p>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 4. RETURNS, DEFECTS & FINAL SALE */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Returns, Exchanges & Damaged Items
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed mb-4">
                <strong>Final Sale Policy:</strong> Due to the exclusive one-of-a-kind and bespoke nature of handcrafted upcycled pieces, all sales are final. We do not accept returns, exchanges, or order cancellations for change of mind, personal style preference, or incorrect customer-provided measurements.
              </p>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed mb-4">
                <strong>Manufacturing Defects & Transit Damage:</strong> In the rare event that an item arrives damaged during transit or possesses an unintended construction defect (excluding normal vintage patina), the client must contact us at{' '}
                <a href="mailto:corset@i23nk.com" className="text-soft-gold underline">
                  corset@i23nk.com
                </a>{' '}
                within <strong>48 hours of delivery</strong>. Inquiries must include order details along with clear unboxing photos and videos demonstrating the issue.
              </p>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                Upon verification, I23NK will offer an appropriate remedy, which may include complimentary repair, store credit, or replacement.
              </p>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 5. SHIPPING & CUSTOMS */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                International Shipping & Customs Duties
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                International shipping is fulfilled via reputable carrier services with tracking provided. International shipments may be subject to customs inspections, import duties, value-added taxes (VAT), or clearance fees imposed by the destination country. The recipient is solely responsible for all applicable local customs charges and import duties.
              </p>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 6. GOVERNING LAW */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Governing Law
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                These Terms and Conditions shall be governed by and interpreted in accordance with the applicable commercial laws governing I23NK.
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
                Contact Information
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                For questions regarding these Terms & Conditions, please contact us at{' '}
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