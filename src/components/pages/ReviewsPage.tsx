import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ContactFormSubmissions, Reviews } from '@/entities';
import { useToast } from '@/hooks/use-toast';
import { BaseCrudService } from '@/integrations';
import { sendOrderNotification } from '@/integrations/notifications';
import { Country } from 'country-state-city';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { getOptimizedWixImage } from '@/lib/imageUtils'; // Импорт нашей утилиты

// Полный список стран доставки Nova Poshta Global (ISO Alpha-2 коды)
const NOVA_POSHTA_COUNTRIES = [
  'AT', 'UA', 'AL', 'AD', 'BE', 'BG', 'BA', 'VA', 'GB', 'GR', 'GI', 'DK', 'EE', 'IE', 'IS', 'ES', 'IT', 'CY', 'LV', 'LT', 'LI', 'LU', 'MT', 'MD', 'MC', 'NL', 'DE', 'NO', 'MK', 'PL', 'PT', 'RO', 'SM', 'RS', 'SK', 'SI', 'TR', 'CZ', 'ME', 'HU', 'FI', 'FR', 'HR', 'CH', 'SE',
  'US', 'CA', 'CN', 'HK',
  'AU', 'AZ', 'DZ', 'AS', 'AO', 'AI', 'AG', 'AR', 'AW', 'AF', 'BS', 'BD', 'BB', 'BH', 'BZ', 'BJ', 'BM', 'BO', 'BQ', 'BW', 'BR', 'VG', 'BN', 'BF', 'BI', 'BT', 'VN', 'VU', 'VI', 'VE', 'AM', 'GA', 'HT', 'GM', 'GH', 'GN', 'GW', 'HN', 'GE', 'GY', 'GP', 'GT', 'GD', 'GL', 'GU', 'DJ', 'DM', 'DO', 'EC', 'ER', 'SZ', 'ET', 'EG', 'ZM', 'ZW', 'IL', 'IN', 'ID', 'IQ', 'JO', 'CV', 'KZ', 'KY', 'KH', 'CM', 'QA', 'KE', 'NE', 'KG', 'CO', 'KM', 'CG', 'CR', 'CI', 'KW', 'CK', 'CW', 'LA', 'LS', 'LR', 'LB', 'MU', 'MR', 'MG', 'YT', 'MO', 'MW', 'MY', 'ML', 'MV', 'MA', 'MQ', 'MH', 'MX', 'MZ', 'MN', 'NA', 'NP', 'NG', 'NI', 'NZ', 'NC', 'AE', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'ZA', 'MP', 'PR', 'KR', 'RE', 'RW', 'SV', 'WS', 'SA', 'SC', 'BL', 'SN', 'MF', 'SX', 'VC', 'KN', 'LC', 'SG', 'SB', 'TL', 'SL', 'TH', 'PF', 'TW', 'TZ', 'TC', 'TG', 'TO', 'TT', 'TN', 'UG', 'UZ', 'UY', 'FO', 'FJ', 'PH', 'GF', 'TD', 'CL', 'LK', 'JM', 'FM', 'JP'
];

// Упрощенный хелпер: только достает сырой URL. Всю магию сжатия делает getOptimizedWixImage.
const getImageUrl = (review: any) => {
  const rawImage =
    review?.reviewImage ||
    review?.ReviewImage ||
    review?.image ||
    review?.photo ||
    review?.src ||
    '';

  if (typeof rawImage === 'object' && rawImage !== null) {
    return rawImage.url || rawImage.src || '';
  }
  return rawImage;
};

// Отдельный компонент карточки с контролем загрузки изображения
interface GalleryCardProps {
  review: Reviews;
  index: number;
  loadingReviewId: string | null;
  onOpenReview: (review: Reviews) => void;
}

function GalleryCard({ review, index, loadingReviewId, onOpenReview }: GalleryCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Для сетки запрашиваем оптимальный вариант
  const rawUrl = getImageUrl(review);
  const imageUrl = getOptimizedWixImage(rawUrl, 1200, 1200); 

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: (index % 12) * 0.04, // Адаптировано под пагинацию
      }}
      onClick={() => onOpenReview(review)}
      className="group relative flex cursor-pointer flex-col"
    >
      {/* Убрали нижний марджин, так как текста под фото больше нет */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-ivory shadow-sm transition-all duration-500 group-hover:shadow-md w-full">
        
        {/* Индивидуальный скелетон карточки до завершения декодирования */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-foreground/5 animate-pulse z-0" />
        )}

        {loadingReviewId === review._id && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-ivory/80 backdrop-blur-sm transition-opacity">
            <LoadingSpinner />
          </div>
        )}

        <img
          src={imageUrl || ''}
          alt={review.reviewTitle || 'Customer Review'}
          loading={index < 6 ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/30 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10">
          <span className="translate-y-2 transform rounded-full bg-ivory px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground shadow-lg transition-transform duration-300 group-hover:translate-y-0 sm:text-xs">
            Quick View
          </span>
        </div>
      </div>
      {/* Блок с текстом под карточкой полностью удален для чистой галереи */}
    </motion.div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Reviews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Reviews | null>(null);
  
  // Стейт для пагинации
  const [visibleCount, setVisibleCount] = useState(12);

  // Состояния загрузки
  const [loadingReviewId, setLoadingReviewId] = useState<string | null>(null);
  const [isZoomPreparing, setIsZoomPreparing] = useState(false);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Стейт для страны
  const [selectedCountryCode, setSelectedCountryCode] = useState('');

  // Fullscreen Zoom Lightbox
  const [isFullscreenZoom, setIsFullscreenZoom] = useState(false);

  // Стейты для десктопного зума
  const modalImgRef = useRef<HTMLDivElement>(null);
  const [modalZoomPos, setModalZoomPos] = useState({ x: 0, y: 0 });
  const [showModalZoom, setShowModalZoom] = useState(false);

  // Стейты для мобильного Pinch-to-Zoom
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

  // Responsive Animation Trigger
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    country: '',
    preferredContactMethod: '',
    contactDetails: '',
    message: '',
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const result = await BaseCrudService.getAll<Reviews>('reviews');
        const items = result.items || [];
        
        if (!isMounted) return;
        setReviews(items);

        // Предзагружаем верхние 6 фото (сразу в оптимизированном размере 1200x1200)
        if (items.length > 0) {
          const topImages = items.slice(0, 6).map(item => {
            const rawUrl = getImageUrl(item);
            return getOptimizedWixImage(rawUrl, 1200, 1200);
          }).filter(Boolean);
          
          await Promise.race([
            Promise.allSettled(
              topImages.map((src) => {
                return new Promise((resolve) => {
                  const img = new window.Image();
                  img.src = src as string;
                  if (img.complete) {
                    resolve(true);
                  } else {
                    img.onload = () => resolve(true);
                    img.onerror = () => resolve(false);
                  }
                });
              })
            ),
            new Promise((resolve) => setTimeout(resolve, 800))
          ]);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedReview || isFullscreenZoom) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedReview, isFullscreenZoom]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreenZoom) handleCloseZoom();
        else if (isFormOpen) handleCloseForm();
        else if (selectedReview) handleCloseReview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenZoom, isFormOpen, selectedReview]);

  const getProductName = (review: any) => {
    return (
      review?.productName ||
      review?.reviewTitle ||
      review?.title ||
      'Custom Remake'
    );
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      country: '',
      preferredContactMethod: '',
      contactDetails: '',
      message: '',
    });
    setSelectedCountryCode('');
    setIsSubmittedSuccess(false);
  };

  const handleOpenReview = (review: Reviews) => {
    const rawSrc = getImageUrl(review);
    const currentSrc = getOptimizedWixImage(rawSrc, 1200, 1200); // Грузим 1200px для модалки превью
    if (!currentSrc) return;

    setLoadingReviewId(review._id);

    const img = new window.Image();
    img.src = currentSrc;

    const onReady = () => {
      setLoadingReviewId(null);
      setSelectedReview(review);
    };

    if (img.complete) {
      onReady();
    } else {
      img.onload = onReady;
      img.onerror = onReady;
    }
  };

  const handleCloseReview = () => {
    setSelectedReview(null);
    setIsFullscreenZoom(false);
    setIsZoomPreparing(false);
  };

  const handleOpenForm = (review: Reviews) => {
    setSelectedReview(review);
    resetForm();
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setIsSubmittedSuccess(false);
  };

  const handleOpenZoom = () => {
    const rawSrc = selectedReview ? getImageUrl(selectedReview) : '';
    const currentSrc = getOptimizedWixImage(rawSrc, 2400, 2400); // Максимальное качество для фуллскрина
    if (!currentSrc) return;

    setIsZoomPreparing(true);

    const img = new window.Image();
    img.src = currentSrc;

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
      newScale = Math.max(1, Math.min(newScale, 4));
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedReview) return;

    setIsSubmitting(true);
    const productName = getProductName(selectedReview);

    try {
      const messageContent = `Custom Order Request.\n\nProduct: ${productName}\nCountry: ${formData.country}\n\nAdditional Notes: ${formData.message}`;

      const submission: ContactFormSubmissions = {
        _id: crypto.randomUUID(),
        fullName: formData.fullName,
        country: formData.country,
        preferredContactMethod: formData.preferredContactMethod,
        contactDetails: formData.contactDetails,
        message: messageContent,
        selectedCorset: productName,
      };

      await BaseCrudService.create('contactformsubmissions', submission);

      await sendOrderNotification({
        title: 'Gallery Custom Remake Request',
        productName: productName,
        formData: formData,
      });

      setIsSubmittedSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to send request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalAnimationVariants: any = isMobile
    ? {
        initial: { y: '100%', opacity: 1 },
        animate: { 
          y: 0, 
          opacity: 1,
          transition: { type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }
        },
        exit: { 
          y: '100%', 
          opacity: 1,
          transition: { type: 'tween', duration: 0.3, ease: [0.16, 1, 0.3, 1] }
        },
      }
    : {
        initial: { opacity: 0, scale: 0.95, y: 10 },
        animate: { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
        },
        exit: { 
          opacity: 0, 
          scale: 0.95, 
          y: 10,
          transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as any}
        },
      };

  return (
    <div className="min-h-screen bg-background font-paragraph text-foreground selection:bg-soft-gold/20 flex flex-col">
      <Header />

      <main className="flex-1 py-8 md:py-16">
        <div className="mx-auto max-w-[120rem] px-6 md:px-20">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 md:mb-16 flex flex-col items-center"
          >
            <h1 className="font-heading text-2xl md:text-4xl text-foreground mb-3">
              Customer Gallery
            </h1>
            
            <p className="font-paragraph text-xs md:text-sm text-foreground/60 max-w-xl text-center leading-relaxed mb-5">
              Real fits & custom styling from the community
            </p>

            {reviews.length > 0 && (
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10">
                <span className="font-heading text-[10px] sm:text-xs uppercase tracking-widest text-foreground/70">
                  {reviews.length} Styled Looks
                </span>
              </div>
            )}
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4 md:gap-y-16">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex flex-col animate-pulse">
                  <div className="bg-foreground/5 rounded-xl aspect-[3/4] w-full shadow-sm"></div>
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4 md:gap-y-16">
                {reviews.slice(0, visibleCount).map((review, index) => (
                  <GalleryCard
                    key={review._id || index}
                    review={review}
                    index={index}
                    loadingReviewId={loadingReviewId}
                    onOpenReview={handleOpenReview}
                  />
                ))}
              </div>

              {/* Кнопка Load More */}
              {visibleCount < reviews.length && (
                <div className="mt-12 md:mt-16 flex justify-center">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 12)}
                    className="px-8 py-3 border border-foreground/20 text-foreground text-xs font-heading uppercase tracking-widest rounded-full hover:border-soft-gold hover:text-soft-gold transition-colors duration-300 shadow-sm"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center">
              <p className="font-heading text-base text-foreground/60 md:text-lg">
                No customer photos yet. Be the first to share a look!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* --- PREVIEW MODAL --- */}
      <AnimatePresence>
        {selectedReview && !isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 font-paragraph text-foreground overscroll-contain">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={handleCloseReview}
              className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
            />

            <motion.div
              variants={modalAnimationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative z-10 flex max-h-[85dvh] sm:max-h-[85vh] w-full flex-col overflow-hidden rounded-t-[24px] border border-foreground/15 bg-background shadow-2xl sm:max-w-2xl sm:rounded-2xl"
            >
              <div className="flex w-full shrink-0 justify-center pt-3 pb-1 sm:hidden">
                <div className="h-1.5 w-10 rounded-full bg-foreground/20" />
              </div>

              <button
                onClick={handleCloseReview}
                className="absolute right-4 top-4 z-30 hidden rounded-full bg-black/10 p-2 text-foreground transition-colors hover:bg-black/20 sm:block"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="modal-scrollbar flex w-full flex-1 flex-col overflow-y-auto sm:flex-row sm:overflow-hidden">
                <div
                  className="group relative aspect-[3/4] w-full shrink-0 cursor-zoom-in overflow-hidden bg-ivory/50 sm:w-1/2"
                  onClick={handleOpenZoom}
                >
                  {isZoomPreparing && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/10 backdrop-blur-sm transition-opacity">
                      <LoadingSpinner />
                    </div>
                  )}

                  <Image
                    src={getOptimizedWixImage(getImageUrl(selectedReview), 1200, 1200)}
                    alt={selectedReview.reviewTitle || 'Review'}
                    fill
                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="flex w-full flex-1 flex-col justify-between p-5 sm:w-1/2 sm:overflow-y-auto sm:p-7">
                  <div className="space-y-2.5">
                    <span className="font-heading text-xs uppercase tracking-widest text-soft-gold">
                      Customer Look
                    </span>

                    <h2 className="font-heading text-xl text-foreground sm:text-2xl">
                      {selectedReview.reviewTitle || 'Custom Handcrafted Piece'}
                    </h2>

                    <p className="font-paragraph text-xs leading-relaxed text-foreground/80 sm:text-sm">
                      Like this style? Every piece is handmade and unique. A custom remake can be requested based on the selected style and individual measurements.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-2 border-t border-foreground/10 pt-4 pb-2 sm:pb-0">
                    <Button
                      onClick={() => handleOpenForm(selectedReview)}
                      className="w-full rounded-full bg-foreground py-3.5 font-heading text-xs uppercase tracking-widest text-background shadow-md transition-all hover:bg-soft-gold hover:text-white"
                    >
                      Custom Order
                    </Button>
                    <button
                      type="button"
                      onClick={handleCloseReview}
                      className="w-full py-2 text-center font-heading text-xs text-foreground/50 hover:text-foreground transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- FORM MODAL --- */}
      <AnimatePresence>
        {isFormOpen && selectedReview && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4 font-paragraph text-foreground overscroll-contain">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={handleCloseForm}
              className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
            />

            <motion.div
              variants={modalAnimationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative z-10 flex max-h-[85dvh] sm:max-h-[85vh] w-full flex-col overflow-hidden rounded-t-[24px] border border-foreground/15 bg-background shadow-2xl sm:max-w-md sm:rounded-2xl"
            >
              <div className="flex w-full shrink-0 justify-center pt-3 pb-1 sm:hidden">
                <div className="h-1.5 w-10 rounded-full bg-foreground/20" />
              </div>

              <button
                onClick={handleCloseForm}
                className="absolute right-4 top-4 z-30 hidden rounded-full bg-black/10 p-2 text-foreground transition-colors hover:bg-black/20 sm:block"
                aria-label="Close form"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="modal-scrollbar flex-1 overflow-y-auto p-5 sm:p-7 overscroll-contain">
                {isSubmittedSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center space-y-4 py-8 text-center"
                  >
                    <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-soft-gold/15 text-soft-gold">
                      <CheckCircle2 className="h-10 w-10 stroke-[1.5]" />
                    </div>

                    <h2 className="font-heading text-2xl text-foreground">
                      Request Received!
                    </h2>

                    <p className="max-w-md font-heading text-xs leading-relaxed text-foreground/75 sm:text-sm">
                      Thank you, {formData.fullName || 'there'}. The Custom Order request for &quot;{getProductName(selectedReview)}&quot; has been received. A reply will be sent shortly.
                    </p>

                    <Button
                      onClick={handleCloseForm}
                      className="mt-4 w-full rounded-full bg-foreground py-3.5 font-heading text-xs uppercase tracking-widest text-background transition-all hover:bg-soft-gold hover:text-white"
                    >
                      Got It
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-3 flex items-center gap-3 rounded-xl border border-foreground/10 bg-ivory p-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={getOptimizedWixImage(getImageUrl(selectedReview), 400, 400)}
                          alt="Product"
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div>
                        <p className="font-heading text-xs sm:text-sm font-semibold text-foreground">
                          {getProductName(selectedReview)}
                        </p>
                        <p className="mt-0.5 font-heading text-xs font-bold text-soft-gold">
                          Custom Order
                        </p>
                      </div>
                    </div>

                    <h2 className="mb-1 font-heading text-xl text-foreground sm:text-2xl">
                      Custom Order
                    </h2>

                    <p className="mb-4 font-heading text-xs text-foreground/70">
                      Leave contact details to request a custom remake of this piece.
                    </p>

                    <form id="custom-order-form" onSubmit={handleSubmit} className="space-y-3.5 pb-4">
                      <div>
                        <Label
                          htmlFor="fullName"
                          className="mb-1 block font-heading text-[11px] uppercase tracking-wider text-foreground/70"
                        >
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          required
                          value={formData.fullName}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              fullName: event.target.value,
                            })
                          }
                          className="rounded-lg font-heading text-base sm:text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="country" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1.5 block">Country *</Label>
                        <Select
                          required
                          value={selectedCountryCode}
                          onValueChange={(code) => {
                            setSelectedCountryCode(code);
                            setFormData({
                              ...formData,
                              country: Country.getCountryByCode(code)?.name || '',
                            });
                          }}
                        >
                          <SelectTrigger id="country" className="font-heading text-base sm:text-sm rounded-lg">
                            <SelectValue placeholder="Select Country..." />
                          </SelectTrigger>
                          <SelectContent className="z-[110] max-h-60" position="popper" sideOffset={4}>
                            {Country.getAllCountries()
                              .filter((c) => NOVA_POSHTA_COUNTRIES.includes(c.isoCode))
                              .map((c) => (
                                <SelectItem key={c.isoCode} value={c.isoCode}>
                                  {c.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label
                          htmlFor="preferredContactMethod"
                          className="mb-1 block font-heading text-[11px] uppercase tracking-wider text-foreground/70"
                        >
                          Contact Method *
                        </Label>
                        <Select
                          required
                          value={formData.preferredContactMethod}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              preferredContactMethod: value,
                              contactDetails: '',
                            })
                          }
                        >
                          <SelectTrigger
                            id="preferredContactMethod"
                            className="rounded-lg font-heading text-base sm:text-sm"
                          >
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent
                            className="z-[110]"
                            position="popper"
                            sideOffset={4}
                          >
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.preferredContactMethod && (
                        <div>
                          <Label
                            htmlFor="contactDetails"
                            className="mb-1 block font-heading text-[11px] uppercase tracking-wider text-foreground/70"
                          >
                            {formData.preferredContactMethod === 'instagram' && 'Instagram Handle *'}
                            {formData.preferredContactMethod === 'whatsapp' && 'WhatsApp Number *'}
                            {formData.preferredContactMethod === 'email' && 'Email Address *'}
                          </Label>
                          <Input
                            id="contactDetails"
                            required
                            value={formData.contactDetails}
                            onChange={(event) =>
                              setFormData({
                                ...formData,
                                contactDetails: event.target.value,
                              })
                            }
                            placeholder={
                              formData.preferredContactMethod === 'instagram'
                                ? '@yourhandle'
                                : formData.preferredContactMethod === 'whatsapp'
                                  ? '+1 234 567 890'
                                  : 'your@email.com'
                            }
                            className="rounded-lg font-heading text-base sm:text-sm"
                          />
                        </div>
                      )}

                      <div>
                        <Label
                          htmlFor="message"
                          className="mb-1 block font-heading text-[11px] uppercase tracking-wider text-foreground/70"
                        >
                          Additional Notes
                        </Label>
                        <Textarea
                          id="message"
                          rows={3}
                          value={formData.message}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              message: event.target.value,
                            })
                          }
                          placeholder="Add notes, measurements, or preferred details."
                          className="resize-none rounded-lg font-heading text-base sm:text-sm"
                        />
                      </div>

                      <div className="pt-3 space-y-2">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full rounded-full bg-foreground py-3.5 font-heading text-xs uppercase tracking-widest text-background shadow-md transition-all hover:bg-soft-gold hover:text-white disabled:opacity-50"
                        >
                          {isSubmitting ? 'Sending...' : 'Send Request'}
                        </Button>
                        <button
                          type="button"
                          onClick={handleCloseForm}
                          className="w-full py-2 text-center font-heading text-xs text-foreground/50 hover:text-foreground transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- FULLSCREEN МОДАЛКА ЗУМА С PINCH-TO-ZOOM --- */}
      <AnimatePresence>
        {isFullscreenZoom && selectedReview && (
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
                className="relative inline-flex items-center justify-center cursor-crosshair max-w-full max-h-full touch-none"
                onMouseEnter={() => setShowModalZoom(true)}
                onMouseLeave={() => setShowModalZoom(false)}
                onMouseMove={handleModalMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onContextMenu={(e) => e.preventDefault()}
                onClick={(e) => e.stopPropagation()} 
                style={{ touchAction: 'none' }}
              >
                <div className={`transition-opacity duration-300 ${showModalZoom ? 'md:opacity-0' : 'opacity-100'}`}>
                  <img
                    key={`zoom-${selectedReview._id}`}
                    src={getOptimizedWixImage(getImageUrl(selectedReview), 2400, 2400) || ''}
                    alt={selectedReview.reviewTitle || 'Zoomed View'}
                    draggable={false}
                    className="max-w-full max-h-[85vh] sm:max-h-[90vh] w-auto h-auto object-contain select-none"
                    style={{ 
                      transform: `translate3d(${touchPos.x}px, ${touchPos.y}px, 0) scale(${touchScale})`,
                      transition: touchState.current.isPinching || touchState.current.isPanning ? 'none' : 'transform 0.2s ease-out',
                      WebkitUserDrag: 'none'
                    }}
                  />
                </div>
                
                {getImageUrl(selectedReview) && (
                  <div
                    className={`absolute inset-0 z-20 pointer-events-none hidden md:block transition-opacity duration-150 ${
                      showModalZoom ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      backgroundImage: `url(${getOptimizedWixImage(getImageUrl(selectedReview), 2400, 2400) || ''})`,
                      backgroundPosition: `${modalZoomPos.x}% ${modalZoomPos.y}%`,
                      backgroundSize: '150%',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}