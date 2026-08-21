import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Products } from '@/entities';
import { BaseCrudService } from '@/integrations';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOptimizedWixImage } from '@/lib/imageUtils';

interface Collection {
  _id: string;
  name?: string;
  image?: string;
  slug?: string;
}

interface ImageObject {
  url?: string;
  src?: string;
}

interface Review {
  _id: string;
  name?: string;
  reviewImage?: string | ImageObject;
  ReviewImage?: string | ImageObject;
  image?: string | ImageObject;
  photo?: string | ImageObject;
  src?: string | ImageObject;
  _createdDate?: Date;
  createdAt?: Date;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Products[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reviewsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsRes, collectionsRes, reviewsRes] = await Promise.allSettled([
          BaseCrudService.getAll<Products>('products'),
          BaseCrudService.getAll<Collection>('collections', {}, { limit: 4 }),
          BaseCrudService.getAll<Review>('reviews'),
        ]);

        if (!isMounted) return;

        if (productsRes.status === 'fulfilled' && productsRes.value?.items) {
          const readyToShip = productsRes.value.items
            .filter((product) => product.inStock === true)
            .slice(0, 6);
          setFeaturedProducts(readyToShip);
        }

        if (collectionsRes.status === 'fulfilled' && collectionsRes.value?.items) {
          setCollections(collectionsRes.value.items);
        }

        if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.items?.length) {
          const allReviews = reviewsRes.value.items;
          
          const latestReviews = [...allReviews]
            .sort((a, b) => {
              const dateA = new Date(a._createdDate || a.createdAt || 0).getTime();
              const dateB = new Date(b._createdDate || b.createdAt || 0).getTime();
              return dateB - dateA; 
            })
            .slice(0, 5);

          setReviews(latestReviews);
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const scrollContainer = reviewsScrollRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && e.deltaX === 0) {
        const atLeftEdge = scrollContainer.scrollLeft <= 0;
        const atRightEdge = 
          scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 1;

        if ((e.deltaY < 0 && atLeftEdge) || (e.deltaY > 0 && atRightEdge)) {
          return; 
        }

        e.preventDefault();
        scrollContainer.scrollBy({
          left: e.deltaY * 2,
          behavior: 'auto', 
        });
      }
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const getReviewImageUrl = (review: Review): string => {
    const rawImage =
      review.reviewImage ||
      review.ReviewImage ||
      review.image ||
      review.photo ||
      review.src;

    if (typeof rawImage === 'string') {
      return rawImage;
    }

    if (typeof rawImage === 'object' && rawImage !== null) {
      return rawImage.url || rawImage.src || '';
    }

    return '';
  };

  return (
    <div className="min-h-screen bg-background font-paragraph text-foreground selection:bg-soft-gold/20">
      <Header />

      {/* HERO */}
      <section className="relative w-full h-[58vh] sm:h-[75vh] min-h-[420px] max-h-[850px] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.webp#originWidth=1170&originHeight=1337"
            width={1920}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-6"
        >
          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl text-ivory tracking-wide leading-tight drop-shadow-lg">
            Upcycled Corsets
          </h1>

          <Link to="/catalog">
            <Button className="bg-ivory text-foreground hover:bg-soft-gold hover:text-white rounded-full px-8 py-3.5 text-xs sm:text-sm tracking-[0.2em] font-heading uppercase transition-all duration-300 shadow-xl">
              View Catalog
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* VALUE PROPOSITION */}
      <section className="border-b border-foreground/5 bg-ivory/50 py-8">
        <div className="max-w-[120rem] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6 text-soft-gold" />
            <h4 className="font-heading text-xs md:text-sm tracking-wider uppercase text-foreground">
              Upcycled & Unique
            </h4>
            <p className="text-xs text-foreground/60 max-w-xs leading-relaxed">
              Each corset is handcrafted from vintage and rescued materials, making every piece unique.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-soft-gold" />
            <h4 className="font-heading text-xs md:text-sm tracking-wider uppercase text-foreground">
              Tailored Fit
            </h4>
            <p className="text-xs text-foreground/60 max-w-xs leading-relaxed">
              Custom sizing and material options are available for a personalized fit.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Truck className="w-6 h-6 text-soft-gold" />
            <h4 className="font-heading text-xs md:text-sm tracking-wider uppercase text-foreground">
              Worldwide Delivery
            </h4>
            <p className="text-xs text-foreground/60 max-w-xs leading-relaxed">
              Carefully packed and shipped safely to destinations worldwide.
            </p>
          </div>
        </div>
      </section>

      <div className="bg-background">
        {/* 1. READY TO SHIP */}
        {(isLoading || featuredProducts.length > 0) && (
          <section className="py-12 md:py-20">
            <div className="max-w-[120rem] mx-auto px-4 sm:px-6 md:px-12">
              <div className="text-center mb-8 md:mb-14">
                <h2 className="font-heading text-3xl md:text-5xl text-foreground">
                  Ready to Ship
                </h2>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8 mb-10">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col animate-pulse">
                      <div className="bg-foreground/5 rounded-xl aspect-[3/4] mb-2.5 w-full shadow-sm"></div>
                      <div className="h-4 bg-foreground/5 rounded w-3/4 mt-1 mb-2"></div>
                      <div className="h-3 bg-foreground/5 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8 mb-10">
                    {featuredProducts.map((product, index) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      >
                        <Link to={`/product/${product._id}`} className="group block relative">
                          <div className="bg-ivory rounded-xl overflow-hidden mb-2 sm:mb-3 aspect-[3/4] shadow-sm transition-all duration-500 group-hover:shadow-md relative">
                            <Image
                              src={getOptimizedWixImage(product.mainImage, 600, 600) || ''} 
                              alt={product.name || 'Corset'}
                              width={600}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-2.5 right-2.5 bg-soft-gold text-ivory px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-heading font-semibold shadow-sm">
                              Ready to Ship
                            </div>
                          </div>
                          
                          <div className="flex flex-col">
                            <div className="min-h-[2.5rem] md:min-h-[2.8rem] flex items-start">
                              <h3 className="font-heading text-xs sm:text-base text-foreground group-hover:text-soft-gold transition-colors line-clamp-2 leading-tight">
                                {product.name}
                              </h3>
                            </div>
                            <p className="font-heading text-xs sm:text-sm text-soft-gold font-bold mt-1">
                              ${product.price?.toFixed(2)}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  <div className="text-center">
                    <Link
                      to="/catalog?collection=ready-to-ship"
                      className="inline-block font-heading text-xs md:text-sm text-foreground/70 hover:text-soft-gold transition-colors tracking-widest uppercase border-b border-foreground/20 pb-1 hover:border-soft-gold"
                    >
                      View All Ready to Ship →
                    </Link>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* 2. COLLECTIONS */}
        <section className="py-12 md:py-20 border-t border-foreground/5">
          <div className="max-w-[120rem] mx-auto px-4 sm:px-6 md:px-12">
            <div className="text-center mb-8 md:mb-14">
              <h2 className="font-heading text-3xl md:text-5xl text-foreground">
                Collections
              </h2>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10 max-w-6xl mx-auto">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse flex flex-col items-center">
                    <div className="bg-foreground/5 rounded-2xl w-full aspect-square mb-3 shadow-sm"></div>
                    <div className="h-5 bg-foreground/5 rounded w-1/3 mt-1"></div>
                  </div>
                ))}
              </div>
            ) : collections.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10 max-w-6xl mx-auto">
                {collections.map((collection, index) => (
                  <motion.div
                    key={collection._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Link to={`/catalog?collection=${collection._id}`} className="group block">
                      <div className="bg-ivory rounded-2xl overflow-hidden mb-3 aspect-square shadow-sm transition-all duration-500 group-hover:shadow-md">
                        <Image
                          src={getOptimizedWixImage(collection.image, 800, 800) || ''}
                          alt={collection.name || 'Collection'}
                          width={800}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <h3 className="font-heading text-base md:text-xl text-foreground text-center group-hover:text-soft-gold transition-colors">
                        {collection.name}
                      </h3>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 3. REVIEWS */}
        <section className="py-12 md:py-20 border-t border-foreground/5 overflow-hidden w-full relative">
          <div className="max-w-[120rem] mx-auto w-full min-w-0">
            <div className="text-center mb-8 md:mb-12 px-6 md:px-12">
              <h2 className="font-heading text-3xl md:text-5xl text-foreground">
                Reviews
              </h2>
            </div>

            <div className="relative w-full">
              <div
                ref={reviewsScrollRef}
                className="w-full overflow-x-auto flex gap-4 md:gap-6 pb-4 px-6 md:px-12 scrollbar-hide items-stretch scroll-smooth snap-x snap-mandatory"
              >
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      className="snap-center shrink-0 w-[260px] sm:w-[300px] md:w-[340px] aspect-[3/4] bg-foreground/5 animate-pulse rounded-2xl shadow-sm"
                    />
                  ))
                ) : (
                  <>
                    {reviews.map((review, index) => {
                      const imageUrl = getReviewImageUrl(review);

                      return (
                        <motion.div
                          key={review._id || index}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className="snap-center shrink-0 w-[260px] sm:w-[300px] md:w-[340px] aspect-[3/4] bg-ivory rounded-2xl overflow-hidden shadow-sm flex flex-col justify-center items-center border border-foreground/5"
                        >
                          {imageUrl ? (
                            <Image
                              src={getOptimizedWixImage(imageUrl, 600, 600) || ''}
                              alt={review.name || 'Client review'}
                              width={600}
                              className="w-full h-full object-cover select-none pointer-events-none"
                            />
                          ) : (
                            <div className="p-6 text-center">
                              <p className="font-heading text-foreground/70 text-sm">
                                Review Photo
                              </p>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}

                    {/* VIEW ALL REVIEWS */}
                    {reviews.length > 0 && (
                      <div className="snap-center shrink-0 w-[260px] sm:w-[300px] md:w-[340px] aspect-[3/4] bg-background border border-foreground/10 rounded-2xl flex flex-col items-center justify-center p-8 group hover:border-soft-gold transition-colors duration-300 shadow-sm">
                        <h3 className="font-heading text-xl md:text-2xl text-foreground text-center mb-6">
                          Want to see more?
                        </h3>
                        <Link
                          to="/reviews"
                          className="inline-block font-heading text-xs md:text-sm text-foreground hover:text-soft-gold transition-colors tracking-widest uppercase border-b border-foreground/20 pb-1 group-hover:border-soft-gold"
                        >
                          View All Reviews →
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* MOBILE SCROLL FADE */}
              <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-background to-transparent md:hidden" />
            </div>

            {/* MOBILE SCROLL HINT */}
            {!isLoading && reviews.length > 0 && (
              <div className="text-center mt-3 md:hidden">
                <span className="font-heading text-[10px] text-foreground/50 tracking-widest uppercase">
                  Swipe to explore →
                </span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 4. CUSTOM ORDER CTA */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="max-w-[120rem] mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-2xl md:text-4xl text-foreground mb-4">
              Need a Custom Size or Unique Design?
            </h2>
            <p className="font-paragraph text-xs md:text-sm text-foreground/70 mb-8 max-w-xl mx-auto leading-relaxed">
              Corsets can be tailored to exact measurements for a personalized fit.
            </p>
            <Link to="/contact">
              <Button
                size="lg"
                className="bg-foreground text-background hover:bg-soft-gold hover:text-white rounded-full px-8 md:px-12 py-4 font-heading text-xs uppercase tracking-widest transition-all duration-300 shadow-md"
              >
                Custom Order
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}