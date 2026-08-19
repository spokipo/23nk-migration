import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Image } from '@/components/ui/image';
import { Collections, Products } from '@/entities';
import { BaseCrudService } from '@/integrations';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Products[]>([]);
  const [collections, setCollections] = useState<Collections[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

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
              {/* 1. МОБИЛЬНЫЕ "ПИЛЮЛИ" (до md экрана) со скроллом */}
              <div className="md:hidden flex overflow-x-auto scrollbar-hide gap-2 pb-2 -mx-4 px-4 snap-x">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`snap-start whitespace-nowrap px-5 py-2.5 font-heading text-[11px] sm:text-xs uppercase tracking-wider rounded-full transition-all border ${
                    activeFilter === 'all'
                      ? 'bg-foreground text-background border-foreground shadow-md'
                      : 'bg-ivory text-foreground/70 border-foreground/15 hover:border-foreground/30'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterChange('ready-to-ship')}
                  className={`snap-start whitespace-nowrap px-5 py-2.5 font-heading text-[11px] sm:text-xs uppercase tracking-wider rounded-full transition-all border ${
                    activeFilter === 'ready-to-ship'
                      ? 'bg-foreground text-background border-foreground shadow-md'
                      : 'bg-ivory text-foreground/70 border-foreground/15 hover:border-foreground/30'
                  }`}
                >
                  Ready to Ship
                </button>
                {collections.map(collection => (
                  <button
                    key={collection._id}
                    onClick={() => handleFilterChange(collection._id)}
                    className={`snap-start whitespace-nowrap px-5 py-2.5 font-heading text-[11px] sm:text-xs uppercase tracking-wider rounded-full transition-all border ${
                      activeFilter === collection._id
                        ? 'bg-foreground text-background border-foreground shadow-md'
                        : 'bg-ivory text-foreground/70 border-foreground/15 hover:border-foreground/30'
                    }`}
                  >
                    {collection.name}
                  </button>
                ))}
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

          {/* Grid / Skeletons / Empty State */}
          {loading ? (
            // Скелетная загрузка: 8 пустых карточек
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col animate-pulse">
                  {/* Заглушка для фото (aspect-[3/4]) */}
                  <div className="bg-foreground/5 rounded-xl aspect-[3/4] mb-2.5 w-full"></div>
                  {/* Заглушка для названия */}
                  <div className="h-4 bg-foreground/5 rounded w-3/4 mt-1 mb-2"></div>
                  {/* Заглушка для цены */}
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.04 }}
                >
                  <Link to={`/product/${product._id}`} className="group block relative">
                    {/* Применили aspect-[3/4] для единого стиля */}
                    <div className="bg-ivory rounded-xl overflow-hidden mb-2.5 aspect-[3/4] relative shadow-sm transition-all duration-500 group-hover:shadow-md">
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