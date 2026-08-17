import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Products } from '@/entities';
import { BaseCrudService } from '@/integrations';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ZoomIn, X, ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import OrderModal from '@/components/OrderModal';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Products | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Products[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  
  const [isFullscreenZoom, setIsFullscreenZoom] = useState(false);
  const [isZoomImageLoading, setIsZoomImageLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'claim' | 'custom'>('claim');
  const [activeAccordion, setActiveAccordion] = useState<'desc' | 'materials' | ''>('desc');

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
          const related = allProducts.items
            .filter((p) => p._id !== id && p.inStock)
            .slice(0, 4);
          setRelatedProducts(related);
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

  useEffect(() => {
    if (isFullscreenZoom) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
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

  const images = [
    product.mainImage,
    product.additionalImage1,
    product.additionalImage2,
  ].filter(Boolean) as string[];

  const handleOpenZoom = () => {
    setIsZoomImageLoading(true);
    setIsFullscreenZoom(true);
  };

  const handleOpenModal = (mode: 'claim' | 'custom') => {
    setModalMode(mode);
    setIsDialogOpen(true);
  };

  const toggleAccordion = (section: 'desc' | 'materials') => {
    setActiveAccordion(activeAccordion === section ? '' : section);
  };

  return (
    <div className="min-h-screen bg-background font-paragraph text-foreground selection:bg-soft-gold/20">
      <Header />

      <main className="py-8 md:py-16">
        <div className="max-w-[120rem] mx-auto px-4 md:px-20">
          
          {/* BREADCRUMBS (ХЛЕБНАЯ КРОШКА) */}
          <div className="mb-6">
            <Link 
              to="/catalog" 
              className="inline-flex items-center text-[10px] md:text-xs font-heading text-foreground/50 hover:text-soft-gold transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Catalog
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
            
            {/* PRODUCT IMAGES */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div 
                className="bg-ivory rounded-2xl overflow-hidden mb-4 aspect-square relative shadow-sm group cursor-zoom-in"
                onClick={handleOpenZoom}
              >
                <Image
                  src={images[currentImage] || ''}
                  alt={product.name || 'Corset'}
                  fill
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/50 p-3 rounded-full text-white backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <ZoomIn className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`relative bg-ivory rounded-xl overflow-hidden aspect-square transition-all ${
                        currentImage === index
                          ? 'ring-2 ring-soft-gold scale-[0.98]'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* PRODUCT DETAILS */}
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

              <p className="font-heading text-2xl md:text-3xl text-soft-gold font-bold mb-6">
                ${product.price?.toFixed(2)}
              </p>

              <div className="mb-8">
                <Button
                  onClick={() => handleOpenModal(product.inStock ? 'claim' : 'custom')}
                  className="w-full bg-foreground text-background hover:bg-soft-gold hover:text-white transition-all rounded-full py-6 text-xs sm:text-sm font-heading tracking-widest uppercase shadow-md"
                >
                  {product.inStock ? 'Buy Now' : 'Custom Order'}
                </Button>
              </div>

              {/* PRODUCT ACCORDIONS */}
              <div className="border-t border-foreground/10 divide-y divide-foreground/10">
                <div className="py-4">
                  <button
                    onClick={() => toggleAccordion('desc')}
                    className="w-full flex items-center justify-between text-left font-heading text-sm uppercase tracking-wider text-foreground"
                  >
                    <span>Description, Sizing & Details</span>
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
                        className="overflow-hidden mt-3 pb-1"
                      >
                        <p className="font-paragraph text-xs md:text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                          {product.fullDescription || product.shortDescription || 'No description available.'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="py-4">
                  <button
                    onClick={() => toggleAccordion('materials')}
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

          {/* RELATED PRODUCTS */}
          {relatedProducts.length > 0 && (
            <div className="mt-20 md:mt-32 pt-10 border-t border-foreground/10">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="font-heading text-2xl md:text-4xl text-foreground">
                  You Might Also Like
                </h2>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
                {relatedProducts.map((related, index) => (
                  <motion.div
                    key={related._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link to={`/product/${related._id}`} className="group block relative">
                      <div className="bg-ivory rounded-xl overflow-hidden mb-2 sm:mb-3 aspect-square shadow-sm transition-all duration-500 group-hover:shadow-md relative">
                        <Image
                          src={related.mainImage || ''}
                          alt={related.name || 'Corset'}
                          fill
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <h3 className="font-heading text-xs sm:text-base text-foreground group-hover:text-soft-gold transition-colors line-clamp-1">
                        {related.name}
                      </h3>
                      <p className="font-heading text-xs sm:text-sm text-soft-gold font-bold mt-0.5">
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

      {/* LIGHTBOX WITH CLEAN SPINNER */}
      <AnimatePresence>
        {isFullscreenZoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
            onClick={() => setIsFullscreenZoom(false)}
          >
            <button 
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 bg-black/20 hover:bg-black/40 p-2 sm:p-3 rounded-full text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreenZoom(false);
              }}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="relative flex items-center justify-center w-full h-full max-w-5xl">
              {isZoomImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <LoadingSpinner />
                </div>
              )}

              <Image
                src={images[currentImage] || ''}
                alt={product.name || 'Zoomed View'}
                fittingType="fit"
                onLoad={() => setIsZoomImageLoading(false)}
                onError={() => setIsZoomImageLoading(false)}
                className={`max-w-[92vw] max-h-[85vh] sm:max-h-[90vh] w-auto h-auto object-contain rounded-xl sm:rounded-2xl shadow-2xl transition-opacity duration-300 ${
                  isZoomImageLoading ? 'opacity-0' : 'opacity-100'
                }`}
              />
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