import { Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-foreground/10 mt-20">
      <div className="max-w-[120rem] mx-auto px-6 md:px-20 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

          <div>

            <div className="flex gap-6 items-center">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/i23nk/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-soft-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>

              {/* Pinterest (Безопасный чистый SVG) */}
              <a
                href="https://pinterest.com/23NKcorset"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-soft-gold transition-colors"
                aria-label="Pinterest"
              >
                <svg
                  width="22"
                  height="22"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.592 0 12.017 0z"/>
                </svg>
              </a>

              {/* Email */}
              <a
                href="mailto:info@upcyclecorsets.com"
                className="text-foreground hover:text-soft-gold transition-colors"
                aria-label="Email"
              >

              </a>
            </div>
          </div>

        </div>

        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-foreground/10 text-center">
          <p className="font-heading text-xs md:text-sm text-foreground/60">
            © {new Date().getFullYear()} I23NK. All rights reserved. <Link to="/privacy-policy" className="hover:text-soft-gold transition-colors">Privacy Policy</Link> · <Link to="/terms-conditions" className="hover:text-soft-gold transition-colors">Terms & Conditions</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
