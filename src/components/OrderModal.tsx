import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Country, State, City } from 'country-state-city';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const NOVA_POSHTA_COUNTRIES = [
  'AT', 'UA',  'AL', 'AD', 'BE', 'BG', 'BA', 'VA', 'GB', 'GR', 'GI', 'DK', 'EE', 'IE', 'IS', 'ES', 'IT', 'CY', 'LV', 'LT', 'LI', 'LU', 'MT', 'MD', 'MC', 'NL', 'DE', 'NO', 'MK', 'PL', 'PT', 'RO', 'SM', 'RS', 'SK', 'SI', 'TR', 'CZ', 'ME', 'HU', 'FI', 'FR', 'HR', 'CH', 'SE',
  'US', 'CA', 'CN', 'HK',
  'AU', 'AZ', 'DZ', 'AS', 'AO', 'AI', 'AG', 'AR', 'AW', 'AF', 'BS', 'BD', 'BB', 'BH', 'BZ', 'BJ', 'BM', 'BO', 'BQ', 'BW', 'BR', 'VG', 'BN', 'BF', 'BI', 'BT', 'VN', 'VU', 'VI', 'VE', 'AM', 'GA', 'HT', 'GM', 'GH', 'GN', 'GW', 'HN', 'GE', 'GY', 'GP', 'GT', 'GD', 'GL', 'GU', 'DJ', 'DM', 'DO', 'EC', 'ER', 'SZ', 'ET', 'EG', 'ZM', 'ZW', 'IL', 'IN', 'ID', 'IQ', 'JO', 'CV', 'KZ', 'KY', 'KH', 'CM', 'QA', 'KE', 'NE', 'KG', 'CO', 'KM', 'CG', 'CR', 'CI', 'KW', 'CK', 'CW', 'LA', 'LS', 'LR', 'LB', 'MU', 'MR', 'MG', 'YT', 'MO', 'MW', 'MY', 'ML', 'MV', 'MA', 'MQ', 'MH', 'MX', 'MZ', 'MN', 'NA', 'NP', 'NG', 'NI', 'NZ', 'NC', 'AE', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'ZA', 'MP', 'PR', 'KR', 'RE', 'RW', 'SV', 'WS', 'SA', 'SC', 'BL', 'SN', 'MF', 'SX', 'VC', 'KN', 'LC', 'SG', 'SB', 'TL', 'SL', 'TH', 'PF', 'TW', 'TZ', 'TC', 'TG', 'TO', 'TT', 'TN', 'UG', 'UZ', 'UY', 'FO', 'FJ', 'PH', 'GF', 'TD', 'CL', 'LK', 'JM', 'FM', 'JP'
];

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

  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');

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

  const availableStates = selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [];
  const hasStates = availableStates.length > 0;

  const availableCities = selectedStateCode ? City.getCitiesOfState(selectedCountryCode, selectedStateCode) : [];
  const hasCities = availableCities.length > 0;

  useEffect(() => {
    setMounted(true);
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // СОВРЕМЕННЫЙ ЛОК СКРОЛЛА (БЕЗ СДВИГА СТРАНИЦЫ) + ФИКС SAFE AREA
  useEffect(() => {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    let originalHtmlBg = '';
    let originalThemeColor = '';

    if (isOpen) {
      // 1. Фикс для Safari: синхронизируем цвета, чтобы убрать нижний шов
      originalHtmlBg = document.documentElement.style.backgroundColor;
      if (metaThemeColor) {
        originalThemeColor = metaThemeColor.getAttribute('content') || '';
      } else {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.setAttribute('name', 'theme-color');
        document.head.appendChild(metaThemeColor);
      }
      
      const computedBgColor = getComputedStyle(document.body).backgroundColor;
      document.documentElement.style.backgroundColor = computedBgColor;
      metaThemeColor.setAttribute('content', computedBgColor);

      // 2. МЯГКИЙ ЛОК СКРОЛЛА
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overscrollBehavior = 'none'; 
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
      
      // Возвращаем цвета обратно при закрытии
      document.documentElement.style.backgroundColor = originalHtmlBg;
      if (metaThemeColor && originalThemeColor) {
        metaThemeColor.setAttribute('content', originalThemeColor);
      }
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
    setSelectedCountryCode('');
    setSelectedStateCode('');
    setIsSubmittedSuccess(false);
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

    const article = product._id ? product._id.slice(-6).toUpperCase() : 'UNKNOWN';

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
          `SKU/ID: #${article} (Full ID: ${product._id})`,
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
        ].filter(Boolean).join('\n');
      } else {
        messageContent = [
          `CUSTOM ORDER REQUEST`,
          `Product: ${product.name}`,
          `Reference SKU: #${article} (Full ID: ${product._id})`,
          `Country: ${formData.country}`,
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
        selectedCorset: `${product.name} (SKU: #${article})`,
      };

      await BaseCrudService.create('contactformsubmissions', submission);

      if (modalMode === 'claim') {
        await sendOrderNotification({
          title: '🛍️ NEW ORDER (In-Stock) - Awaiting Payment',
          productName: `${product.name} (SKU: #${article})`,
          price: product.price,
          formData: formData,
        });
      } else {
        await sendOrderNotification({
          title: '✨ Custom Order Request',
          productName: `${product.name} (Ref: #${article})`, 
          price: product.price,
          formData: formData,
        });
      }
      
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

  if (!mounted) return null;

  const modalAnimationVariants: any = isMobile
    ? {
        initial: { y: '100%', opacity: 1 },
        animate: { y: 0, opacity: 1, transition: { type: 'tween', duration: 0.35, ease: 'easeOut' } },
        exit: { y: '100%', opacity: 1, transition: { type: 'tween', duration: 0.3, ease: 'easeIn' } },
      }
    : {
        initial: { opacity: 0, scale: 0.95, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
        exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2, ease: 'easeIn' } },
      };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: 100 }} 
          className="flex flex-col justify-end sm:items-center sm:justify-center sm:p-4 font-paragraph text-foreground"
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            style={{ touchAction: 'none' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            variants={modalAnimationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            // ИСПРАВИЛ ГРАНИЦУ: border-t sm:border убирает нижнюю полосу на мобилке!
            className="relative z-10 flex max-h-[90%] w-full flex-col overflow-hidden rounded-t-[24px] border-t sm:border border-foreground/10 bg-background shadow-sm sm:max-h-[90%] sm:max-w-[540px] sm:rounded-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div 
              className="flex w-full shrink-0 justify-center pt-3 pb-3 sm:hidden"
              onClick={handleClose}
            >
              <div className="h-1.5 w-10 rounded-full bg-foreground/20" />
            </div>

            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-30 hidden rounded-full bg-black/10 p-2 text-foreground transition-colors hover:bg-black/20 sm:block"
              aria-label="Close form"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <div className="modal-scrollbar flex-1 overflow-y-auto overscroll-contain p-5 pb-6 sm:p-7 sm:pb-7">
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
                      {modalMode === 'claim' ? 'Order Requested!' : 'Request Received!'}
                    </h2>
                    <p className="font-heading text-xs md:text-sm text-foreground/75 max-w-md leading-relaxed">
                      {modalMode === 'claim' ? (
                        <>
                          Thank you, {formData.fullName || 'friend'}! Your request for "{product.name}" is confirmed. Since each piece is unique, our manager will contact you shortly with payment instructions to finalize your order.
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
                          ? 'Fill in your delivery details to reserve your piece.'
                          : 'Leave your contact details to request a custom order.'}
                      </p>
                    </div>

                    <div className="p-3 bg-foreground/5 rounded-xl flex gap-3 items-center border border-foreground/10 mb-4">
                      <Image src={product.mainImage || ''} alt={product.name} width={56} className="w-12 h-12 object-cover rounded-lg shrink-0 shadow-sm" />
                      <div>
                        <p className="font-heading text-xs sm:text-sm text-foreground font-semibold line-clamp-1">{product.name}</p>
                        <p className="font-heading text-xs text-soft-gold font-bold mt-0.5">${product.price?.toFixed(2)}</p>
                      </div>
                    </div>

                    <form id="order-form" onSubmit={handleSubmit} className="space-y-3.5 pb-2">
                      {modalMode === 'claim' ? (
                        <>
                          <div>
                            <Label htmlFor="fullName" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1 block">Full Name *</Label>
                            <Input id="fullName" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="font-heading text-base sm:text-sm rounded-lg" />
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="country" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1 block">Country *</Label>
                              <Select
                                required
                                value={selectedCountryCode}
                                onValueChange={(code) => {
                                  setSelectedCountryCode(code);
                                  setSelectedStateCode('');
                                  setFormData({
                                    ...formData,
                                    country: Country.getCountryByCode(code)?.name || '',
                                    stateRegion: '',
                                    city: ''
                                  });
                                }}
                              >
                                <SelectTrigger id="country" className="font-heading text-base sm:text-sm rounded-lg">
                                  <SelectValue placeholder="Select Country..." />
                                </SelectTrigger>
                                <SelectContent className="z-[110] max-h-60">
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
                              <Label htmlFor="stateRegion" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1 block">State / Region *</Label>
                              {hasStates ? (
                                <Select
                                  required
                                  value={selectedStateCode}
                                  onValueChange={(code) => {
                                    setSelectedStateCode(code);
                                    setFormData({
                                      ...formData,
                                      stateRegion: State.getStateByCodeAndCountry(code, selectedCountryCode)?.name || '',
                                      city: ''
                                    });
                                  }}
                                >
                                  <SelectTrigger id="stateRegion" className="font-heading text-base sm:text-sm rounded-lg">
                                    <SelectValue placeholder="Select State..." />
                                  </SelectTrigger>
                                  <SelectContent className="z-[110] max-h-60">
                                    {availableStates.map((s) => (
                                      <SelectItem key={s.isoCode} value={s.isoCode}>
                                        {s.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input 
                                  id="stateRegion" 
                                  required 
                                  value={formData.stateRegion} 
                                  onChange={(e) => setFormData({ ...formData, stateRegion: e.target.value })} 
                                  placeholder="Type region..." 
                                  className="font-heading text-base sm:text-sm rounded-lg" 
                                />
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="city" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-1 block">City *</Label>
                              {hasCities ? (
                                <Select
                                  required
                                  value={formData.city}
                                  onValueChange={(cityName) => {
                                    setFormData({ ...formData, city: cityName });
                                  }}
                                >
                                  <SelectTrigger id="city" className="font-heading text-base sm:text-sm rounded-lg">
                                    <SelectValue placeholder="Select City..." />
                                  </SelectTrigger>
                                  <SelectContent className="z-[110] max-h-60">
                                    {availableCities.map((c, index) => (
                                      <SelectItem key={`${c.name}-${index}`} value={c.name}>
                                        {c.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input 
                                  id="city" 
                                  required 
                                  value={formData.city} 
                                  onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
                                  placeholder="Type city..." 
                                  className="font-heading text-base sm:text-sm rounded-lg" 
                                />
                              )}
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
                            <Select
                              required
                              value={selectedCountryCode}
                              onValueChange={(code) => {
                                setSelectedCountryCode(code);
                                setSelectedStateCode('');
                                setFormData({
                                  ...formData,
                                  country: Country.getCountryByCode(code)?.name || '',
                                  stateRegion: '',
                                  city: ''
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

                      <div className="pt-3 space-y-2">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-foreground text-background hover:bg-soft-gold hover:text-white transition-all rounded-full py-3.5 font-heading text-xs uppercase tracking-widest disabled:opacity-50 shadow-md"
                        >
                          {isSubmitting ? 'Sending...' : modalMode === 'claim' ? 'Place Order' : 'Submit Request'}
                        </Button>
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