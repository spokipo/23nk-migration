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
    return () => window.removeEventListener('resize', checkMobile);
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

  const sendEmailNotification = async () => {
    const emailData: Record<string, string> = {
      _subject:
        modalMode === 'claim'
          ? `🔥 PAID ORDER: ${product.name}`
          : `✨ Custom Order: ${product.name}`,
      _template: 'box',
      Product: product.name,
      Price: product.price ? `$${product.price.toFixed(2)}` : 'Price upon request',
    };

    if (formData.fullName) emailData['Customer Name'] = formData.fullName;
    if (formData.country) emailData.Country = formData.country;
    if (formData.stateRegion) emailData['State/Region'] = formData.stateRegion;
    if (formData.city) emailData['City'] = formData.city;
    if (formData.streetAddress) emailData['Address'] = formData.streetAddress;
    if (formData.postalCode) emailData['Zip'] = formData.postalCode;
    if (formData.phone) emailData['Phone'] = formData.phone;
    if (formData.email) emailData['Email'] = formData.email;
    if (formData.preferredContactMethod) emailData['Contact Method'] = formData.preferredContactMethod;
    if (formData.contactDetails) emailData['Contact Details'] = formData.contactDetails;
    if (formData.message) emailData['Message / Notes'] = formData.message;

    await fetch('https://formsubmit.co/ajax/4beb55a3be4e0d00a05176afdef4a527', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(emailData),
    });
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
        await Promise.allSettled([
          sendEmailNotification(),
          sendOrderNotification({
            title: '✨ Custom Order Request',
            productName: product.name,
            price: product.price,
            formData: formData,
          }),
        ]);
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
        initial: { y: '100%', opacity: 1, scale: 1 },
        animate: { y: 0, opacity: 1, scale: 1 },
        exit: { y: '100%', opacity: 1, scale: 1 },
        transition: { type: 'spring', damping: 25, stiffness: 300 },
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
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
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
            className="relative z-10 flex h-[92dvh] w-full flex-col overflow-hidden rounded-t-[2rem] border border-foreground/15 bg-background shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-[580px] sm:rounded-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="absolute left-1/2 top-3 z-30 h-1.5 w-10 -translate-x-1/2 rounded-full bg-foreground/20 sm:hidden" />

            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-30 hidden rounded-full bg-black/10 p-2 text-foreground transition-colors hover:bg-black/20 sm:block"
              aria-label="Close form"
            >
              <X className="h-4 w-4" />
            </button>

            {/* SCROLLABLE AREA */}
            <div className="modal-scrollbar flex flex-1 flex-col overflow-y-auto p-6 pt-8 sm:p-8">
              <AnimatePresence mode="wait">
                {isSubmittedSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-1 flex-col items-center justify-center space-y-4 py-8 text-center"
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
                    <div className="pt-4 w-full hidden sm:block">
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
                    transition={{ duration: 0.2 }}
                    className="space-y-4 pb-4"
                  >
                    <div className="space-y-2">
                      <h2 className="font-heading text-xl md:text-2xl text-foreground">Payment</h2>
                      <p className="font-heading text-xs md:text-sm text-foreground/70">
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
                              await Promise.allSettled([
                                sendEmailNotification(),
                                sendOrderNotification({
                                  title: '🔥 PAID ORDER (PayPal)',
                                  productName: product.name,
                                  price: product.price,
                                  formData: formData,
                                }),
                              ]);
                              setIsSubmittedSuccess(true);
                            } catch (err) {
                              setPaymentError('An error occurred during payment processing.');
                            }
                          }}
                          onError={() => setPaymentError('PayPal checkout error. Please try again.')}
                        />
                      </PayPalScriptProvider>
                    ) : (
                      <div className="py-4 flex justify-center"><LoadingSpinner /></div>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowPayment(false)}
                      className="w-full text-center hidden font-heading text-xs text-foreground/50 hover:text-foreground py-2 transition-colors sm:block"
                    >
                      Back
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-2">
                      <h2 className="font-heading text-xl md:text-2xl text-foreground">
                        {modalMode === 'claim' ? 'Shipping Details' : 'Custom Order'}
                      </h2>
                      <p className="font-heading text-xs md:text-sm text-foreground/70">
                        {modalMode === 'claim'
                          ? 'Fill in your delivery details to reserve and complete your order.'
                          : 'Leave your contact details to request a custom order. A fitting & measurement guide will be provided after the request.'}
                      </p>
                    </div>

                    <form id="order-form" onSubmit={handleSubmit} className="space-y-4 mt-4 pb-4">
                      <div className="p-3 bg-ivory rounded-xl flex gap-3 items-center border border-foreground/10 mb-2">
                        <Image src={product.mainImage || ''} alt={product.name} width={60} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                        <div>
                          <p className="font-heading text-sm text-foreground font-semibold">{product.name}</p>
                          <p className="font-heading text-xs text-soft-gold font-bold mt-0.5">${product.price?.toFixed(2)}</p>
                        </div>
                      </div>

                      {modalMode === 'claim' ? (
                        <div className="space-y-3.5">
                          <div>
                            <Label htmlFor="fullName" className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block">Full Name *</Label>
                            <Input id="fullName" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="font-heading text-sm rounded-lg" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="country" className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block">Country *</Label>
                              <Input id="country" required value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="font-heading text-sm rounded-lg" />
                            </div>
                            <div>
                              <Label htmlFor="stateRegion" className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block">State / Region *</Label>
                              <Input id="stateRegion" required value={formData.stateRegion} onChange={(e) => setFormData({ ...formData, stateRegion: e.target.value })} className="font-heading text-sm rounded-lg" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="city" className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block">City *</Label>
                              <Input id="city" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="font-heading text-sm rounded-lg" />
                            </div>
                            <div>
                              <Label htmlFor="postalCode" className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block">Postal / ZIP Code *</Label>
                              <Input id="postalCode" required value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} className="font-heading text-sm rounded-lg" />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="streetAddress" className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block">Street Address *</Label>
                            <Input id="streetAddress" required value={formData.streetAddress} onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })} className="font-heading text-sm rounded-lg" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="phone" className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block">Phone (with Country Code) *</Label>
                              <Input id="phone" type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="font-heading text-sm rounded-lg" />
                            </div>
                            <div>
                              <Label htmlFor="email" className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block">Email Address *</Label>
                              <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="font-heading text-sm rounded-lg" />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="preferredContactMethod" className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block">Contact Method *</Label>
                            <Select required value={formData.preferredContactMethod} onValueChange={(value) => setFormData({ ...formData, preferredContactMethod: value, contactDetails: value === 'instagram' ? '' : formData.contactDetails })}>
                              <SelectTrigger id="preferredContactMethod" className="font-heading text-sm rounded-lg"><SelectValue placeholder="Select method" /></SelectTrigger>
                              <SelectContent className="z-[110]"><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem><SelectItem value="email">Email</SelectItem></SelectContent>
                            </Select>
                          </div>
                          {formData.preferredContactMethod === 'instagram' ? (
                            <div>
                              <Label htmlFor="contactDetails" className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block">Instagram Handle *</Label>
                              <Input id="contactDetails" required value={formData.contactDetails} onChange={(e) => setFormData({ ...formData, contactDetails: e.target.value })} placeholder="@yourhandle" className="font-heading text-sm rounded-lg" />
                            </div>
                          ) : formData.preferredContactMethod === 'email' ? (
                            <p className="font-heading text-xs text-foreground/60">Your delivery email will be used for contact.</p>
                          ) : formData.preferredContactMethod === 'whatsapp' ? (
                            <p className="font-heading text-xs text-foreground/60">Your delivery phone number will be used for WhatsApp.</p>
                          ) : null}
                          <div>
                            <Label htmlFor="message" className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block">Order Notes (Optional)</Label>
                            <Textarea id="message" rows={2} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Apartment code, delivery instructions..." className="font-heading text-sm rounded-lg" />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="fullName" className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1.5 block">Full Name *</Label>
                            <Input id="fullName" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="font-heading text-sm rounded-lg" />
                          </div>
                          <div>
                            <Label htmlFor="country" className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1.5 block">Country *</Label>
                            <Input id="country" required value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="font-heading text-sm rounded-lg" />
                          </div>
                          <div>
                            <Label htmlFor="preferredContactMethod" className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1.5 block">Contact Method *</Label>
                            <Select required value={formData.preferredContactMethod} onValueChange={(value) => setFormData({ ...formData, preferredContactMethod: value, contactDetails: '' })}>
                              <SelectTrigger id="preferredContactMethod" className="font-heading text-sm rounded-lg"><SelectValue placeholder="Select method" /></SelectTrigger>
                              <SelectContent className="z-[110]"><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem><SelectItem value="email">Email</SelectItem></SelectContent>
                            </Select>
                          </div>
                          {formData.preferredContactMethod && (
                            <div>
                              <Label htmlFor="contactDetails" className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1.5 block">
                                {formData.preferredContactMethod === 'instagram' && 'Instagram Handle *'}
                                {formData.preferredContactMethod === 'whatsapp' && 'WhatsApp Number *'}
                                {formData.preferredContactMethod === 'email' && 'Email Address *'}
                              </Label>
                              <Input id="contactDetails" required value={formData.contactDetails} onChange={(e) => setFormData({ ...formData, contactDetails: e.target.value })} placeholder={formData.preferredContactMethod === 'instagram' ? '@yourhandle' : formData.preferredContactMethod === 'whatsapp' ? '+1 234 567 890' : 'your@email.com'} className="font-heading text-sm rounded-lg" />
                            </div>
                          )}
                          <div>
                            <Label htmlFor="message" className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1.5 block">Notes / Special Requests</Label>
                            <Textarea id="message" rows={3} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Any questions or custom preferences..." className="font-heading text-sm rounded-lg" />
                          </div>
                        </div>
                      )}

                      <div className="pt-2 hidden flex-col space-y-2 sm:flex">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-foreground text-background hover:bg-soft-gold hover:text-white transition-all rounded-full py-3.5 font-heading text-xs uppercase tracking-widest disabled:opacity-50"
                        >
                          {isSubmitting ? 'Sending...' : modalMode === 'claim' ? 'Confirm Shipping & Order' : 'Submit Request'}
                        </Button>
                        <button type="button" onClick={handleClose} className="w-full text-center font-heading text-xs text-foreground/50 hover:text-foreground py-2 transition-colors">
                          Close
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* MOBILE STICKY ACTIONS */}
            <div className="shrink-0 border-t border-foreground/10 bg-background/90 p-4 pb-8 backdrop-blur-md sm:hidden">
              <AnimatePresence mode="wait">
                {isSubmittedSuccess ? (
                  <motion.div key="btn-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button onClick={handleClose} className="w-full bg-foreground text-background transition-all rounded-full py-3.5 font-heading text-xs uppercase tracking-widest shadow-md">
                      Got It
                    </Button>
                  </motion.div>
                ) : showPayment ? (
                  <motion.div key="btn-payment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <button type="button" onClick={() => setShowPayment(false)} className="w-full text-center font-heading text-xs text-foreground/50 hover:text-foreground py-2 transition-colors">
                      Back
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="btn-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button type="submit" form="order-form" disabled={isSubmitting} className="w-full bg-foreground text-background transition-all rounded-full py-3.5 font-heading text-xs uppercase tracking-widest shadow-md disabled:opacity-50">
                      {isSubmitting ? 'Sending...' : modalMode === 'claim' ? 'Confirm & Order' : 'Submit Request'}
                    </Button>
                    <button type="button" onClick={handleClose} className="mt-3 w-full py-1 text-center font-heading text-xs text-foreground/50">
                      Close
                    </button>
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