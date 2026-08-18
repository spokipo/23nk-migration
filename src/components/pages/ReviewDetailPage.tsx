import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Review {
  _id: string;
  reviewTitle?: string;
  reviewImage?: string;
  shortDescription?: string;
}

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      if (!id) return;
      
      setIsLoading(true);
      const data = await BaseCrudService.getById<Review>('reviews', id);
      setReview(data);
      setIsLoading(false);
    };

    fetchReview();
  }, [id]);

  return (
    <div className="min-h-screen bg-background font-paragraph text-foreground">
      <Header />
      
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-background">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12">
          <div className="min-h-[500px]">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner />
              </div>
            ) : !review ? (
              <div className="text-center py-20">
                <p className="font-heading text-base md:text-lg text-foreground/60">Review not found</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid md:grid-cols-2 gap-8 md:gap-16"
              >
                {/* Image */}
                <div className="bg-ivory rounded-lg overflow-hidden aspect-square md:aspect-[3/4]">
                  <Image
                    src={review.reviewImage || ''}
                    alt={review.reviewTitle || 'Review'}
                    width={800}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center">
                  <h1 className="font-heading text-3xl md:text-5xl text-foreground mb-6 md:mb-8">
                    {review.reviewTitle}
                  </h1>
                  
                  <p className="font-paragraph text-base md:text-lg text-foreground/80 leading-relaxed mb-8 md:mb-12">
                    {review.shortDescription}
                  </p>

                  <Link to="/contact">
                    <Button
                      size="lg"
                      className="bg-foreground text-background hover:bg-foreground/90 rounded-lg px-8 md:px-12 py-4 md:py-6 text-xs md:text-base tracking-widest font-heading"
                    >
                      ORDER CUSTOM TAILORING
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
