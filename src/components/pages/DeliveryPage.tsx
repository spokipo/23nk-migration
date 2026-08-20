import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { Clock, Globe, PackageOpen, HelpCircle } from 'lucide-react';

export default function DeliveryPage() {
  const deliveryItems = [
    {
      icon: <Clock className="w-6 h-6 text-soft-gold" />,
      title: "Processing & Crafting",
      content: (
        <div className="space-y-3 font-paragraph text-xs sm:text-sm text-foreground/80 leading-relaxed">
          <p>
            <strong className="font-heading text-foreground">In-Stock Orders:</strong> Ready-to-ship corsets are processed and packaged within <strong>1–3 business days</strong>.
          </p>
          <p>
            <strong className="font-heading text-foreground">Made-to-Order:</strong> Corsets tailored to individual measurements require <strong>10–14 business days</strong> for handcrafted production before dispatch.
          </p>
        </div>
      )
    },
    {
      icon: <Globe className="w-6 h-6 text-soft-gold" />,
      title: "Worldwide Delivery",
      content: (
        <div className="space-y-3 font-paragraph text-xs sm:text-sm text-foreground/80 leading-relaxed">
          <p>
            Worldwide shipping is available via tracked international express delivery. Average transit time is <strong>7–10 business days</strong>, depending on the destination.
          </p>
          <p className="text-foreground/60 text-xs italic mt-4 block">
            * A tracking number is provided once the order has been dispatched.
          </p>
        </div>
      )
    },
    {
      icon: <PackageOpen className="w-6 h-6 text-soft-gold" />,
      title: "Eco-Conscious Packaging",
      content: (
        <p className="font-paragraph text-xs sm:text-sm text-foreground/80 leading-relaxed">
          Every piece is carefully wrapped in eco-friendly protective materials. This ensures safe delivery while significantly reducing unnecessary packaging waste.
        </p>
      )
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-soft-gold" />,
      title: "Customs & Support",
      content: (
        <div className="space-y-3 font-paragraph text-xs sm:text-sm text-foreground/80 leading-relaxed">
          <p>
            International orders may be subject to local customs taxes or duties upon arrival. Any applicable charges are the responsibility of the recipient.
          </p>
          <p>
            For delivery questions: <br/>
            <a href="mailto:corset@i23nk.com" className="text-soft-gold hover:underline font-semibold mt-1 inline-block">
              corset@i23nk.com
            </a>
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background font-paragraph text-foreground selection:bg-soft-gold/20 flex flex-col">
      <Header />

      <main className="flex-1 py-12 md:py-24">
        <div className="max-w-[120rem] mx-auto px-6 md:px-20">

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16 md:mb-20"
          >
            <h1 className="font-heading text-3xl md:text-5xl text-foreground mb-4">
              Shipping & Delivery
            </h1>
            <p className="font-paragraph text-xs md:text-sm text-foreground/70 max-w-xl mx-auto leading-relaxed">
              Information about order processing, crafting timelines, and safe international shipping directly to your door.
            </p>
          </motion.div>

          {/* Grid Layout instead of stacked text */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {deliveryItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-ivory p-8 md:p-10 rounded-2xl shadow-sm border border-foreground/5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shadow-sm border border-foreground/5">
                    {item.icon}
                  </div>
                  <h2 className="font-heading text-lg md:text-xl text-foreground">
                    {item.title}
                  </h2>
                </div>
                {item.content}
              </motion.div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}