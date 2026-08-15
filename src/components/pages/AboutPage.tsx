import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Leaf, Heart, Sparkles, Recycle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-20">
        <div className="max-w-[120rem] mx-auto px-20">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h1 className="font-heading text-6xl text-foreground mb-6">Our Story</h1>
            <p className="font-paragraph text-xl text-foreground/80 max-w-3xl mx-auto">
              Where Parisian elegance meets sustainable fashion
            </p>
          </motion.div>

          {/* Brand Story */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-4xl text-foreground mb-8 text-center">
                The Art of Upcycling
              </h2>
              <div className="space-y-6 font-paragraph text-base text-foreground/80 leading-relaxed">
                <p>
                  Upcycle Corsets was born from a passion for sustainable fashion and a love for timeless elegance. We believe that luxury and environmental responsibility are not mutually exclusive—they are essential partners in creating a better future for fashion.
                </p>
                <p>
                  Each corset in our collection is a testament to the beauty that can emerge from conscious creation. We carefully source recycled materials, transforming them into unique pieces that celebrate both craftsmanship and sustainability. Our atelier in Paris is where tradition meets innovation, where every stitch is placed with intention and care.
                </p>
                <p>
                  We don't just create corsets; we craft wearable art that tells a story of transformation. Every piece is one-of-a-kind, reflecting the unique character of the materials we rescue and reimagine. This is fashion with a conscience, luxury with a purpose.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Horizontal Line Separator */}
          <div className="border-t border-foreground/10 mb-20"></div>

          {/* Values Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <h2 className="font-heading text-4xl text-foreground mb-12 text-center">
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-8 bg-secondary rounded-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-soft-gold/20 rounded-full mb-6">
                  <Recycle className="text-soft-gold" size={32} />
                </div>
                <h3 className="font-heading text-2xl text-foreground mb-4">Sustainability</h3>
                <p className="font-paragraph text-base text-foreground/80">
                  100% recycled materials in every piece, reducing fashion waste and environmental impact.
                </p>
              </div>

              <div className="text-center p-8 bg-secondary rounded-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-soft-gold/20 rounded-full mb-6">
                  <Heart className="text-soft-gold" size={32} />
                </div>
                <h3 className="font-heading text-2xl text-foreground mb-4">Craftsmanship</h3>
                <p className="font-paragraph text-base text-foreground/80">
                  Each corset is meticulously handcrafted with attention to detail and traditional techniques.
                </p>
              </div>

              <div className="text-center p-8 bg-secondary rounded-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-soft-gold/20 rounded-full mb-6">
                  <Sparkles className="text-soft-gold" size={32} />
                </div>
                <h3 className="font-heading text-2xl text-foreground mb-4">Uniqueness</h3>
                <p className="font-paragraph text-base text-foreground/80">
                  No two pieces are alike—each corset is a unique work of art with its own character.
                </p>
              </div>

              <div className="text-center p-8 bg-secondary rounded-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-soft-gold/20 rounded-full mb-6">
                  <Leaf className="text-soft-gold" size={32} />
                </div>
                <h3 className="font-heading text-2xl text-foreground mb-4">Eco-Conscious</h3>
                <p className="font-paragraph text-base text-foreground/80">
                  Zero-waste production process, ensuring every material is valued and utilized.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Horizontal Line Separator */}
          <div className="border-t border-foreground/10 mb-20"></div>

          {/* Mission Statement */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-heading text-4xl text-foreground mb-8">Our Mission</h2>
              <p className="font-paragraph text-lg text-foreground/80 leading-relaxed mb-8">
                To redefine luxury fashion by proving that sustainability and elegance are inseparable. We are committed to creating beautiful, high-quality corsets that honor both the artisan's craft and our planet's future.
              </p>
              <div className="p-8 bg-blush-pink/30 rounded-lg">
                <p className="font-heading text-2xl text-soft-gold italic">
                  "Fashion fades, but style—and sustainability—are eternal."
                </p>
              </div>
            </div>
          </motion.section>

          {/* Horizontal Line Separator */}
          <div className="border-t border-foreground/10 mb-20"></div>

          {/* Process Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-4xl text-foreground mb-12 text-center">
              Our Process
            </h2>
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="font-heading text-5xl text-soft-gold mb-4">01</div>
                <h3 className="font-heading text-2xl text-foreground mb-4">Source</h3>
                <p className="font-paragraph text-base text-foreground/80">
                  We carefully select high-quality recycled materials, ensuring each fabric meets our standards for beauty and durability.
                </p>
              </div>

              <div className="text-center">
                <div className="font-heading text-5xl text-soft-gold mb-4">02</div>
                <h3 className="font-heading text-2xl text-foreground mb-4">Craft</h3>
                <p className="font-paragraph text-base text-foreground/80">
                  Our artisans handcraft each corset using traditional techniques, paying meticulous attention to every detail.
                </p>
              </div>

              <div className="text-center">
                <div className="font-heading text-5xl text-soft-gold mb-4">03</div>
                <h3 className="font-heading text-2xl text-foreground mb-4">Deliver</h3>
                <p className="font-paragraph text-base text-foreground/80">
                  Each unique piece is carefully packaged and delivered, ready to become a cherished part of your wardrobe.
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
