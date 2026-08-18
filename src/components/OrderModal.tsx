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
import { ContactFormSubmissions } from '@/entities';
import { useToast } from '@/hooks/use-toast';
import { BaseCrudService } from '@/integrations';
import { sendOrderNotification } from '@/integrations/notifications';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ProductData {
  _id: string;
  name: string;
  price?: number;
  mainImage?: string;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductData;
  modalMode: 'claim' | 'custom';
}

export default function OrderModal({
  isOpen,
  onClose,
  product,
  modalMode,
}: OrderModalProps) {
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paypalClientId, setPaypalClientId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    country: '',
    stateRegion: '',
    city: '',
    streetAddress: '',
    postalCode: '',
    phone: '',
    email: '',
    preferredContactMethod: '',
    contactDetails: '',
    message: '',
  });

  useEffect(() => {
    setMounted(true);
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    fetch('/api/paypal/config')
      .then((res) => res.json())
      .then((data) => setPaypalClientId(data.clientId || null))
      .catch(() => setPaypalClientId(null));
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      fullName: '',
      country: '',
      stateRegion: '',
      city: '',
      streetAddress: '',
      postalCode: '',
      phone: '',
      email: '',
      preferredContactMethod: '',
      contactDetails: '',
      message: '',
    });
    setIsSubmittedSuccess(false);
    setShowPayment(false);
    setPaymentError(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      resetForm();
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let messageContent = '';
      let preferredContact = formData.preferredContactMethod;
      let contactDet = formData.contactDetails;

      if (modalMode === 'claim') {
        contactDet =
          formData.preferredContactMethod === 'email'
            ? formData.email
            : formData.preferredContactMethod === 'whatsapp'
              ? formData.phone
              : formData.contactDetails;

        messageContent = [
          `ORDER REQUEST (In-Stock Piece)`,
          `Product: ${product.name}`,
          `Price: $${product.price?.toFixed(2)}`,
          `----------------------------------------`,
          `SHIPPING DETAILS:`,
          `Full Name: ${formData.fullName}`,
          `Country: ${formData.country}`,
          `State/Region: ${formData.stateRegion}`,
          `City: ${formData.city}`,
          `Address: ${formData.streetAddress}`,
          `Postal Code: ${formData.postalCode}`,
          `Phone: ${formData.phone}`,
          `Email: ${formData.email}`,
          `Contact Method: ${formData.preferredContactMethod}`,
          `Contact Details: ${contactDet}`,
          formData.message ? `\nNotes: ${formData.message}` : '',
        ]
          .filter(Boolean)
          .join('\n');
      } else {
        messageContent = [
          `CUSTOM ORDER REQUEST`,
          `Product: ${product.name}`,
          `----------------------------------------`,
          `Additional Notes: ${formData.message}`,
        ].join('\n');
      }

      const submission: ContactFormSubmissions = {
        _id: crypto.randomUUID(),
        fullName: formData.fullName,
        country: formData.country,
        preferredContactMethod: preferredContact,
        contactDetails: contactDet,
        message: messageContent,
        selectedCorset: product.name,
      };

      await BaseCrudService.create('contactformsubmissions', submission);

      if (modalMode === 'claim') {
        setShowPayment(true);
      } else {
        await sendOrderNotification({
          title: '✨ Custom Order Request',
          productName: product.name,
          price: product.price,
          formData: formData,
        });
        setIsSubmittedSuccess(true);
      }
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

  if (!mounted) return null;

  const modalAnimationVariants = isMobile
    ? {
        initial: { y: '100%', opacity: 1 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 1 },
        transition: { type: 'spring', damping: 28, stiffness: 300 },
      }
    : {
        initial: { opacity: 0, scale: 0.95, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 10 },
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
      };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4 font-paragraph text-foreground">
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
          />

          {/* MODAL CONTAINER */}
          <motion.div
            role="dialog"
            aria-modal="true"
            {...modalAnimationVariants}
            className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[24px] border border-foreground/15 bg-background shadow-2xl sm:max-h-[85vh] sm:max-w-[540px] sm:rounded-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Indicator */}
            <div className="flex w-full shrink-0 justify-center pt-3 pb-1 sm:hidden">
              <div className="h-1.5 w-10 rounded-full bg-foreground/20" />
            </div>

            {/* Desktop Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-30 hidden rounded-full bg-black/10 p-2 text-foreground transition-colors hover:bg-black/20 sm:block"
              aria-label="Close form"
            >
              <X className="h-4 w-4" />
            </button>

            {/* SCROLLABLE AREA */}
            <div className="modal-scrollbar flex-1 overflow-y-auto p-5 sm:p-7">
              <AnimatePresence mode="wait">
                {isSubmittedSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center space-y-4 py-8 text-center"
                  >
                    <div className="w-16 h-16 bg-soft-gold/15 rounded-full flex items-center justify-center text-soft-gold mb-2">
                      <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <h2 className="font-heading text-2xl text-foreground">
                      {modalMode === 'claim' ? 'Order Confirmed!' : 'Request Received!'}
                    </h2>
                    <p className="font-heading text-xs md:text-sm text-foreground/75 max-w-md leading-relaxed">
                      {modalMode === 'claim' ? (
                        <>
                          Thank you, {formData.fullName || 'friend'}! Your order for "{product.name}" has been confirmed. Your payment has been received successfully.
                        </>
                      ) : (
                        <>
                          Thank you, {formData.fullName || 'friend'}! Your request for "{product.name}" has been received. A reply will be sent shortly.
                        </>
                      )}
                    </p>
                    <div className="pt-4 w-full">
                      <Button
                        onClick={handleClose}
                        className="w-full bg-foreground text-background hover:bg-soft-gold hover:text-white transition-all rounded-full py-3.5 font-heading text-xs uppercase tracking-widest"
                      >
                        Got It
                      </Button>
                    </div>
                  </motion.div>
                ) : showPayment ? (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 pb-6"
                  >
                    <div className="space-y-1">
                      <h2 className="font-heading text-xl md:text-2xl text-foreground">Payment</h2>
                      <p className="font-heading text-xs text-foreground/70">
                        Complete your payment to confirm the order.
                      </p>
                    </div>

                    <div className="p-3 bg-ivory rounded-xl flex gap-3 items-center border border-foreground/10">
                      <Image src={product.mainImage || ''} alt={product.name} width={60} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                      <div>
                        <p className="font-heading text-sm text-foreground font-semibold">{product.name}</p>
                        <p className="font-heading text-xs text-soft-gold font-bold mt-0.5">${product.price?.toFixed(2)}</p>
                      </div>
                    </div>

                    {paymentError && <p className="font-heading text-xs text-red-500">{paymentError}</p>}

                    {paypalClientId ? (
                      <div className="pt-2">
                        <PayPalScriptProvider options={{ clientId: paypalClientId, currency: 'USD' }}>
                          <PayPalButtons
                            style={{ layout: 'vertical', shape: 'pill' }}
                            forceReRender={[product._id, product.price]}
                            createOrder={async () => {
                              setPaymentError(null);
                              const res = await fetch('/api/paypal/create-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ productId: product._id }),
                              });
                              const data = await res.json();
                              if (!res.ok) {
                                setPaymentError('Could not start PayPal checkout. Please try again.');
                                throw new Error(data.error || 'create-order failed');
                              }
                              return data.id;
                            }}
                            onApprove={async (data) => {
                              try {
                                const res = await fetch('/api/paypal/capture-order', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ orderID: data.orderID }),
                                });
                                if (!res.ok) {
                                  setPaymentError('Payment could not be completed. Please try again.');
                                  return;
                                }
                                await sendOrderNotification({
                                  title: '🔥 PAID ORDER (PayPal)',
                                  productName: product.name,
                                  price: product.price,
                                  formData: formData,
                                });
                                setIsSubmittedSuccess(true);
                              } catch (err) {
                                setPaymentError('An error occurred during payment processing.');
                              }
                            }}
                            onError={() => setPaymentError('PayPal checkout error. Please try again.')}
                          />
                        </PayPalScriptProvider>
                      </div>
                    ) : (
                      <div className="py-4 flex justify-center"><LoadingSpinner /></div>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowPayment(false)}
                      className="w-full text-center font-heading text-xs text-foreground/60 hover:text-foreground py-2"
                    >
                      Back to details
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="space-y-1 mb-3">
                      <h2 className="font-heading text-xl md:text-2xl text-foreground">
                        {modalMode === 'claim' ? 'Shipping Details' : 'Custom Order'}
                      </h2>
                      <p className="font-heading text-xs text-foreground/70">
                        {modalMode === 'claim'
                          ? 'Fill in your delivery details to reserve and complete your order.'
                          : 'Leave your contact details to request a custom order.'}
                      </p>
                    </div>

                    <div className="p-3 bg-ivory rounded-xl flex gap-3 items-center border border-foreground/10 mb-4">
                      <Image src={product.mainImage || ''} alt={product.name} width={56} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                      <div>
                        <p className="font-heading text-xs sm:text-sm text-foreground font-semibold">{product.name}</p>
                        <p className="font-heading text-xs text-soft-gold font-bold mt-0.5">${product.price?.toFixed(2)}</p>
                      </div>
                    </div>

                    <form id="order-form" onSubmit={handleSubmit} className="space-y-3.5 pb-4">
                      {modalMode === 'claim' ? (
                        <>
                          <div>
                            <Label htmlFor="fullName" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1 block">Full Name *</Label>
                            <Input id="fullName" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="font-heading text-base sm:text-sm rounded-lg" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="country" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1 block">Country *</Label>
                              <Input id="country" required value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="font-heading text-base sm:text-sm rounded-lg" />
                            </div>
                            <div>
                              <Label htmlFor="stateRegion" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1 block">State / Region *</Label>
                              <Input id="stateRegion" required value={formData.stateRegion} onChange={(e) => setFormData({ ...formData, stateRegion: e.target.value })} className="font-heading text-base sm:text-sm rounded-lg" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="city" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1 block">City *</Label>
                              <Input id="city" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="font-heading text-base sm:text-sm rounded-lg" />
                            </div>
                            <div>
                              <Label htmlFor="postalCode" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1 block">Postal / ZIP Code *</Label>
                              <Input id="postalCode" required value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} className="font-heading text-base sm:text-sm rounded-lg" />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="streetAddress" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1 block">Street Address *</Label>
                            <Input id="streetAddress" required value={formData.streetAddress} onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })} className="font-heading text-base sm:text-sm rounded-lg" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="phone" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1 block">Phone (with Country Code) *</Label>
                              <Input id="phone" type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="font-heading text-base sm:text-sm rounded-lg" />
                            </div>
                            <div>
                              <Label htmlFor="email" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1 block">Email Address *</Label>
                              <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="font-heading text-base sm:text-sm rounded-lg" />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="preferredContactMethod" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1 block">Contact Method *</Label>
                            <Select required value={formData.preferredContactMethod} onValueChange={(value) => setFormData({ ...formData, preferredContactMethod: value, contactDetails: value === 'instagram' ? '' : formData.contactDetails })}>
                              <SelectTrigger id="preferredContactMethod" className="font-heading text-base sm:text-sm rounded-lg"><SelectValue placeholder="Select method" /></SelectTrigger>
                              <SelectContent className="z-[110]"><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem><SelectItem value="email">Email</SelectItem></SelectContent>
                            </Select>
                          </div>
                          {formData.preferredContactMethod === 'instagram' ? (
                            <div>
                              <Label htmlFor="contactDetails" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1 block">Instagram Handle *</Label>
                              <Input id="contactDetails" required value={formData.contactDetails} onChange={(e) => setFormData({ ...formData, contactDetails: e.target.value })} placeholder="@yourhandle" className="font-heading text-base sm:text-sm rounded-lg" />
                            </div>
                          ) : null}
                          <div>
                            <Label htmlFor="message" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1 block">Order Notes (Optional)</Label>
                            <Textarea id="message" rows={2} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Apartment code, delivery instructions..." className="font-heading text-base sm:text-sm rounded-lg" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <Label htmlFor="fullName" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1.5 block">Full Name *</Label>
                            <Input id="fullName" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="font-heading text-base sm:text-sm rounded-lg" />
                          </div>
                          <div>
                            <Label htmlFor="country" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1.5 block">Country *</Label>
                            <Input id="country" required value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="font-heading text-base sm:text-sm rounded-lg" />
                          </div>
                          <div>
                            <Label htmlFor="preferredContactMethod" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1.5 block">Contact Method *</Label>
                            <Select required value={formData.preferredContactMethod} onValueChange={(value) => setFormData({ ...formData, preferredContactMethod: value, contactDetails: '' })}>
                              <SelectTrigger id="preferredContactMethod" className="font-heading text-base sm:text-sm rounded-lg"><SelectValue placeholder="Select method" /></SelectTrigger>
                              <SelectContent className="z-[110]"><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem><SelectItem value="email">Email</SelectItem></SelectContent>
                            </Select>
                          </div>
                          {formData.preferredContactMethod && (
                            <div>
                              <Label htmlFor="contactDetails" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1.5 block">
                                {formData.preferredContactMethod === 'instagram' && 'Instagram Handle *'}
                                {formData.preferredContactMethod === 'whatsapp' && 'WhatsApp Number *'}
                                {formData.preferredContactMethod === 'email' && 'Email Address *'}
                              </Label>
                              <Input id="contactDetails" required value={formData.contactDetails} onChange={(e) => setFormData({ ...formData, contactDetails: e.target.value })} placeholder={formData.preferredContactMethod === 'instagram' ? '@yourhandle' : formData.preferredContactMethod === 'whatsapp' ? '+1 234 567 890' : 'your@email.com'} className="font-heading text-base sm:text-sm rounded-lg" />
                            </div>
                          )}
                          <div>
                            <Label htmlFor="message" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1.5 block">Notes / Special Requests</Label>
                            <Textarea id="message" rows={3} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Any questions or custom preferences..." className="font-heading text-base sm:text-sm rounded-lg" />
                          </div>
                        </>
                      )}

                      {/* Unified Submit Buttons */}
                      <div className="pt-3 space-y-2">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-foreground text-background hover:bg-soft-gold hover:text-white transition-all rounded-full py-3.5 font-heading text-xs uppercase tracking-widest disabled:opacity-50 shadow-md"
                        >
                          {isSubmitting ? 'Sending...' : modalMode === 'claim' ? 'Confirm Shipping & Order' : 'Submit Request'}
                        </Button>
                        <button
                          type="button"
                          onClick={handleClose}
                          className="w-full text-center font-heading text-xs text-foreground/50 hover:text-foreground py-2 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}