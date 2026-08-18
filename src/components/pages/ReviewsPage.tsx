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
import { CheckCircle2, X, ZoomIn } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Reviews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Reviews | null>(null);
  const [isReviewImageLoading, setIsReviewImageLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Стейт для страны
  const [selectedCountryCode, setSelectedCountryCode] = useState('');

  // Fullscreen Zoom Lightbox
  const [isFullscreenZoom, setIsFullscreenZoom] = useState(false);
  const [isZoomImageLoading, setIsZoomImageLoading] = useState(true);

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
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const result = await BaseCrudService.getAll<Reviews>('reviews');
        setReviews(result.items || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
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
    setSelectedReview(review);
    setIsReviewImageLoading(true);
  };

  const handleCloseReview = () => {
    setSelectedReview(null);
    setIsReviewImageLoading(false);
    setIsFullscreenZoom(false);
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
    setIsZoomImageLoading(true);
    setIsFullscreenZoom(true);
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
        title: '✨ Gallery Custom Remake Request',
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

  const modalAnimationVariants = isMobile
    ? {
        initial: { y: '100%', opacity: 1 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 1 },
        transition: { type: 'spring', damping: 20, stiffness: 150 }, // Смягченная пружина
      }
    : {
        initial: { opacity: 0, scale: 0.95, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 10 },
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
      };

  return (
    <div className="min-h-screen bg-background font-paragraph text-foreground selection:bg-soft-gold/20">
      <Header />

      <main className="py-6 md:py-12">
        <div className="mx-auto max-w-[120rem] px-4 md:px-20">
          <div className="mb-6 flex flex-col justify-between border-b border-foreground/10 pb-4 text-center md:mb-10 md:flex-row md:items-end md:text-left">
            <div>
              <h1 className="font-heading text-2xl text-foreground md:text-4xl">
                Customer Gallery
              </h1>
              <p className="mt-1 font-paragraph text-xs text-foreground/60 md:text-sm">
                Real fits & custom styling from the community
              </p>
            </div>

            <div className="hidden font-heading text-xs uppercase tracking-widest text-foreground/50 md:block">
              {reviews.length} Styled Looks
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <LoadingSpinner />
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {reviews.map((review, index) => {
                const imageUrl = getImageUrl(review);

                return (
                  <motion.div
                    key={review._id || index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.04,
                    }}
                    onClick={() => handleOpenReview(review)}
                    className="group relative flex cursor-pointer flex-col"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-ivory shadow-sm transition-all duration-500 group-hover:shadow-md">
                      <Image
                        src={imageUrl}
                        alt={review.reviewTitle || 'Customer Review'}
                        fill
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="translate-y-2 transform rounded-full bg-ivory px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground shadow-lg transition-transform duration-300 group-hover:translate-y-0 sm:text-xs">
                          Quick View
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <h3 className="line-clamp-1 font-heading text-xs text-foreground transition-colors group-hover:text-soft-gold sm:text-sm">
                        {review.reviewTitle || 'Custom Handcrafted Outfit'}
                      </h3>
                    </div>
                  </motion.div>
                );
              })}
            </div>
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
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 font-paragraph text-foreground">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseReview}
              className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
            />

            <motion.div
              variants={modalAnimationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[24px] border border-foreground/15 bg-background shadow-2xl sm:max-h-[85vh] sm:max-w-2xl sm:rounded-2xl"
            >
              {/* Mobile Drag Indicator */}
              <div className="flex w-full shrink-0 justify-center pt-3 pb-1 sm:hidden">
                <div className="h-1.5 w-10 rounded-full bg-foreground/20" />
              </div>

              {/* Desktop Close Button */}
              <button
                onClick={handleCloseReview}
                className="absolute right-4 top-4 z-30 hidden rounded-full bg-black/10 p-2 text-foreground transition-colors hover:bg-black/20 sm:block"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="modal-scrollbar flex w-full flex-1 flex-col overflow-y-auto sm:flex-row sm:overflow-hidden">
                {/* Left: Image */}
                <div
                  className="group/zoom relative aspect-[3/4] w-full shrink-0 cursor-zoom-in overflow-hidden bg-ivory/50 sm:w-1/2"
                  onClick={handleOpenZoom}
                >
                  {isReviewImageLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-ivory">
                      <LoadingSpinner />
                    </div>
                  )}

                  <Image
                    src={getImageUrl(selectedReview)}
                    alt={selectedReview.reviewTitle || 'Review'}
                    fill
                    onLoad={() => setIsReviewImageLoading(false)}
                    onError={() => setIsReviewImageLoading(false)}
                    className={`h-full w-full object-cover transition-all duration-700 group-hover/zoom:scale-105 ${
                      isReviewImageLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                  />

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover/zoom:opacity-100">
                    <div className="translate-y-2 transform rounded-full bg-black/60 p-2.5 text-white backdrop-blur-sm transition-all duration-300 group-hover/zoom:translate-y-0">
                      <ZoomIn className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Right: Info & Unified in-flow CTA */}
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

                  {/* Actions directly inside scroll flow */}
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
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4 font-paragraph text-foreground">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseForm}
              className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
            />

            <motion.div
              variants={modalAnimationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[24px] border border-foreground/15 bg-background shadow-2xl sm:max-h-[85vh] sm:max-w-md sm:rounded-2xl"
            >
              {/* Mobile Drag Indicator */}
              <div className="flex w-full shrink-0 justify-center pt-3 pb-1 sm:hidden">
                <div className="h-1.5 w-10 rounded-full bg-foreground/20" />
              </div>

              {/* Close Button (Desktop Only) */}
              <button
                onClick={handleCloseForm}
                className="absolute right-4 top-4 z-30 hidden rounded-full bg-black/10 p-2 text-foreground transition-colors hover:bg-black/20 sm:block"
                aria-label="Close form"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="modal-scrollbar flex-1 overflow-y-auto p-5 sm:p-7">
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
                          src={getImageUrl(selectedReview)}
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
                          <SelectContent className="z-[110] max-h-60">
                            {Country.getAllCountries()
                              .filter((c) => c.isoCode !== 'RU' && c.isoCode !== 'BY')
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

                      {/* Unified Submit Buttons */}
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

      {/* --- FULLSCREEN LIGHTBOX ZOOM --- */}
      <AnimatePresence>
        {isFullscreenZoom && selectedReview && (
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
                src={getImageUrl(selectedReview)}
                alt={selectedReview.reviewTitle || 'Zoomed View'}
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

      <Footer />
    </div>
  );
}