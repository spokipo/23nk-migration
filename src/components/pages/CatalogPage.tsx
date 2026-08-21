import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Image } from '@/components/ui/image';
import { Collections, Products, Reviews } from '@/entities';
import { BaseCrudService } from '@/integrations';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getOptimizedWixImage } from '@/lib/imageUtils';

const getReviewImage = (review: any) => {
  const rawImage = review?.reviewImage || review?.ReviewImage || review?.image || review?.photo || review?.src || '';
  return typeof rawImage === 'object' && rawImage !== null ? rawImage.url || rawImage.src || '' : rawImage;
};

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Products[]>([]);
  const [collections, setCollections] = useState<Collections[]>([]);
  const [randomReview, setRandomReview] = useState<Reviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(12);

  // --- УМНЫЙ СКРОЛЛ И СИНХРОНИЗАЦИЯ ---
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollY } = useScroll();

  // Проверяем мобилку для точной математики пикселей
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 100) {
      setIsHeaderHidden(true);
    } else {
      setIsHeaderHidden(false);
    }
  });

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    let wasCreated = false;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
      wasCreated = true;
    }
    meta.setAttribute('content', 'index, follow');
    return () => {
      if (wasCreated && meta) document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, collectionsData, reviewsData] = await Promise.all([
          BaseCrudService.getAll<Products>('products', { multiRef: ['Collections'] }),
          BaseCrudService.getAll<Collections>('collections'),
          BaseCrudService.getAll<Reviews>('reviews')
        ]);
        setProducts(productsData.items || []);
        setCollections(collectionsData.items || []);
        if (reviewsData.items && reviewsData.items.length > 0) {
          const randomIndex = Math.floor(Math.random() * reviewsData.items.length);
          setRandomReview(reviewsData.items[randomIndex]);
        }
      } catch (err) {
        console.error('Ошибка при загрузке каталога:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const collectionParam = searchParams.get('collection');
    setActiveFilter(collectionParam || 'all');
    setVisibleCount(12);
  }, [searchParams]);

  const handleFilterChange = (filterId: string) => {
    if (filterId === 'all') {
      searchParams.delete('collection');
    } else {
      searchParams.set('collection', filterId);
    }
    setSearchParams(searchParams);
  };

  const getFilteredProducts = () => {
    if (activeFilter === 'all') return products;
    if (activeFilter === 'ready-to-ship') return products.filter(p => p.inStock === true);

    return products.filter((product: any) => {
      if (!product.Collections || !Array.isArray(product.Collections)) return false;
      return product.Collections.some((col: any) => {
        return typeof col === 'object' && col !== null ? col._id === activeFilter : col === activeFilter;
      });
    });
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="min-h-screen bg-background font-paragraph text-foreground selection:bg-soft-gold/20">
      <Header />

      <main className="pt-2 pb-8 md:py-12">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 md:px-20 relative">

          {/* === ФИЛЬТРЫ: Идеальная синхронизация с хедером === */}
          {!loading && products.length > 0 && (
            <motion.div
              // top-[72px] дает ровно 8px зазора от мобильного хедера (который 64px)
              // top-[112px] дает 16px зазора от десктопного хедера (который 96px)
              className="sticky top-[72px] md:top-[112px] z-40 mb-6 md:mb-12 pointer-events-none md:pointer-events-auto"
              animate={{
                // Поднимаем пилюли ровно на высоту хедера, когда он прячется
                y: isHeaderHidden ? (isMobile ? -64 : -96) : 0
              }}
              // Время анимации (0.3s) совпадает с хедером пиксель-в-пиксель
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* Мобильная лента (Стеклянная, как хедер) */}
              <div className="md:hidden flex overflow-x-auto scrollbar-hide gap-2 -mx-4 px-4 pb-2 pointer-events-auto">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`whitespace-nowrap px-5 py-2.5 font-heading text-[11px] sm:text-xs uppercase tracking-wider rounded-full transition-all border backdrop-blur-md ${
                    activeFilter === 'all'
                      ? 'bg-foreground text-background border-transparent shadow-md'
                      : 'bg-background/85 text-foreground/80 border-foreground/10 shadow-sm hover:bg-background/95'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterChange('ready-to-ship')}
                  className={`whitespace-nowrap px-5 py-2.5 font-heading text-[11px] sm:text-xs uppercase tracking-wider rounded-full transition-all border backdrop-blur-md ${
                    activeFilter === 'ready-to-ship'
                      ? 'bg-foreground text-background border-transparent shadow-md'
                      : 'bg-background/85 text-foreground/80 border-foreground/10 shadow-sm hover:bg-background/95'
                  }`}
                >
                  Ready to Ship
                </button>
                {collections.map(collection => (
                  <button
                    key={collection._id}
                    onClick={() => handleFilterChange(collection._id)}
                    className={`whitespace-nowrap px-5 py-2.5 font-heading text-[11px] sm:text-xs uppercase tracking-wider rounded-full transition-all border backdrop-blur-md ${
                      activeFilter === collection._id
                        ? 'bg-foreground text-background border-transparent shadow-md'
                        : 'bg-background/85 text-foreground/80 border-foreground/10 shadow-sm hover:bg-background/95'
                    }`}
                  >
                    {collection.name}
                  </button>
                ))}
                <div className="w-px shrink-0"></div>
              </div>

              {/* Десктопная лента */}
              <div className="hidden md:flex justify-center items-center pointer-events-auto">
                <div className="flex gap-4 flex-nowrap">
                  <button
                    onClick={() => handleFilterChange('all')}
                    className={`px-6 py-3 font-heading text-sm uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                      activeFilter === 'all'
                        ? 'text-foreground border-b-2 border-soft-gold font-semibold'
                        : 'text-foreground/60 border-b-2 border-transparent hover:text-foreground'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterChange('ready-to-ship')}
                    className={`px-6 py-3 font-heading text-sm uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                      activeFilter === 'ready-to-ship'
                        ? 'text-foreground border-b-2 border-soft-gold font-semibold'
                        : 'text-foreground/60 border-b-2 border-transparent hover:text-foreground'
                    }`}
                  >
                    Ready to Ship
                  </button>
                  {collections.map(collection => (
                    <button
                      key={collection._id}
                      onClick={() => handleFilterChange(collection._id)}
                      className={`px-6 py-3 font-heading text-sm uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                        activeFilter === collection._id
                          ? 'text-foreground border-b-2 border-soft-gold font-semibold'
                          : 'text-foreground/60 border-b-2 border-transparent hover:text-foreground'
                      }`}
                    >
                      {collection.name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 md:gap-x-8 md:gap-y-16 mt-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex flex-col animate-pulse">
                  <div className="bg-foreground/5 rounded-xl aspect-[3/4] mb-2.5 w-full"></div>
                  <div className="h-4 bg-foreground/5 rounded w-3/4 mt-1 mb-2"></div>
                  <div className="h-3 bg-foreground/5 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-heading text-lg text-foreground/60 mb-4">
                No products available in this category.
              </p>
              <button
                onClick={() => handleFilterChange('all')}
                className="font-heading text-xs uppercase tracking-widest border-b border-foreground/40 pb-0.5 hover:border-soft-gold hover:text-soft-gold transition-colors"
              >
                Show All Products
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 md:gap-x-8 md:gap-y-16">
                {filteredProducts.slice(0, visibleCount).map((product, index) => {
                  
                  const isReserved = (product as any).isReserved === true;
                  const isSold = (product as any).isSold === true;
                  const isOnSale = (product as any).isOnSale === true;
                  const oldPrice = (product as any).oldPrice;

                  return (
                    <React.Fragment key={product._id}>
                      
                      {index === 4 && randomReview && getReviewImage(randomReview) && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: (index % 12) * 0.04 }}
                          className="col-span-2 row-span-1 relative group w-full h-full flex flex-col"
                        >
                          <div className="bg-ivory rounded-xl overflow-hidden relative shadow-sm w-full aspect-[2/1] lg:aspect-auto lg:flex-1">
                            <Image
                              src={getOptimizedWixImage(getReviewImage(randomReview), 1200, 1200) || ''}
                              alt="Community Styling"
                              width={1200}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors duration-500 flex flex-col items-center justify-center p-6 text-center z-10">
                              <span className="text-ivory/90 font-heading text-[10px] uppercase tracking-widest mb-1 md:mb-2">
                                Style Gallery
                              </span>
                              <h3 className="font-heading text-ivory text-xl md:text-3xl mb-3 md:mb-4 drop-shadow-md">
                                Styled by You
                              </h3>
                              <Link to="/gallery" className="bg-ivory text-foreground px-5 py-2 md:px-6 md:py-2.5 rounded-full text-[10px] sm:text-xs font-heading uppercase tracking-widest hover:bg-soft-gold hover:text-white transition-all shadow-lg">
                                View Looks
                              </Link>
                            </div>
                          </div>

                          <div className="invisible pointer-events-none hidden lg:flex items-center gap-2 mt-1">
                            <p className="font-heading text-xs sm:text-sm font-bold">Spacer</p>
                          </div>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: (index % 12) * 0.04 }}
                      >
                        <Link to={`/product/${product._id}`} className="group block relative">
                          <div className="bg-ivory rounded-xl overflow-hidden mb-2.5 aspect-[3/4] relative shadow-sm transition-all duration-500 group-hover:shadow-md">
                            <Image
                              src={getOptimizedWixImage(product.mainImage, 1200, 1200) || ''}
                              alt={product.name || 'Corset'}
                              width={1200}
                              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isSold || isReserved ? 'opacity-80' : ''}`}
                            />

                            <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 items-end z-10">
                              {isSold && (
                                <div className="bg-foreground text-background px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-heading font-semibold shadow-sm">
                                  Sold
                                </div>
                              )}
                              {isReserved && !isSold && (
                                <div className="bg-foreground/50 backdrop-blur-sm text-ivory px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-heading font-semibold shadow-sm">
                                  Reserved
                                </div>
                              )}
                              {!isReserved && !isSold && product.inStock === true && (
                                <div className="bg-soft-gold text-ivory px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-heading font-semibold shadow-sm">
                                  Ready to Ship
                                </div>
                              )}
                              {isOnSale && (
                                <div className="bg-red-800/90 text-ivory px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-heading font-semibold shadow-sm">
                                  Sale
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col">
                            <div className="min-h-[2.5rem] md:min-h-[2.8rem] flex items-start">
                              <h3 className="font-heading text-xs sm:text-base text-foreground group-hover:text-soft-gold transition-colors line-clamp-2 leading-tight">
                                {product.name}
                              </h3>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1">
                              {isOnSale && oldPrice ? (
                                <>
                                  <p className="font-heading text-xs sm:text-sm text-foreground/40 line-through">
                                    ${oldPrice.toFixed(2)}
                                  </p>
                                  <p className="font-heading text-xs sm:text-sm text-red-800/90 font-bold">
                                    ${product.price?.toFixed(2)}
                                  </p>
                                </>
                              ) : (
                                <p className="font-heading text-xs sm:text-sm text-soft-gold font-bold">
                                  ${product.price?.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    </React.Fragment>
                  );
                })}
              </div>

              {visibleCount < filteredProducts.length && (
                <div className="mt-16 mb-8 md:mt-24 md:mb-12 flex justify-center">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 12)}
                    className="px-8 py-3 border border-foreground/20 text-foreground text-xs font-heading uppercase tracking-widest rounded-full hover:border-soft-gold hover:text-soft-gold transition-colors duration-300 shadow-sm"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}