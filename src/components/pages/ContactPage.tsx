import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContactFormSubmissions } from '@/entities';
import { useToast } from '@/hooks/use-toast';
import { BaseCrudService } from '@/integrations';
import { EmailService } from '@/services/email-service';
import { motion } from 'framer-motion';
import { Check, ChevronDown, Instagram, Mail } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    country: '',
    message: '',
    preferredContactMethod: '',
    contactDetails: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const selectRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsSelectOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const contactOptions = [
    { value: 'email', label: 'Email' },
    { value: 'instagram', label: 'Instagram' },
  ];

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

      await BaseCrudService.create(
        'contactformsubmissions',
        submission
      );

      await EmailService.sendSubmissionNotification(submission);

      toast({
        title: 'Message Sent!',
        description:
          'Thank you for your message. A reply will be sent shortly.',
      });

      setFormData({
        fullName: '',
        country: '',
        message: '',
        preferredContactMethod: '',
        contactDetails: '',
      });
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
    <div className="min-h-screen bg-background font-paragraph text-foreground selection:bg-soft-gold/20">
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-[120rem] mx-auto px-6 md:px-20">

          {/* PAGE HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <h1 className="font-heading text-3xl md:text-5xl text-foreground mb-4">
              Get in Touch
            </h1>

            <p className="font-paragraph text-xs md:text-sm text-foreground/70 max-w-xl mx-auto leading-relaxed">
              Have a question about custom orders, sizing, or the upcycling
              process? Assistance is available for any questions or inquiries.
            </p>
          </motion.div>

          {/* MAIN CONTENT */}
          <div className="max-w-lg mx-auto space-y-10 md:space-y-12">

            {/* CONTACT FORM */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-ivory/60 p-6 md:p-8 rounded-2xl border border-foreground/10"
            >
              <h2 className="font-heading text-xl md:text-2xl text-foreground mb-6">
                Send a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* FULL NAME */}
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

                {/* COUNTRY */}
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

                {/* CONTACT METHOD */}
                <div className="relative" ref={selectRef}>
                  <Label
                    htmlFor="preferredContactMethod"
                    className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1.5 block"
                  >
                    Preferred Contact Method *
                  </Label>

                  <button
                    type="button"
                    id="preferredContactMethod"
                    onClick={() =>
                      setIsSelectOpen(!isSelectOpen)
                    }
                    className="w-full flex items-center justify-between font-heading text-sm rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  >
                    <span
                      className={
                        formData.preferredContactMethod
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }
                    >
                      {contactOptions.find(
                        (option) =>
                          option.value ===
                          formData.preferredContactMethod
                      )?.label || 'Select a method'}
                    </span>

                    <ChevronDown
                      className={`w-4 h-4 opacity-50 transition-transform duration-200 ${
                        isSelectOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isSelectOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-foreground/10 rounded-lg shadow-lg py-1 overflow-hidden">
                      {contactOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              preferredContactMethod:
                                option.value,
                              contactDetails: '',
                            });

                            setIsSelectOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 font-heading text-sm text-left hover:bg-foreground/5 transition-colors"
                        >
                          <span>{option.label}</span>

                          {formData.preferredContactMethod ===
                            option.value && (
                            <Check className="w-4 h-4 text-foreground" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* CONTACT DETAILS */}
                {formData.preferredContactMethod && (
                  <div>
                    <Label
                      htmlFor="contactDetails"
                      className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1.5 block"
                    >
                      {formData.preferredContactMethod ===
                        'email' && 'Email Address *'}

                      {formData.preferredContactMethod ===
                        'instagram' && 'Instagram Handle *'}
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
                        'email'
                          ? 'your@email.com'
                          : '@yourhandle'
                      }
                      className="font-heading text-sm rounded-lg"
                    />
                  </div>
                )}

                {/* MESSAGE */}
                <div>
                  <Label
                    htmlFor="message"
                    className="font-heading text-xs uppercase tracking-wider text-foreground/70 mb-1.5 block"
                  >
                    Message *
                  </Label>

                  <Textarea
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        message: e.target.value,
                      })
                    }
                    placeholder="How can we help you?"
                    className="font-heading text-sm rounded-lg"
                  />
                </div>

                {/* SUBMIT */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-foreground text-background hover:bg-soft-gold hover:text-white transition-all rounded-full py-3 font-heading text-xs uppercase tracking-widest disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </motion.div>

            {/* DIRECT CONTACT */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full text-center"
            >
              <div>
                <h2 className="font-heading text-xl md:text-2xl text-foreground mb-3">
                  Direct Contact
                </h2>

                <p className="font-paragraph text-xs md:text-sm text-foreground/80 leading-relaxed max-w-md mx-auto">
                  Prefer reaching out directly? Email or Instagram are
                  available for questions, order details, and other inquiries.
                </p>
              </div>

              {/* CONTACT CHANNELS */}
              <div className="mt-6 pt-5 border-t border-foreground/10 space-y-3 text-left">

                {/* EMAIL */}
                <a
                  href="mailto:23nk.corset@gmail.com"
                  className="flex items-center gap-4 group p-2 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-ivory border border-foreground/10 flex items-center justify-center shrink-0 group-hover:border-soft-gold transition-colors">
                    <Mail className="w-4 h-4 text-foreground group-hover:text-soft-gold transition-colors" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-heading text-xs uppercase tracking-wider text-foreground/60">
                      Email
                    </p>

                    <p className="font-heading text-sm text-foreground font-semibold group-hover:text-soft-gold transition-colors truncate">
                      23nk.corset@gmail.com
                    </p>
                  </div>
                </a>

                {/* INSTAGRAM */}
                <a
                  href="https://www.instagram.com/i23nk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group p-2 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-ivory border border-foreground/10 flex items-center justify-center shrink-0 group-hover:border-soft-gold transition-colors">
                    <Instagram className="w-4 h-4 text-foreground group-hover:text-soft-gold transition-colors" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-heading text-xs uppercase tracking-wider text-foreground/60">
                      Instagram
                    </p>

                    <p className="font-heading text-sm text-foreground font-semibold group-hover:text-soft-gold transition-colors">
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
