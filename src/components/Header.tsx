import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Стейт для прячущегося хедера
  const [isHidden, setIsHidden] = useState(false);
  const { scrollY } = useScroll();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/catalog', label: 'Catalog' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/delivery', label: 'Delivery' },
    { path: '/contact', label: 'Contact' },
  ];

  // Логика "умного" скролла: прячем при скролле вниз, показываем при скролле вверх
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 100) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });

  // Блокируем скролл сайта, когда открыто мобильное меню
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Закрываем меню при смене страницы
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: '-100%' },
      }}
      animate={isHidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      // ВЕРНУЛИ STICKY ВМЕСТО FIXED! Теперь он резервирует место и контент не прыгает под него
      className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-foreground/10"
    >
      <div className="max-w-[120rem] mx-auto px-6 md:px-20">
        <div className="flex items-center justify-between h-16 md:h-24">
          <Link 
            to="/" 
            className="font-heading text-xl md:text-3xl text-foreground font-bold uppercase tracking-widest relative z-50"
          >
            I23NK
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative font-heading text-xs uppercase tracking-widest py-2 transition-colors duration-300 ${
                    isActive ? 'text-foreground font-semibold' : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  {link.label}
                  {/* Магическое подчеркивание Framer Motion */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute left-0 right-0 -bottom-1 h-[2px] bg-soft-gold"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-foreground hover:text-soft-gold transition-colors relative z-50"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            // Используем 100dvh (dynamic viewport height) чтобы сафари не съедал низ
            className="absolute top-16 left-0 right-0 h-[calc(100dvh-4rem)] bg-background border-t border-foreground/10 md:hidden flex flex-col"
          >
            <nav className="flex flex-col px-6 py-8 space-y-2 flex-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <motion.div 
                    key={link.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Link
                      to={link.path}
                      onClick={closeMenu}
                      className={`block font-heading text-lg sm:text-xl uppercase tracking-widest py-4 px-4 rounded-xl transition-all ${
                        isActive
                          ? 'bg-soft-gold/10 text-soft-gold font-semibold translate-x-2'
                          : 'text-foreground/80 hover:bg-foreground/5 hover:text-foreground'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}