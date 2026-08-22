import Footer from '@/components/Footer';
import Header from '@/components/Header';
import GalleryModal from '@/components/GalleryModal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Reviews } from '@/entities';
import { BaseCrudService } from '@/integrations';
import { getOptimizedWixImage } from '@/lib/imageUtils';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

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

interface GalleryCardProps {
  review: Reviews;
  index: number;
  loadingReviewId: string | null;
  onOpenReview: (review: Reviews) => void;
}

function GalleryCard({ review, index, loadingReviewId, onOpenReview }: GalleryCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  const rawUrl = getImageUrl(review);
  const imageUrl = getOptimizedWixImage(rawUrl, 1200, 1200); 

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: (index % 12) * 0.04,
      }}
      onClick={() => onOpenReview(review)}
      className="group relative flex cursor-pointer flex-col"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-ivory shadow-sm transition-all duration-500 group-hover:shadow-md w-full">
        
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
          ref={(node) => {
            if (node?.complete) {
              setIsImageLoaded(true);
            }
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/30 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10 pointer-events-none">
          <span className="translate-y-2 transform rounded-full bg-ivory px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground shadow-lg transition-transform duration-300 group-hover:translate-y-0 sm:text-xs">
            Quick View
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ReviewsPage() {
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
      if (wasCreated && meta) {
        document.head.removeChild(meta);
      }
    };
  }, []);
  
  const [reviews, setReviews] = useState<Reviews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Reviews | null>(null);
  
  const [visibleCount, setVisibleCount] = useState(12);
  const [loadingReviewId, setLoadingReviewId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const result = await BaseCrudService.getAll<Reviews>('reviews');
        const items = result.items || [];
        
        if (!isMounted) return;
        setReviews(items);

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

  const handleOpenReview = (review: Reviews) => {
    const rawSrc = getImageUrl(review);
    const currentSrc = getOptimizedWixImage(rawSrc, 1200, 1200);
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

      <GalleryModal 
        selectedReview={selectedReview} 
        onClose={() => setSelectedReview(null)} 
      />

      <Footer />
    </div>
  );
}