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
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Reviews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Reviews | null>(null);
  const [isReviewImageLoading, setIsReviewImageLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    country: '',
    preferredContactMethod: '',
    contactDetails: '',
    message: '',
  });

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
    if (!selectedReview) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedReview]);

  const getImageUrl = (review: any) => {
    const rawImage =
      review.reviewImage ||
      review.ReviewImage ||
      review.image ||
      review.photo ||
      review.src ||
      '';

    if (typeof rawImage === 'object' && rawImage !== null) {
      return rawImage.url || rawImage.src || '';
    }

    return rawImage;
  };

  const getProductName = (review: any) => {
    return (
      review.productName ||
      review.reviewTitle ||
      review.title ||
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
    setIsSubmittedSuccess(false);
  };

  const handleOpenReview = (review: Reviews) => {
    setSelectedReview(review);
    setIsReviewImageLoading(true);
  };

  const handleCloseReview = () => {
    setSelectedReview(null);
    setIsReviewImageLoading(false);
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedReview) return;

    setIsSubmitting(true);
    const productName = getProductName(selectedReview);

    try {
      const messageContent = `Custom Order Request.\n\nProduct: ${productName}\n\nAdditional Notes: ${formData.message}`;

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

      const emailData: Record<string, string> = {
        _subject: `✨ Custom Order: ${productName}`,
        _template: 'box',
        Product: productName,
        Price: 'Price upon request',
      };

      if (formData.fullName) emailData['Customer Name'] = formData.fullName;
      if (formData.country) emailData.Country = formData.country;
      if (formData.preferredContactMethod) emailData['Contact Method'] = formData.preferredContactMethod;
      if (formData.contactDetails) emailData['Contact Details'] = formData.contactDetails;
      if (formData.message) emailData['Message / Notes'] = formData.message;

      await fetch(
        'https://formsubmit.co/ajax/4beb55a3be4e0d00a05176afdef4a527',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(emailData),
        }
      );

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
                        width={600}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
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

      <AnimatePresence>
        {selectedReview && !isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseReview}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Модальное окно с равными пропорциями 50%/50% */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-2xl md:flex-row"
            >
              <button
                onClick={handleCloseReview}
                className="absolute right-3 top-3 z-30 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Левая часть — фото (50% ширины) */}
              <div className="relative aspect-[3/4] w-full bg-ivory/50 md:w-1/2">
                {isReviewImageLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-ivory">
                    <LoadingSpinner />
                    <span className="font-heading text-[10px] uppercase tracking-widest text-foreground/40">
                      Loading photo
                    </span>
                  </div>
                )}

                <Image
                  src={getImageUrl(selectedReview)}
                  alt={selectedReview.reviewTitle || 'Review'}
                  width={1200}
                  onLoad={() => setIsReviewImageLoading(false)}
                  onError={() => setIsReviewImageLoading(false)}
                  className={`h-full w-full object-cover ${
                    isReviewImageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              </div>

              {/* Правая часть — текст (симметричные 50% ширины) */}
              <div className="flex w-full flex-col justify-between overflow-y-auto p-6 md:w-1/2 md:p-8">
                <div className="space-y-3">
                  <span className="font-heading text-xs uppercase tracking-widest text-soft-gold">
                    Customer Look
                  </span>

                  <h2 className="font-heading text-xl text-foreground md:text-2xl">
                    {selectedReview.reviewTitle || 'Custom Handcrafted Piece'}
                  </h2>

                  <p className="font-paragraph text-xs leading-relaxed text-foreground/80 md:text-sm">
                    Like this style? Every piece is handmade and unique. A custom remake can be requested based on the selected style and individual measurements.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-foreground/10 pt-4">
                  <Button
                    onClick={() => handleOpenForm(selectedReview)}
                    className="w-full rounded-full bg-foreground py-3.5 font-heading text-xs uppercase tracking-widest text-background shadow-md transition-all hover:bg-soft-gold hover:text-white"
                  >
                    Custom Order
                  </Button>

                  <button
                    onClick={handleCloseReview}
                    className="w-full py-1 text-center font-heading text-xs text-foreground/50 transition-colors hover:text-foreground"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFormOpen && selectedReview && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseForm}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-2xl"
            >
              <button
                onClick={handleCloseForm}
                className="absolute right-3 top-3 z-30 rounded-full bg-black/10 p-2 text-foreground transition-colors hover:bg-black/20"
                aria-label="Close form"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="overflow-y-auto p-6 md:p-8">
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

                    <p className="max-w-md font-heading text-xs leading-relaxed text-foreground/75 md:text-sm">
                      Thank you, {formData.fullName || 'there'}. The Custom Order request for &quot;{getProductName(selectedReview)}&quot; has been received. A reply will be sent shortly.
                    </p>

                    <Button
                      onClick={handleCloseForm}
                      className="w-full rounded-full bg-foreground py-3.5 font-heading text-xs uppercase tracking-widest text-background transition-all hover:bg-soft-gold hover:text-white"
                    >
                      Got It
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center gap-3 rounded-xl border border-foreground/10 bg-ivory p-3">
                      <Image
                        src={getImageUrl(selectedReview)}
                        alt="Product"
                        width={60}
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />

                      <div>
                        <p className="font-heading text-sm font-semibold text-foreground">
                          {getProductName(selectedReview)}
                        </p>

                        <p className="mt-0.5 font-heading text-xs font-bold text-soft-gold">
                          Custom Order
                        </p>
                      </div>
                    </div>

                    <h2 className="mb-1 font-heading text-xl text-foreground md:text-2xl">
                      Custom Order
                    </h2>

                    <p className="mb-4 font-heading text-xs text-foreground/70 md:text-sm">
                      Leave contact details to request a custom remake of this piece. A fitting & measurement guide will be provided after the request.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label
                          htmlFor="fullName"
                          className="mb-1.5 block font-heading text-xs uppercase tracking-wider text-foreground/70"
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
                          className="rounded-lg font-heading text-sm"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="country"
                          className="mb-1.5 block font-heading text-xs uppercase tracking-wider text-foreground/70"
                        >
                          Country *
                        </Label>

                        <Input
                          id="country"
                          required
                          value={formData.country}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              country: event.target.value,
                            })
                          }
                          className="rounded-lg font-heading text-sm"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="preferredContactMethod"
                          className="mb-1.5 block font-heading text-xs uppercase tracking-wider text-foreground/70"
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
                            className="rounded-lg font-heading text-sm"
                          >
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>

                          <SelectContent
                            className="z-[70]"
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
                            className="mb-1.5 block font-heading text-xs uppercase tracking-wider text-foreground/70"
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
                                ? '@handle'
                                : formData.preferredContactMethod === 'whatsapp'
                                  ? '+1 234 567 890'
                                  : 'email@example.com'
                            }
                            className="rounded-lg font-heading text-sm"
                          />
                        </div>
                      )}

                      <div>
                        <Label
                          htmlFor="message"
                          className="mb-1.5 block font-heading text-xs uppercase tracking-wider text-foreground/70"
                        >
                          Additional Notes
                        </Label>

                        <Textarea
                          id="message"
                          rows={4}
                          value={formData.message}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              message: event.target.value,
                            })
                          }
                          placeholder="Add notes, measurements, or preferred details."
                          className="resize-none rounded-lg font-heading text-sm"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-full bg-foreground py-3.5 font-heading text-xs uppercase tracking-widest text-background transition-all hover:bg-soft-gold hover:text-white disabled:opacity-50"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Request'}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}