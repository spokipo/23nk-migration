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
import { ContactFormSubmissions, Products } from '@/entities';
import { useToast } from '@/hooks/use-toast';
import { BaseCrudService } from '@/integrations';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Products | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'claim' | 'custom'>('claim');

  const [activeAccordion, setActiveAccordion] = useState<
    'desc' | 'materials' | ''
  >('desc');

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

  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        const fetchedProduct =
          await BaseCrudService.getById<Products>('products', id);

        setProduct(fetchedProduct);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    fetch('/api/paypal/config')
      .then((res) => res.json())
      .then((data) => setPaypalClientId(data.clientId || null))
      .catch(() => setPaypalClientId(null));
  }, []);

  useEffect(() => {
    if (!isDialogOpen) return;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDialogOpen(false);
        window.setTimeout(() => setIsSubmittedSuccess(false), 300);
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDialogOpen]);

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
  };

  const handleOpenModal = (mode: 'claim' | 'custom') => {
    setModalMode(mode);
    resetForm();
    setShowPayment(false);
    setPaymentError(null);
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);

    if (!open) {
      setTimeout(() => {
        setIsSubmittedSuccess(false);
        setShowPayment(false);
        setPaymentError(null);
      }, 300);
    }
  };

  const handlePaymentSuccess = () => {
    setIsSubmittedSuccess(true);
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

      // Save submission to CMS
      await BaseCrudService.create(
        'contactformsubmissions',
        submission
      );

      // Prepare email
      const emailData: Record<string, string> = {
        _subject:
          modalMode === 'claim'
            ? `🔥 Order: ${product.name}`
            : `✨ Custom Order: ${product.name}`,
        _template: 'box',
        Product: product.name,
        Price: `$${product.price?.toFixed(2)}`,
      };

      if (formData.fullName) {
        emailData['Customer Name'] = formData.fullName;
      }

      if (formData.country) {
        emailData['Country'] = formData.country;
      }

      if (formData.stateRegion) {
        emailData['State/Region'] = formData.stateRegion;
      }

      if (formData.city) {
        emailData['City'] = formData.city;
      }

      if (formData.streetAddress) {
        emailData['Address'] = formData.streetAddress;
      }

      if (formData.postalCode) {
        emailData['Zip'] = formData.postalCode;
      }

      if (formData.phone) {
        emailData['Phone'] = formData.phone;
      }

      if (formData.email) {
        emailData['Email'] = formData.email;
      }

      if (formData.preferredContactMethod) {
        emailData['Contact Method'] =
          formData.preferredContactMethod;
      }

      if (formData.contactDetails) {
        emailData['Contact Details'] =
          formData.contactDetails;
      }

      if (formData.message) {
        emailData['Message / Notes'] = formData.message;
      }

      // Send email
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

      if (modalMode === 'claim') {
        setShowPayment(true);
      } else {
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

  const toggleAccordion = (
    section: 'desc' | 'materials'
  ) => {
    setActiveAccordion(
      activeAccordion === section ? '' : section
    );
  };

  return (
    <div className="min-h-screen bg-background font-paragraph text-foreground selection:bg-soft-gold/20">
      <style>{`
        .modal-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.18) transparent;
        }

        .modal-scrollbar::-webkit-scrollbar {
          width: 5px;
        }

        .modal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .modal-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.18);
          border-radius: 9999px;
        }

        .modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
      <Header />

      <main className="py-8 md:py-16">
        <div className="max-w-[120rem] mx-auto px-4 md:px-20">

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">

            {/* PRODUCT IMAGES */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-ivory rounded-2xl overflow-hidden mb-4 aspect-square relative shadow-sm">
                <Image
                  src={images[currentImage] || ''}
                  alt={product.name || 'Corset'}
                  width={800}
                  className="w-full h-full object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`bg-ivory rounded-xl overflow-hidden aspect-square transition-all ${
                        currentImage === index
                          ? 'ring-2 ring-soft-gold scale-[0.98]'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        width={200}
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

              {/* AVAILABILITY */}
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
              {/* ORDER BUTTON + ANIMATED MODAL */}
              <div className="mb-8">
                <Button
                  onClick={() =>
                    handleOpenModal(product.inStock ? 'claim' : 'custom')
                  }
                  className="w-full bg-foreground text-background hover:bg-soft-gold hover:text-white transition-all rounded-full py-6 text-xs sm:text-sm font-heading tracking-widest uppercase shadow-md"
                >
                  {product.inStock ? 'Buy Now' : 'Custom Order'}
                </Button>
              </div>

              {createPortal(
                <AnimatePresence>
                  {isDialogOpen && (
                    <motion.div
                      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-[1px]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                          handleDialogChange(false);
                        }
                      }}
                    >
                      <motion.div
                        role="dialog"
                        aria-modal="true"
                        className="w-full max-w-[580px] max-h-[90vh] overflow-hidden rounded-2xl border border-foreground/15 bg-background shadow-2xl"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        onMouseDown={(event) => event.stopPropagation()}
                      >
                        <div className="modal-scrollbar max-h-[90vh] overflow-y-auto p-6">
                  {isSubmittedSuccess ? (
                    /* SUCCESS STATE */
                    <motion.div
                      initial={{
                        opacity: 0,
                        scale: 0.95,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                      className="py-8 text-center flex flex-col items-center justify-center space-y-4"
                    >
                      <div className="w-16 h-16 bg-soft-gold/15 rounded-full flex items-center justify-center text-soft-gold mb-2">
                        <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
                      </div>

                      <h2 className="font-heading text-2xl text-foreground">
                        {modalMode === 'claim'
                          ? 'Order Confirmed!'
                          : 'Request Received!'}
                      </h2>

                      <p className="font-heading text-xs md:text-sm text-foreground/75 max-w-md leading-relaxed">
                        {modalMode === 'claim' ? (
                          <>
                            Thank you, {formData.fullName || 'friend'}! Your
                            order for "{product.name}" has been confirmed.
                            Your payment has been received
                            successfully.
                          </>
                        ) : (
                          <>
                            Thank you, {formData.fullName || 'friend'}! Your
                            request for "{product.name}" has been received. A
                            reply will be sent shortly.
                          </>
                        )}
                      </p>

                      <div className="pt-4 w-full">
                        <Button
                            onClick={() => handleDialogChange(false)}
                            className="w-full bg-foreground text-background hover:bg-soft-gold hover:text-white transition-all rounded-full py-3.5 font-heading text-xs uppercase tracking-widest"
                          >
                            Got It
                          </Button>
                      </div>
                    </motion.div>
                  ) : showPayment ? (
                    /* PAYMENT STATE */
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h2 className="font-heading text-xl md:text-2xl text-foreground">
                          Payment
                        </h2>

                        <p className="font-heading text-xs md:text-sm text-foreground/70">
                          Complete your payment to confirm the order.
                        </p>
                      </div>

                      <div className="p-3 bg-ivory rounded-xl flex gap-3 items-center border border-foreground/10">
                        <Image
                          src={product.mainImage || ''}
                          alt={product.name}
                          width={60}
                          className="w-14 h-14 object-cover rounded-lg shrink-0"
                        />

                        <div>
                          <p className="font-heading text-sm text-foreground font-semibold">
                            {product.name}
                          </p>

                          <p className="font-heading text-xs text-soft-gold font-bold mt-0.5">
                            ${product.price?.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {paymentError && (
                        <p className="font-heading text-xs text-red-500">
                          {paymentError}
                        </p>
                      )}

                      {paypalClientId ? (
                        <PayPalScriptProvider
                          options={{
                            clientId: paypalClientId,
                            currency: 'USD',
                          }}
                        >
                          <PayPalButtons
                            style={{ layout: 'vertical', shape: 'pill' }}
                            forceReRender={[product._id, product.price]}
                            createOrder={async () => {
                              setPaymentError(null);

                              const res = await fetch('/api/paypal/create-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  productId: product._id,
                                }),
                              });

                              const data = await res.json();

                              if (!res.ok) {
                                setPaymentError(
                                  'Could not start PayPal checkout. Please try again.'
                                );
                                throw new Error(data.error || 'create-order failed');
                              }

                              return data.id;
                            }}
                            onApprove={async (data) => {
                              const res = await fetch('/api/paypal/capture-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ orderID: data.orderID }),
                              });

                              if (!res.ok) {
                                setPaymentError(
                                  'Payment could not be completed. Please try again.'
                                );
                                return;
                              }

                              handlePaymentSuccess();
                            }}
                            onError={() => {
                              setPaymentError(
                                'PayPal checkout error. Please try again.'
                              );
                            }}
                          />
                        </PayPalScriptProvider>
                      ) : (
                        <div className="py-4 flex justify-center">
                          <LoadingSpinner />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowPayment(false)}
                        className="w-full text-center font-heading text-xs text-foreground/50 hover:text-foreground py-2 transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <h2 className="font-heading text-xl md:text-2xl text-foreground">
                          {modalMode === 'claim'
                            ? 'Shipping Details'
                            : 'Custom Order'}
                        </h2>

                        <p className="font-heading text-xs md:text-sm text-foreground/70">
                          {modalMode === 'claim'
                            ? 'Fill in your delivery details to reserve and complete your order.'
                            : 'Leave your contact details to request a custom order. A fitting & measurement guide will be provided after the request.'}
                        </p>
                      </div>

                      <form
                        onSubmit={handleSubmit}
                        className="space-y-4 mt-4"
                      >

                        {/* PRODUCT PREVIEW */}
                        <div className="p-3 bg-ivory rounded-xl flex gap-3 items-center border border-foreground/10">
                          <Image
                            src={product.mainImage || ''}
                            alt={product.name}
                            width={60}
                            className="w-14 h-14 object-cover rounded-lg shrink-0"
                          />

                          <div>
                            <p className="font-heading text-sm text-foreground font-semibold">
                              {product.name}
                            </p>

                            <p className="font-heading text-xs text-soft-gold font-bold mt-0.5">
                              ${product.price?.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* READY TO SHIP FORM */}
                        {modalMode === 'claim' ? (
                          <div className="space-y-3.5">

                            {/* FULL NAME */}
                            <div>
                              <Label
                                htmlFor="fullName"
                                className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block"
                              >
                                Full Name *
                              </Label>

                              <Input
                                id="fullName"
                                required
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    fullName: e.target.value,
                                  })
                                }
                                className="font-heading text-sm rounded-lg"
                              />
                            </div>

                            {/* COUNTRY + STATE */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <Label
                                  htmlFor="country"
                                  className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block"
                                >
                                  Country *
                                </Label>

                                <Input
                                  id="country"
                                  required
                                  placeholder="United States"
                                  value={formData.country}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      country: e.target.value,
                                    })
                                  }
                                  className="font-heading text-sm rounded-lg"
                                />
                              </div>

                              <div>
                                <Label
                                  htmlFor="stateRegion"
                                  className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block"
                                >
                                  State / Region *
                                </Label>

                                <Input
                                  id="stateRegion"
                                  required
                                  placeholder="California / NY"
                                  value={formData.stateRegion}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      stateRegion: e.target.value,
                                    })
                                  }
                                  className="font-heading text-sm rounded-lg"
                                />
                              </div>
                            </div>

                            {/* CITY + POSTAL */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <Label
                                  htmlFor="city"
                                  className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block"
                                >
                                  City *
                                </Label>

                                <Input
                                  id="city"
                                  required
                                  placeholder="Los Angeles"
                                  value={formData.city}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      city: e.target.value,
                                    })
                                  }
                                  className="font-heading text-sm rounded-lg"
                                />
                              </div>

                              <div>
                                <Label
                                  htmlFor="postalCode"
                                  className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block"
                                >
                                  Postal / ZIP Code *
                                </Label>

                                <Input
                                  id="postalCode"
                                  required
                                  placeholder="90001"
                                  value={formData.postalCode}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      postalCode: e.target.value,
                                    })
                                  }
                                  className="font-heading text-sm rounded-lg"
                                />
                              </div>
                            </div>

                            {/* ADDRESS */}
                            <div>
                              <Label
                                htmlFor="streetAddress"
                                className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block"
                              >
                                Street Address *
                              </Label>

                              <Input
                                id="streetAddress"
                                required
                                placeholder="123 Main Street, Apt 4B"
                                value={formData.streetAddress}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    streetAddress: e.target.value,
                                  })
                                }
                                className="font-heading text-sm rounded-lg"
                              />
                            </div>

                            {/* DELIVERY PHONE + EMAIL */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <Label
                                  htmlFor="phone"
                                  className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block"
                                >
                                  Phone (with Country Code) *
                                </Label>

                                <Input
                                  id="phone"
                                  type="tel"
                                  required
                                  placeholder="+1 234 567 8900"
                                  value={formData.phone}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      phone: e.target.value,
                                    })
                                  }
                                  className="font-heading text-sm rounded-lg"
                                />
                              </div>

                              <div>
                                <Label
                                  htmlFor="email"
                                  className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block"
                                >
                                  Email Address *
                                </Label>

                                <Input
                                  id="email"
                                  type="email"
                                  required
                                  placeholder="you@example.com"
                                  value={formData.email}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      email: e.target.value,
                                    })
                                  }
                                  className="font-heading text-sm rounded-lg"
                                />
                              </div>
                            </div>

                            {/* PREFERRED CONTACT METHOD */}
                            <div>
                              <Label
                                htmlFor="preferredContactMethod"
                                className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block"
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
                                    contactDetails:
                                      value === 'instagram'
                                        ? ''
                                        : formData.contactDetails,
                                  })
                                }
                              >
                                <SelectTrigger
                                  id="preferredContactMethod"
                                  className="font-heading text-sm rounded-lg"
                                >
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>

                                <SelectContent className="z-[110]">
                                  <SelectItem value="instagram">
                                    Instagram
                                  </SelectItem>
                                  <SelectItem value="whatsapp">
                                    WhatsApp
                                  </SelectItem>
                                  <SelectItem value="email">
                                    Email
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {formData.preferredContactMethod === 'instagram' ? (
                              <div>
                                <Label
                                  htmlFor="contactDetails"
                                  className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block"
                                >
                                  Instagram Handle *
                                </Label>

                                <Input
                                  id="contactDetails"
                                  required
                                  value={formData.contactDetails}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      contactDetails: e.target.value,
                                    })
                                  }
                                  placeholder="@yourhandle"
                                  className="font-heading text-sm rounded-lg"
                                />
                              </div>
                            ) : formData.preferredContactMethod === 'email' ? (
                              <p className="font-heading text-xs text-foreground/60">
                                Your delivery email will be used for contact.
                              </p>
                            ) : formData.preferredContactMethod === 'whatsapp' ? (
                              <p className="font-heading text-xs text-foreground/60">
                                Your delivery phone number will be used for WhatsApp.
                              </p>
                            ) : null}

                            {/* ORDER NOTES */}
                            <div>
                              <Label
                                htmlFor="message"
                                className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1 block"
                              >
                                Order Notes (Optional)
                              </Label>

                              <Textarea
                                id="message"
                                rows={2}
                                value={formData.message}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    message: e.target.value,
                                  })
                                }
                                placeholder="Apartment code, delivery instructions..."
                                className="font-heading text-sm rounded-lg"
                              />
                            </div>

                          </div>
                        ) : (
                          /* CUSTOM ORDER FORM */
                          <div className="space-y-4">

                            <div>
                              <Label
                                htmlFor="fullName"
                                className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1.5 block"
                              >
                                Full Name *
                              </Label>

                              <Input
                                id="fullName"
                                required
                                value={formData.fullName}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    fullName: e.target.value,
                                  })
                                }
                                className="font-heading text-sm rounded-lg"
                              />
                            </div>

                            <div>
                              <Label
                                htmlFor="country"
                                className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1.5 block"
                              >
                                Country *
                              </Label>

                              <Input
                                id="country"
                                required
                                value={formData.country}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    country: e.target.value,
                                  })
                                }
                                className="font-heading text-sm rounded-lg"
                              />
                            </div>

                            <div>
                              <Label
                                htmlFor="preferredContactMethod"
                                className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1.5 block"
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
                                  className="font-heading text-sm rounded-lg"
                                >
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>

                                <SelectContent className="z-[110]">
                                  <SelectItem value="instagram">
                                    Instagram
                                  </SelectItem>

                                  <SelectItem value="whatsapp">
                                    WhatsApp
                                  </SelectItem>

                                  <SelectItem value="email">
                                    Email
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {formData.preferredContactMethod && (
                              <div>
                                <Label
                                  htmlFor="contactDetails"
                                  className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1.5 block"
                                >
                                  {formData.preferredContactMethod ===
                                    'instagram' &&
                                    'Instagram Handle *'}

                                  {formData.preferredContactMethod ===
                                    'whatsapp' &&
                                    'WhatsApp Number *'}

                                  {formData.preferredContactMethod ===
                                    'email' &&
                                    'Email Address *'}
                                </Label>

                                <Input
                                  id="contactDetails"
                                  required
                                  value={formData.contactDetails}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      contactDetails: e.target.value,
                                    })
                                  }
                                  placeholder={
                                    formData.preferredContactMethod ===
                                    'instagram'
                                      ? '@yourhandle'
                                      : formData.preferredContactMethod ===
                                        'whatsapp'
                                      ? '+1 234 567 890'
                                      : 'your@email.com'
                                  }
                                  className="font-heading text-sm rounded-lg"
                                />
                              </div>
                            )}

                            <div>
                              <Label
                                htmlFor="message"
                                className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1.5 block"
                              >
                                Notes / Special Requests
                              </Label>

                              <Textarea
                                id="message"
                                rows={3}
                                value={formData.message}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    message: e.target.value,
                                  })
                                }
                                placeholder="Any questions or custom preferences..."
                                className="font-heading text-sm rounded-lg"
                              />
                            </div>

                          </div>
                        )}

                        {/* ACTIONS */}
                        <div className="pt-2 space-y-2">
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-foreground text-background hover:bg-soft-gold hover:text-white transition-all rounded-full py-3.5 font-heading text-xs uppercase tracking-widest disabled:opacity-50"
                          >
                            {isSubmitting
                              ? 'Sending...'
                              : modalMode === 'claim'
                              ? 'Confirm Shipping & Order'
                              : 'Submit Request'}
                          </Button>

                          <button
                              type="button"
                              onClick={() => handleDialogChange(false)}
                              className="w-full text-center font-heading text-xs text-foreground/50 hover:text-foreground py-2 transition-colors"
                            >
                              Close
                            </button>
                        </div>
                      </form>
                    </>
                  )}
                        </div>

                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>,
                document.body
              )}

              {/* PRODUCT INFORMATION */}
              <div className="border-t border-foreground/10 divide-y divide-foreground/10">

                {/* DESCRIPTION */}
                <div className="py-4">
                  <button
                    onClick={() => toggleAccordion('desc')}
                    className="w-full flex items-center justify-between text-left font-heading text-sm uppercase tracking-wider text-foreground"
                  >
                    <span>Description & Details</span>

                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        activeAccordion === 'desc'
                          ? 'rotate-180'
                          : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {activeAccordion === 'desc' && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          height: 0,
                        }}
                        animate={{
                          opacity: 1,
                          height: 'auto',
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                        }}
                        className="overflow-hidden mt-3 pb-1"
                      >
                        <p className="font-paragraph text-xs md:text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                          {product.fullDescription ||
                            product.shortDescription ||
                            'No description available.'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* MATERIALS & CARE */}
                <div className="py-4">
                  <button
                    onClick={() => toggleAccordion('materials')}
                    className="w-full flex items-center justify-between text-left font-heading text-sm uppercase tracking-wider text-foreground"
                  >
                    <span>Materials & Care</span>

                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        activeAccordion === 'materials'
                          ? 'rotate-180'
                          : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {activeAccordion === 'materials' && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          height: 0,
                        }}
                        animate={{
                          opacity: 1,
                          height: 'auto',
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                        }}
                        className="overflow-hidden mt-3 pb-1 space-y-2 text-xs md:text-sm text-foreground/80 font-paragraph"
                      >
                        {product.materials && (
                          <p>
                            <strong className="font-heading text-foreground">
                              Fabric:
                            </strong>{' '}
                            {product.materials}
                          </p>
                        )}

                        <p>
                          <strong className="font-heading text-foreground">
                            Care Instructions:
                          </strong>{' '}
                          Dry clean or gentle spot clean only. Do not machine
                          wash.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
