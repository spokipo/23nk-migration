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
              Effective Date: August 15, 2026
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
                I23NK is an independent, artisanal upcycling brand. All garments created and displayed on the website are individually handcrafted using authentic pre-owned (second-hand) vintage clothing, textiles, and materials acquired through legitimate resale and second-hand channels.
              </p>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                I23NK is not affiliated, associated, authorized, endorsed by, or in any way officially connected with any of the original brand owners, fashion houses, or trademark holders whose logos, patterns, or other brand elements may be visible on upcycled pieces. Any visible logos or brand elements are part of the original repurposed material and do not indicate any affiliation, authorization, endorsement, or collaboration with the respective trademark owners. All brand names and trademarks remain the sole property of their respective owners.
              </p>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 2. CUSTOM TAILORING & ITEM CONDITION */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Custom Tailoring & Item Condition
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed mb-4">
                All garments in the collection, including in-stock and custom-made pieces, are individually handcrafted from pre-owned and repurposed textiles. Each piece is unique and may feature minor variations, signs of previous use, natural wear, fabric irregularities, or other vintage characteristics inherent to pre-owned materials. Such characteristics are an integral part of upcycled fashion and are not considered defects.
              </p>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed mb-4">
                Product descriptions, photographs, measurements, and other information provided for each item form part of the item's presentation and should be reviewed carefully before placing an order.
              </p>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                For custom-tailored orders, measurements must be provided accurately by the customer. I23NK is not responsible for improper fit resulting from inaccurate or incorrectly submitted measurements.
              </p>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 3. CUSTOM ORDERS */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Custom Orders
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed mb-4">
                Custom-made garments are produced specifically according to the customer's measurements, specifications, and approved design details. Once a custom order has been confirmed and production has begun, the order cannot be cancelled due to a change of mind or personal preference.
              </p>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                The customer is responsible for providing accurate measurements and all relevant information required for production. Any additional alterations requested after production has begun may be subject to additional charges and availability.
              </p>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 4. RETURNS & CANCELLATIONS */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Returns & Cancellations Policy
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed mb-4">
                All sales are final. Returns, exchanges, and refunds are not accepted for change of mind, personal preference, sizing preference, or characteristics inherent to pre-owned and upcycled materials.
              </p>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed mb-4">
                Custom-made garments are not eligible for return or exchange due to incorrect measurements supplied by the customer, changes in personal preference, or dissatisfaction with the fit resulting from inaccurate measurement information.
              </p>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                By placing an order through direct consultation, direct messaging, email, or the website, the customer confirms acceptance of these Final Sale conditions.
              </p>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 5. ORDERING & PAYMENT */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Ordering & Payment Terms
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                Orders may be arranged through direct consultation, email, direct messaging, or other communication channels designated by I23NK. Order details, including measurements, specifications, pricing, and other relevant information, should be confirmed by the customer before payment. Production of custom-tailored garments begins only after payment has been confirmed.
              </p>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 6. SHIPPING & CUSTOMS */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                International Shipping & Customs
              </h2>

              <p className="font-heading text-sm md:text-base text-foreground/80 leading-relaxed">
                International shipping is available. International orders may be subject to import duties, taxes, customs fees, or other charges imposed by the destination country. Unless otherwise agreed in writing, the recipient is solely responsible for all applicable local duties, taxes, and customs charges.
              </p>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 7. GOVERNING LAW */}
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
                These Terms and Conditions shall be governed by and construed in accordance with the applicable laws governing I23NK and its commercial activities.
              </p>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* 8. CONTACT */}
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
                Questions regarding these Terms & Conditions may be directed to{' '}
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
