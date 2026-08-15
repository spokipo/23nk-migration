import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Image } from '@/components/ui/image';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Collections, Products } from '@/entities';
import { BaseCrudService } from '@/integrations';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Products[]>([]);
  const [collections, setCollections] = useState<Collections[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, collectionsData] = await Promise.all([
          BaseCrudService.getAll<Products>('products', { multiRef: ['Collections'] }),
          BaseCrudService.getAll<Collections>('collections')
        ]);

        setProducts(productsData.items || []);
        setCollections(collectionsData.items || []);

        const collectionParam = searchParams.get('collection');
        if (collectionParam) {
          setActiveFilter(collectionParam);
        } else {
          setActiveFilter('all');
        }
      } catch (err) {
        console.error('Ошибка при загрузке каталога:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Функция переключения фильтра с синхронизацией URL
  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setIsMobileMenuOpen(false);

    if (filterId === 'all') {
      searchParams.delete('collection');
    } else {
      searchParams.set('collection', filterId);
    }
    setSearchParams(searchParams);
  };

  // Фильтрация товаров
  const getFilteredProducts = () => {
    if (activeFilter === 'all') {
      return products;
    }
    if (activeFilter === 'ready-to-ship') {
      return products.filter(p => p.inStock === true);
    }

    return products.filter((product: any) => {
      if (!product.Collections || !Array.isArray(product.Collections)) return false;

      return product.Collections.some((col: any) => {
        if (typeof col === 'object' && col !== null) {
          return col._id === activeFilter;
        }
        return col === activeFilter;
      });
    });
  };

  const filteredProducts = getFilteredProducts();

  // Получаем лейбл выбранного фильтра для моб. дропдауна
  const getActiveFilterLabel = () => {
    if (activeFilter === 'all') return 'All';
    if (activeFilter === 'ready-to-ship') return 'Ready to Ship';
    const col = collections.find(c => c._id === activeFilter);
    return col ? col.name : 'All';
  };

  return (
    <div className="min-h-screen bg-background font-paragraph text-foreground selection:bg-soft-gold/20">
      <Header />

      <main className="py-8 md:py-12">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 md:px-20">

          {/* Filter Bar */}
          {!loading && products.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 md:mb-12"
            >
              {/* 1. МОБИЛЬНЫЙ DROPDOWN (до md экрана) */}
              <div className="relative md:hidden w-full max-w-xs mx-auto">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="w-full flex items-center justify-between px-5 py-3 font-heading text-xs uppercase tracking-wider text-foreground bg-ivory border border-foreground/15 rounded-full shadow-sm active:bg-foreground/5 transition-all"
                >
                  <span>{getActiveFilterLabel()}</span>
                  <motion.svg
                    animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-4 h-4 text-foreground/60"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>

                {/* Выпадающее меню */}
                <AnimatePresence>
                  {isMobileMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsMobileMenuOpen(false)}
                      />

                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-background border border-foreground/15 rounded-2xl shadow-xl z-40 overflow-hidden py-2"
                      >
                        <button
                          onClick={() => handleFilterChange('all')}
                          className={`w-full text-left px-5 py-3 font-heading text-xs uppercase tracking-wider transition-colors ${
                            activeFilter === 'all'
                              ? 'text-soft-gold font-semibold bg-soft-gold/5'
                              : 'text-foreground/80 hover:text-foreground'
                          }`}
                        >
                          All
                        </button>

                        <button
                          onClick={() => handleFilterChange('ready-to-ship')}
                          className={`w-full text-left px-5 py-3 font-heading text-xs uppercase tracking-wider transition-colors ${
                            activeFilter === 'ready-to-ship'
                              ? 'text-soft-gold font-semibold bg-soft-gold/5'
                              : 'text-foreground/80 hover:text-foreground'
                          }`}
                        >
                          Ready to Ship
                        </button>

                        {collections.map(collection => (
                          <button
                            key={collection._id}
                            onClick={() => handleFilterChange(collection._id)}
                            className={`w-full text-left px-5 py-3 font-heading text-xs uppercase tracking-wider transition-colors ${
                              activeFilter === collection._id
                                ? 'text-soft-gold font-semibold bg-soft-gold/5'
                                : 'text-foreground/80 hover:text-foreground'
                            }`}
                          >
                            {collection.name}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. ДЕСКТОПНАЯ ПАНЕЛЬ (от md экрана и выше) */}
              <div className="hidden md:flex justify-center items-center">
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

          {/* Grid / Empty State */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner />
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.04 }}
                >
                  <Link to={`/product/${product._id}`} className="group block relative">
                    <div className="bg-ivory rounded-xl overflow-hidden mb-2.5 aspect-square relative shadow-sm transition-all duration-500 group-hover:shadow-md">
                      <Image
                        src={product.mainImage || ''}
                        alt={product.name || 'Corset'}
                        width={600}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {product.inStock === true && (
                        <div className="absolute top-2.5 right-2.5 bg-soft-gold text-ivory px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-heading font-semibold shadow-sm">
                          Ready to Ship
                        </div>
                      )}
                    </div>

                    {/* Фиксированная высота блока с названием, чтобы ценники были идеально в ровную линию */}
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
