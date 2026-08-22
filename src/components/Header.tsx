import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Collections } from '@/entities';

// Функция для красивых ссылок
const getCollectionSlug = (collection: any) => {
  if (collection.slug) return collection.slug;
  if (collection.handle) return collection.handle;
  return collection.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

export default function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Стейты для умного скролла
  const [isHidden, setIsHidden] = useState(false);
  const { scrollY } = useScroll();

  // Стейты для выпадающего меню коллекций
  const [collections, setCollections] = useState<Collections[]>([]);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/catalog', label: 'Catalog' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/delivery', label: 'Delivery' },
    { path: '/contact', label: 'Contact' },
  ];

  // Подтягиваем коллекции
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await BaseCrudService.getAll<Collections>('collections');
        setCollections(data.items || []);
      } catch (err) {
        console.error('Ошибка при загрузке коллекций в хедере:', err);
      }
    };
    fetchCollections();
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 100) {
      setIsHidden(true);
      setIsDesktopDropdownOpen(false);
    } else {
      setIsHidden(false);
    }
  });

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

  useEffect(() => {
    setIsMenuOpen(false);
    setIsDesktopDropdownOpen(false);
  }, [location.pathname, location.search]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const isCatalogActive = location.pathname.includes('/catalog');

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: '-100%' },
      }}
      animate={isHidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="sticky top-0 z-50 bg-background/85 backdrop-blur-md md:bg-background md:backdrop-blur-none border-b border-foreground/10"
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
              if (link.path === '/catalog') {
                return (
                  <div 
                    key="catalog-desktop"
                    className="relative py-2"
                    onMouseEnter={() => setIsDesktopDropdownOpen(true)}
                    onMouseLeave={() => setIsDesktopDropdownOpen(false)}
                  >
                    <button
                      className={`flex items-center gap-1.5 relative font-heading text-xs uppercase tracking-widest transition-colors duration-300 ${
                        isCatalogActive ? 'text-foreground font-semibold' : 'text-foreground/60 hover:text-foreground'
                      }`}
                    >
                      {link.label}
                      {isCatalogActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute left-0 right-0 -bottom-3 h-[2px] bg-soft-gold"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>

                    <AnimatePresence>
                      {isDesktopDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-[100%] mt-4 -left-6 w-56 bg-background/95 backdrop-blur-md border border-foreground/10 rounded-2xl shadow-xl py-3 flex flex-col z-50 overflow-hidden"
                        >
                          <Link to="/catalog" className="px-6 py-2.5 font-heading text-[11px] uppercase tracking-widest text-foreground/70 hover:text-foreground hover:bg-foreground/5 hover:pl-7 transition-all">
                            All Products
                          </Link>
                          <Link to="/catalog?collection=ready-to-ship" className="px-6 py-2.5 font-heading text-[11px] uppercase tracking-widest text-foreground/70 hover:text-foreground hover:bg-foreground/5 hover:pl-7 transition-all">
                            Ready to Ship
                          </Link>
                          {collections.length > 0 && <div className="h-px bg-foreground/10 my-2 mx-6" />}
                          {collections.map(col => (
                            <Link key={col._id} to={`/catalog?collection=${getCollectionSlug(col)}`} className="px-6 py-2.5 font-heading text-[11px] uppercase tracking-widest text-foreground/70 hover:text-foreground hover:bg-foreground/5 hover:pl-7 transition-all">
                              {col.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

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
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute left-0 right-0 -bottom-3 h-[2px] bg-soft-gold"
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
            className="absolute top-16 left-0 right-0 h-[calc(100dvh-4rem)] bg-background border-t border-foreground/10 md:hidden flex flex-col overflow-y-auto"
          >
            <nav className="flex flex-col px-6 py-8 space-y-2 flex-1">
              {navLinks.map((link, index) => {
                
                // ОСОБЕННЫЙ РЕНДЕР ДЛЯ КАТАЛОГА (МОБИЛКА)
                if (link.path === '/catalog') {
                  return (
                    <motion.div 
                      key="catalog-mobile"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 + (index * 0.05) }}
                      className="flex flex-col"
                    >
                      <button 
                        onClick={() => setIsMobileCatalogOpen(!isMobileCatalogOpen)}
                        className={`w-full text-left font-heading text-lg sm:text-xl uppercase tracking-widest py-4 px-4 rounded-xl transition-all ${
                          isCatalogActive ? 'bg-soft-gold/10 text-soft-gold font-semibold translate-x-2' : 'text-foreground/80 hover:bg-foreground/5 hover:text-foreground'
                        }`}
                      >
                        {link.label}
                      </button>

                      {/* Плавно выезжающее подменю БЕЗ ПОЛОСОК */}
                      <AnimatePresence>
                        {isMobileCatalogOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden flex flex-col gap-1.5 pl-6 mt-1 mb-2"
                          >
                            <Link to="/catalog" onClick={closeMenu} className="block py-2.5 font-heading text-[13px] uppercase tracking-widest text-foreground/50 hover:text-foreground">
                              All Products
                            </Link>
                            <Link to="/catalog?collection=ready-to-ship" onClick={closeMenu} className="block py-2.5 font-heading text-[13px] uppercase tracking-widest text-foreground/50 hover:text-foreground">
                              Ready to Ship
                            </Link>
                            {collections.map(col => (
                              <Link key={col._id} to={`/catalog?collection=${getCollectionSlug(col)}`} onClick={closeMenu} className="block py-2.5 font-heading text-[13px] uppercase tracking-widest text-foreground/50 hover:text-foreground">
                                {col.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                }

                // СТАНДАРТНЫЕ ССЫЛКИ МОБИЛКИ
                const isActive = location.pathname === link.path;
                return (
                  <motion.div 
                    key={link.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 + (index * 0.05) }}
                  >
                    <Link
                      to={link.path}
                      onClick={closeMenu}
                      className={`block font-heading text-lg sm:text-xl uppercase tracking-widest py-4 px-4 rounded-xl transition-all ${
                        isActive ? 'bg-soft-gold/10 text-soft-gold font-semibold translate-x-2' : 'text-foreground/80 hover:bg-foreground/5 hover:text-foreground'
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