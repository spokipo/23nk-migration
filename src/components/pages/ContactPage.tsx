import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
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
import { EmailService } from '@/services/email-service';
import { Country } from 'country-state-city';
import { motion } from 'framer-motion';
import { Instagram, Mail, MessageSquare } from 'lucide-react';
import React, { useState } from 'react';

// Полный список стран доставки Nova Poshta Global (ISO Alpha-2 коды)
const NOVA_POSHTA_COUNTRIES = [
  // Європа
  'AT', 'UA', 'AL', 'AD', 'BE', 'BG', 'BA', 'VA', 'GB', 'GR', 'GI', 'DK', 'EE', 'IE', 'IS', 'ES', 'IT', 'CY', 'LV', 'LT', 'LI', 'LU', 'MT', 'MD', 'MC', 'NL', 'DE', 'NO', 'MK', 'PL', 'PT', 'RO', 'SM', 'RS', 'SK', 'SI', 'TR', 'CZ', 'ME', 'HU', 'FI', 'FR', 'HR', 'CH', 'SE',
  // Північна Америка, Китай та Гонконг
  'US', 'CA', 'CN', 'HK',
  // Інший світ
  'AU', 'AZ', 'DZ', 'AS', 'AO', 'AI', 'AG', 'AR', 'AW', 'AF', 'BS', 'BD', 'BB', 'BH', 'BZ', 'BJ', 'BM', 'BO', 'BQ', 'BW', 'BR', 'VG', 'BN', 'BF', 'BI', 'BT', 'VN', 'VU', 'VI', 'VE', 'AM', 'GA', 'HT', 'GM', 'GH', 'GN', 'GW', 'HN', 'GE', 'GY', 'GP', 'GT', 'GD', 'GL', 'GU', 'DJ', 'DM', 'DO', 'EC', 'ER', 'SZ', 'ET', 'EG', 'ZM', 'ZW', 'IL', 'IN', 'ID', 'IQ', 'JO', 'CV', 'KZ', 'KY', 'KH', 'CM', 'QA', 'KE', 'NE', 'KG', 'CO', 'KM', 'CG', 'CR', 'CI', 'KW', 'CK', 'CW', 'LA', 'LS', 'LR', 'LB', 'MU', 'MR', 'MG', 'YT', 'MO', 'MW', 'MY', 'ML', 'MV', 'MA', 'MQ', 'MH', 'MX', 'MZ', 'MN', 'NA', 'NP', 'NG', 'NI', 'NZ', 'NC', 'AE', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'ZA', 'MP', 'PR', 'KR', 'RE', 'RW', 'SV', 'WS', 'SA', 'SC', 'BL', 'SN', 'MF', 'SX', 'VC', 'KN', 'LC', 'SG', 'SB', 'TL', 'SL', 'TH', 'PF', 'TW', 'TZ', 'TC', 'TG', 'TO', 'TT', 'TN', 'UG', 'UZ', 'UY', 'FO', 'FJ', 'PH', 'GF', 'TD', 'CL', 'LK', 'JM', 'FM', 'JP'
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    country: '',
    message: '',
    preferredContactMethod: '',
    contactDetails: '',
  });

  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.preferredContactMethod) {
      toast({
        title: 'Error',
        description: 'Please select a preferred contact method.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submission: ContactFormSubmissions = {
        _id: crypto.randomUUID(),
        fullName: formData.fullName,
        country: formData.country,
        preferredContactMethod: formData.preferredContactMethod,
        contactDetails: formData.contactDetails,
        message: formData.message,
      };

      await BaseCrudService.create('contactformsubmissions', submission);
      
      // Отправляем на Email
      await EmailService.sendSubmissionNotification(submission);

      // Отправляем в Telegram без звездочки
      await sendOrderNotification({
        title: 'General Contact Inquiry',
        formData: formData,
      });

      toast({
        title: 'Message Sent!',
        description: 'Thank you for your message. A reply will be sent shortly.',
      });

      setFormData({
        fullName: '',
        country: '',
        message: '',
        preferredContactMethod: '',
        contactDetails: '',
      });
      setSelectedCountryCode('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-paragraph text-foreground selection:bg-soft-gold/20 flex flex-col">
      <Header />

      <main className="flex-1 py-8 md:py-16">
        <div className="max-w-[120rem] mx-auto px-6 md:px-20">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 md:mb-16 flex flex-col items-center"
          >
            <h1 className="font-heading text-2xl md:text-4xl text-foreground mb-3">
              Get in Touch
            </h1>
            <p className="font-paragraph text-xs md:text-sm text-foreground/60 max-w-xl mx-auto text-center leading-relaxed">
              Have a question about custom orders, sizing, or the upcycling process? 
              Assistance is available for any questions or inquiries.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
            
            {/* LEFT: CONTACT FORM */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-ivory p-6 md:p-10 rounded-2xl shadow-sm border border-foreground/5"
            >
              <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="w-5 h-5 text-soft-gold" />
                <h2 className="font-heading text-xl md:text-2xl text-foreground">
                  Send a Message
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="fullName" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-2 block">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="font-heading text-base sm:text-sm rounded-lg bg-background border-foreground/10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-2 block">
                      Country *
                    </Label>
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
                      <SelectTrigger id="country" className="font-heading text-base sm:text-sm rounded-lg bg-background border-foreground/10">
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
                </div>

                <div>
                  <Label htmlFor="preferredContactMethod" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-2 block">
                    Preferred Contact Method *
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
                      className="rounded-lg font-heading text-base sm:text-sm bg-background border-foreground/10"
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
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <Label htmlFor="contactDetails" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-2 block mt-1">
                      {formData.preferredContactMethod === 'email' && 'Email Address *'}
                      {formData.preferredContactMethod === 'instagram' && 'Instagram Handle *'}
                      {formData.preferredContactMethod === 'whatsapp' && 'WhatsApp Number *'}
                    </Label>
                    <Input
                      id="contactDetails"
                      required
                      value={formData.contactDetails}
                      onChange={(e) => setFormData({ ...formData, contactDetails: e.target.value })}
                      placeholder={
                        formData.preferredContactMethod === 'email' ? 'your@email.com' :
                        formData.preferredContactMethod === 'whatsapp' ? '+1 234 567 890' : '@yourhandle'
                      }
                      className="font-heading text-base sm:text-sm rounded-lg bg-background border-foreground/10"
                    />
                  </motion.div>
                )}

                <div>
                  <Label htmlFor="message" className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 mb-2 block">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help you?"
                    className="font-heading text-base sm:text-sm rounded-lg bg-background border-foreground/10 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-foreground text-background hover:bg-soft-gold hover:text-white transition-all rounded-full py-6 font-heading text-xs uppercase tracking-widest disabled:opacity-50 mt-4 shadow-md"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </motion.div>

            {/* RIGHT: DIRECT CONTACT */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col justify-center h-full"
            >
              <div className="mb-10">
                <h2 className="font-heading text-xl md:text-3xl text-foreground mb-4">
                  Direct Contact
                </h2>
                <p className="font-paragraph text-sm text-foreground/70 leading-relaxed">
                  Prefer reaching out directly? Feel free to use Email or Instagram for questions regarding order details, custom sizing, or styling advice.
                </p>
              </div>

              <div className="space-y-6">
                <a href="mailto:23nk.corset@gmail.com" className="flex items-start gap-5 group p-4 rounded-2xl hover:bg-ivory transition-colors border border-transparent hover:border-foreground/5">
                  <div className="w-12 h-12 rounded-full bg-background border border-foreground/10 flex items-center justify-center shrink-0 group-hover:border-soft-gold transition-colors shadow-sm">
                    <Mail className="w-5 h-5 text-foreground group-hover:text-soft-gold transition-colors" />
                  </div>
                  <div>
                    <p className="font-heading text-[11px] uppercase tracking-widest text-foreground/50 mb-1">
                      Email Us
                    </p>
                    <p className="font-heading text-base text-foreground font-semibold group-hover:text-soft-gold transition-colors">
                      23nk.corset@gmail.com
                    </p>
                  </div>
                </a>

                <a href="https://www.instagram.com/i23nk/" target="_blank" rel="noopener noreferrer" className="flex items-start gap-5 group p-4 rounded-2xl hover:bg-ivory transition-colors border border-transparent hover:border-foreground/5">
                  <div className="w-12 h-12 rounded-full bg-background border border-foreground/10 flex items-center justify-center shrink-0 group-hover:border-soft-gold transition-colors shadow-sm">
                    <Instagram className="w-5 h-5 text-foreground group-hover:text-soft-gold transition-colors" />
                  </div>
                  <div>
                    <p className="font-heading text-[11px] uppercase tracking-widest text-foreground/50 mb-1">
                      DM on Instagram
                    </p>
                    <p className="font-heading text-base text-foreground font-semibold group-hover:text-soft-gold transition-colors">
                      @i23nk
                    </p>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}