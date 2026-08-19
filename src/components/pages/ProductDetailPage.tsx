import Footer from '@/components/Footer';
import Header from '@/components/Header';
import OrderModal from '@/components/OrderModal';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Products } from '@/entities';
import { BaseCrudService } from '@/integrations';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, X, ZoomIn } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';

const getValidImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('wix:image://v1/')) {
    const match = url.match(/wix:image:\/\/v1\/([^\/]+)/);
    return match ? `https://static.wixstatic.com/media/${match[1]}` : url;
  }
  return url;
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Products | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Products[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  
  // Состояния загрузки
  const [isMainImageLoading, setIsMainImageLoading] = useState(true);
  const [isZoomPreparing, setIsZoomPreparing] = useState(false);
  
  const [isFullscreenZoom, setIsFullscreenZoom] = useState(false);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'claim' | 'custom'>('claim');
  const [activeAccordion, setActiveAccordion] = useState<'desc' | 'materials' | ''>('desc');

  // Стейты для зума ВНУТРИ модалки (десктоп)
  const modalImgRef = useRef<HTMLDivElement>(null);
  const [modalZoomPos, setModalZoomPos] = useState({ x: 0, y: 0 });
  const [showModalZoom, setShowModalZoom] = useState(false);

  // === ВОЗВРАЩЕННЫЕ СТЕЙТЫ ДЛЯ МОБИЛЬНОГО PINCH-TO-ZOOM ===
  const [touchScale, setTouchScale] = useState(1);
  const [touchPos, setTouchPos] = useState({ x: 0, y: 0 });
  const touchState = useRef({
    startDist: 0,
    startScale: 1,
    startX: 0,
    startY: 0,
    isPinching: false,
    isPanning: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [fetchedProduct, allProducts] = await Promise.all([
          BaseCrudService.getById<Products>('products', id),
          BaseCrudService.getAll<Products>('products')
        ]);
        
        setProduct(fetchedProduct);

        if (allProducts.items) {
          let related = allProducts.items.filter((p) => {
            if (p._id === id || !p.inStock) return false;
            const isSameCategory = 
              (fetchedProduct.category && p.category === fetchedProduct.category) || 
              (fetchedProduct.categoryId && p.categoryId === fetchedProduct.categoryId);
            
            return isSameCategory;
          });

          if (related.length < 4) {
            const others = allProducts.items.filter(
              (p) => p._id !== id && p.inStock && !related.find((r) => r._id === p._id)
            );
            related = [...related, ...others];
          }

          setRelatedProducts(related.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentImage(0);
    setActiveAccordion('desc');
  }, [id]);

  const images = [
    product?.mainImage,
    product?.additionalImage1,
    product?.additionalImage2,
  ].filter(Boolean) as string[];

  // Предзагрузка главного фото
  useEffect(() => {
    const currentSrc = images[currentImage];
    if (!currentSrc) return;

    setIsMainImageLoading(true);
    const img = new window.Image();
    img.src = getValidImageUrl(currentSrc);

    const handleReady = () => {
      if ('decode' in img) {
        img.decode().catch(() => {}).finally(() => setIsMainImageLoading(false));
      } else {
        setIsMainImageLoading(false);
      }
    };

    if (img.complete) handleReady();
    else {
      img.onload = handleReady;
      img.onerror = () => setIsMainImageLoading(false);
    }
  }, [currentImage, product?._id]);

  // Закрытие модалки на Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseZoom();
    };

    if (isFullscreenZoom) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    }
    return () => { 
      document.body.style.overflow = ''; 
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreenZoom]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between font-paragraph text-foreground">
        <Header />
        <div className="flex justify-center items-center py-32">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  // Открытие модалки ТОЛЬКО после кэширования
  const handleOpenZoom = (index?: number) => {
    const targetIndex = index !== undefined ? index : currentImage;
    if (index !== undefined) setCurrentImage(index);

    const currentSrc = images[targetIndex];
    if (!currentSrc) return;

    setIsZoomPreparing(true);

    const img = new window.Image();
    img.src = getValidImageUrl(currentSrc);

    const onReady = () => {
      setIsZoomPreparing(false);
      setIsFullscreenZoom(true);
    };

    if (img.complete) {
      onReady();
    } else {
      img.onload = onReady;
      img.onerror = onReady;
    }
  };

  const handleCloseZoom = () => {
    setIsFullscreenZoom(false);
    // Сбрасываем тач-зум при закрытии модалки
    setTimeout(() => {
      setTouchScale(1);
      setTouchPos({ x: 0, y: 0 });
    }, 200);
  };

  const handleModalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!modalImgRef.current) return;
    const { left, top, width, height } = modalImgRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setModalZoomPos({ x, y });
  };

  // === ВОЗВРАЩЕННАЯ МАТЕМАТИКА МОБИЛЬНОГО PINCH-TO-ZOOM ===
  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      touchState.current.isPinching = true;
      touchState.current.startDist = getDistance(e.touches);
      touchState.current.startScale = touchScale;
    } else if (e.touches.length === 1 && touchScale > 1) {
      touchState.current.isPanning = true;
      touchState.current.startX = e.touches[0].clientX - touchPos.x;
      touchState.current.startY = e.touches[0].clientY - touchPos.y;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchState.current.isPinching && e.touches.length === 2) {
      const newDist = getDistance(e.touches);
      let newScale = touchState.current.startScale * (newDist / touchState.current.startDist);
      newScale = Math.max(1, Math.min(newScale, 4)); // От 1x до 4x
      setTouchScale(newScale);
    } else if (touchState.current.isPanning && e.touches.length === 1 && touchScale > 1) {
      const newX = e.touches[0].clientX - touchState.current.startX;
      const newY = e.touches[0].clientY - touchState.current.startY;
      setTouchPos({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = () => {
    touchState.current.isPinching = false;
    touchState.current.isPanning = false;
    if (touchScale < 1.05) {
      setTouchScale(1);
      setTouchPos({ x: 0, y: 0 });
    }
  };

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const itemWidth = e.currentTarget.clientWidth;
    const newIndex = Math.round(scrollLeft / itemWidth);
    if (newIndex !== currentImage && newIndex >= 0 && newIndex < images.length) {
      setCurrentImage(newIndex);
    }
  };

  const handleOpenModal = (mode: 'claim' | 'custom') => {
    setModalMode(mode);
    setIsDialogOpen(true);
  };

  const toggleAccordion = (section: 'desc' | 'materials') => {
    setActiveAccordion(activeAccordion === section ? '' : section);
  };

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": images.map(getValidImageUrl),
    "description": product.fullDescription || product.shortDescription,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": product.price,
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <div className="min-h-screen bg-background font-paragraph text-foreground selection:bg-soft-gold/20 pb-10 md:pb-0 relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <Header />

      <main className="py-6 md:py-12 overflow-hidden md:overflow-visible relative">
        <div className="max-w-[120rem] mx-auto px-4 md:px-20">
          
          <nav className="mb-6 flex items-center text-[10px] md:text-xs font-heading text-foreground/50">
            <Link to="/" className="hover:text-soft-gold transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 mx-1.5" />
            <Link to="/catalog" className="hover:text-soft-gold transition-colors">Catalog</Link>
            <ChevronRight className="w-3 h-3 mx-1.5" />
            <span className="text-foreground/80 truncate">{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-4 md:gap-10 lg:gap-16 items-start">
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative w-full min-w-0"
            >
              {/* === МОБИЛЬНАЯ КАРУСЕЛЬ === */}
              <div 
                className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 pb-2 w-full"
                onScroll={handleMobileScroll}
              >
                {images.map((img, idx) => (
                  <div 
                    key={idx}
                    className="flex-none w-full snap-center bg-ivory rounded-2xl overflow-hidden aspect-square relative cursor-pointer"
                    onClick={() => handleOpenZoom(idx)}
                  >
                    <div className={`absolute inset-0 z-30 bg-ivory flex items-center justify-center transition-opacity duration-300 ease-out ${
                      (isMainImageLoading || isZoomPreparing) && currentImage === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}>
                      <LoadingSpinner />
                    </div>

                    <Image
                      src={img}
                      alt={`${product.name} - view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center gap-2 mt-3 mb-2 md:hidden">
                {images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      currentImage === idx ? 'bg-foreground/60 scale-125' : 'bg-foreground/20'
                    }`} 
                  />
                ))}
              </div>

              {/* === ДЕСКТОПНОЕ ФОТО === */}
              <div 
                className="hidden md:flex bg-ivory rounded-2xl overflow-hidden mb-4 aspect-square relative shadow-sm group cursor-pointer items-center justify-center"
                onClick={() => handleOpenZoom()} 
              >
                <div 
                  className={`absolute inset-0 z-10 bg-ivory flex items-center justify-center transition-opacity duration-500 ease-out ${
                    isMainImageLoading || isZoomPreparing ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <LoadingSpinner />
                </div>

                <Image
                  key={`${product._id}-${currentImage}`}
                  src={images[currentImage] || ''}
                  alt={product.name || 'Corset'}
                  className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.02] ${
                    isMainImageLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`}
                />
                
                <div className={`absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-20 ${isZoomPreparing ? 'hidden' : ''}`}>
                  <div className="bg-black/50 p-3 rounded-full text-white backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <ZoomIn className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Десктопные миниатюры */}
              {images.length > 1 && (
                <div className="hidden md:grid grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentImage(index)}
                      className={`relative bg-ivory rounded-xl overflow-hidden aspect-square transition-all ${
                        currentImage === index
                          ? 'ring-2 ring-soft-gold scale-[0.98]'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col"
            >
              {product.inStock && (
                <div className="mb-3">
                  <span className="inline-block bg-soft-gold text-ivory px-3.5 py-1 rounded-full text-xs font-heading font-semibold shadow-sm">
                    Ready to Ship
                  </span>
                </div>
              )}

              <h1 className="font-heading text-2xl md:text-4xl text-foreground mb-3">
                {product.name}
              </h1>

              <p className="font-heading text-2xl md:text-3xl text-soft-gold font-bold mb-6 md:mb-8">
                ${product.price?.toFixed(2)}
              </p>

              <div className="mb-8">
                <Button
                  onClick={() => handleOpenModal(product.inStock ? 'claim' : 'custom')}
                  className="w-full bg-foreground text-background hover:bg-soft-gold hover:text-white active:scale-[0.98] transition-all rounded-full py-6 text-sm font-heading tracking-widest uppercase shadow-md"
                >
                  {product.inStock ? 'Order Now' : 'Custom Order'}
                </Button>
                <div className="mt-4 flex items-center justify-center text-[10px] md:text-xs text-foreground/60 font-heading tracking-widest uppercase gap-4">
                  <span>Worldwide Shipping</span>
                </div>
              </div>

              <div className="border-t border-foreground/10 divide-y divide-foreground/10">
                <div className="py-4">
                  <button
                    onClick={() => toggleAccordion('desc')}
                    aria-expanded={activeAccordion === 'desc'}
                    className="w-full flex items-center justify-between text-left font-heading text-sm uppercase tracking-wider text-foreground"
                  >
                    <span>Description & Sizing</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        activeAccordion === 'desc' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'desc' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-3 pb-1 space-y-3"
                      >
                        <p className="font-paragraph text-xs md:text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                          {product.fullDescription || product.shortDescription || 'No description available.'}
                        </p>
                        
                        <div className="pt-2 border-t border-foreground/5">
                          <strong className="font-heading text-xs uppercase tracking-wider text-foreground block mb-1">
                            Sizing & Fit:
                          </strong>
                          <p className="font-paragraph text-xs md:text-sm text-foreground/80">
                            {product.sizing || 'Custom sizing available on request, tailored to your exact measurements'}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="py-4">
                  <button
                    onClick={() => toggleAccordion('materials')}
                    aria-expanded={activeAccordion === 'materials'}
                    className="w-full flex items-center justify-between text-left font-heading text-sm uppercase tracking-wider text-foreground"
                  >
                    <span>Materials & Care</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        activeAccordion === 'materials' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'materials' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-3 pb-1 space-y-2 text-xs md:text-sm text-foreground/80 font-paragraph"
                      >
                        {product.materials && (
                          <p>
                            <strong className="font-heading text-foreground">Fabric:</strong> {product.materials}
                          </p>
                        )}
                        <p>
                          <strong className="font-heading text-foreground">Care Instructions:</strong> Dry clean or gentle spot clean only. Do not machine wash.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-20 md:mt-32 pt-10 border-t border-foreground/10">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="font-heading text-2xl md:text-4xl text-foreground">
                  You Might Also Like
                </h2>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {relatedProducts.map((related, index) => (
                  <motion.div
                    key={related._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link to={`/product/${related._id}`} className="group block relative">
                      <div className="bg-ivory rounded-xl overflow-hidden mb-3 aspect-square shadow-sm transition-all duration-500 group-hover:shadow-md relative">
                        <Image
                          src={related.mainImage || ''}
                          alt={related.name || 'Corset'}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <h3 className="font-heading text-sm sm:text-base text-foreground group-hover:text-soft-gold transition-colors line-clamp-1">
                        {related.name}
                      </h3>
                      <p className="font-heading text-xs sm:text-sm text-soft-gold font-bold mt-1">
                        ${related.price?.toFixed(2)}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* === ИДЕАЛЬНАЯ МОДАЛКА (С ВОЗВРАЩЕННЫМ PINCH-TO-ZOOM И 250% НА ДЕСКТОПЕ) === */}
      <AnimatePresence>
        {isFullscreenZoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-0 sm:p-8 cursor-zoom-out"
            onClick={handleCloseZoom}
          >
            <button 
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 bg-white/10 hover:bg-white/20 p-2 sm:p-3 rounded-full text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseZoom();
              }}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="relative flex items-center justify-center w-full h-full max-w-7xl overflow-hidden sm:overflow-visible">
              <div
                ref={modalImgRef}
                // ВОТ ОНИ! touch-события и touch-none вернулись!
                className="relative inline-flex items-center justify-center cursor-crosshair max-w-full max-h-full touch-none"
                onMouseEnter={() => setShowModalZoom(true)}
                onMouseLeave={() => setShowModalZoom(false)}
                onMouseMove={handleModalMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={(e) => e.stopPropagation()} 
              >
                <div className={`transition-opacity duration-300 ${showModalZoom ? 'md:opacity-0' : 'opacity-100'}`}>
                  <img
                    key={`zoom-${product._id}-${currentImage}`}
                    src={getValidImageUrl(images[currentImage])}
                    alt={product.name || 'Zoomed View'}
                    className="max-w-full max-h-[85vh] sm:max-h-[90vh] w-auto h-auto object-contain select-none"
                    style={{ 
                      transform: `translate3d(${touchPos.x}px, ${touchPos.y}px, 0) scale(${touchScale})`,
                      transition: touchState.current.isPinching || touchState.current.isPanning ? 'none' : 'transform 0.2s ease-out'
                    }}
                  />
                </div>
                
                {images[currentImage] && (
                  <div
                    className={`absolute inset-0 z-20 pointer-events-none hidden md:block transition-opacity duration-150 ${
                      showModalZoom ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      backgroundImage: `url(${getValidImageUrl(images[currentImage])})`,
                      backgroundPosition: `${modalZoomPos.x}% ${modalZoomPos.y}%`,
                      backgroundSize: '250%',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <OrderModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        product={{
          _id: product._id,
          name: product.name,
          price: product.price,
          mainImage: product.mainImage
        }}
        modalMode={modalMode}
      />

      <Footer />
    </div>
  );
}