import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-background font-paragraph text-foreground selection:bg-soft-gold/20">
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-[120rem] mx-auto px-6 md:px-20">

          {/* PAGE HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <h1 className="font-heading text-3xl md:text-5xl text-foreground mb-4">
              Shipping & Delivery
            </h1>

            <p className="font-paragraph text-xs md:text-sm text-foreground/70 max-w-xl mx-auto leading-relaxed">
              Information about order processing, crafting timelines, and
              international shipping.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-10 md:space-y-12">

            {/* PROCESSING & CRAFTING */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-heading text-xl md:text-2xl text-foreground mb-4">
                Processing & Crafting Timelines
              </h2>

              <div className="space-y-3 font-paragraph text-xs md:text-sm text-foreground/80 leading-relaxed">
                <p>
                  <strong className="font-heading text-foreground">
                    In-Stock Orders:
                  </strong>{' '}
                  Ready-to-ship corsets are processed and packaged within{' '}
                  <strong>1–3 business days</strong>.
                </p>

                <p>
                  <strong className="font-heading text-foreground">
                    Made-to-Order:
                  </strong>{' '}
                  Corsets tailored to individual measurements require{' '}
                  <strong>10–14 business days</strong> for handcrafted
                  production before dispatch.
                </p>
              </div>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* DELIVERY */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-heading text-xl md:text-2xl text-foreground mb-4">
                Worldwide Delivery
              </h2>

              <div className="space-y-3 font-paragraph text-xs md:text-sm text-foreground/80 leading-relaxed">
                <p>
                  Worldwide shipping is available via tracked international
                  express delivery. Average transit time is{' '}
                  <strong>7–10 business days</strong>, depending on the
                  destination.
                </p>

                <p className="text-foreground/60 text-xs">
                  * A tracking number is provided once the order has been
                  dispatched.
                </p>
              </div>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* PACKAGING */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-heading text-xl md:text-2xl text-foreground mb-4">
                Packaging
              </h2>

              <p className="font-paragraph text-xs md:text-sm text-foreground/80 leading-relaxed">
                Every corset is carefully wrapped in eco-friendly protective
                materials to ensure safe delivery while reducing unnecessary
                packaging waste.
              </p>
            </motion.section>

            <div className="border-t border-foreground/10" />

            {/* CUSTOMS & SUPPORT */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-heading text-xl md:text-2xl text-foreground mb-4">
                Customs & Support
              </h2>

              <p className="font-paragraph text-xs md:text-sm text-foreground/80 leading-relaxed mb-3">
                International orders may be subject to local customs taxes or
                duties upon arrival in the destination country. Any applicable
                charges are the responsibility of the recipient.
              </p>

              <p className="font-paragraph text-xs md:text-sm text-foreground/80">
                For questions regarding delivery or orders, contact:{' '}
                <a
                  href="mailto:23nk.corset@gmail.com"
                  className="text-soft-gold hover:underline font-semibold"
                >
                  23nk.corset@gmail.com
                </a>
                .
              </p>
            </motion.section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
