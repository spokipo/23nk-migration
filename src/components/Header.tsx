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
  
  // Стейт для прячущегося хедера
  const [isHidden, setIsHidden] = useState(false);
  const { scrollY } = useScroll();

  // === СТЕЙТЫ МЕНЮ ===
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

  // Загрузка коллекций
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await BaseCrudService.getAll<Collections>('collections');
        setCollections(data.items || []);
      } catch (err) {
        console.error('Ошибка при загрузке коллекций:', err);
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
      setIsMobileCatalogOpen(false); 
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsDesktopDropdownOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Проверка активности каталога
  const isCatalogActive = location.pathname.includes('/catalog');

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: '-100%' },
      }}
      animate={isHidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
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

          {/* === ДЕСКТОП === */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => {
              const isCatalog = link.path === '/catalog';
              const isActive = isCatalog ? isCatalogActive : location.pathname === link.path;
              
              // Показываем дропдаун ТОЛЬКО если мы НЕ в каталоге
              const canShowDropdown = isCatalog && !isCatalogActive;
              
              return (
                <div 
                  key={link.path}
                  className="relative flex items-center justify-center"
                  onMouseEnter={canShowDropdown ? () => setIsDesktopDropdownOpen(true) : undefined}
                  onMouseLeave={canShowDropdown ? () => setIsDesktopDropdownOpen(false) : undefined}
                >
                  <Link
                    to={link.path}
                    className={`relative font-heading text-xs uppercase tracking-widest py-2 transition-colors duration-300 ${
                      isActive ? 'text-foreground font-semibold' : 'text-foreground/60 hover:text-foreground'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute left-0 right-0 -bottom-1 h-[2px] bg-soft-gold"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>

                  {/* === ВЫПАДАЮЩЕЕ МЕНЮ КАТАЛОГА === */}
                  {canShowDropdown && (
                    <AnimatePresence>
                      {isDesktopDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, x: "-50%" }}
                          animate={{ opacity: 1, y: 0, x: "-50%" }}
                          exit={{ opacity: 0, y: 15, x: "-50%" }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-full left-1/2 pt-4 w-56 z-50"
                        >
                          {/* ИСПРАВЛЕНИЕ: bg-background (сплошной цвет без стекла) и глубокая тень */}
                          <div className="bg-background bg-gradient-to-b from-foreground/5 to-transparent border border-foreground/10 border-t-foreground/20 rounded-2xl shadow-2xl py-3 flex flex-col overflow-hidden">
                            <Link to="/catalog" className="px-6 py-2.5 font-heading text-[11px] uppercase tracking-widest text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors">
                              All Products
                            </Link>
                            <Link to="/catalog?collection=ready-to-ship" className="px-6 py-2.5 font-heading text-[11px] uppercase tracking-widest text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors">
                              Ready to Ship
                            </Link>
                            {collections.length > 0 && <div className="h-px bg-foreground/10 my-1 mx-6" />}
                            {collections.map(col => (
                              <Link key={col._id} to={`/catalog?collection=${getCollectionSlug(col)}`} className="px-6 py-2.5 font-heading text-[11px] uppercase tracking-widest text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors">
                                {col.name}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
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

      {/* === МОБИЛКА === */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute top-16 left-0 right-0 h-[calc(100dvh-4rem)] bg-background border-t border-foreground/10 md:hidden flex flex-col"
          >
            <nav className="flex flex-col px-6 py-8 space-y-2 flex-1 overflow-y-auto">
              {navLinks.map((link) => {
                const isCatalog = link.path === '/catalog';
                const isActive = isCatalog 
                  ? location.pathname.includes('/catalog') 
                  : location.pathname === link.path;
                
                if (isCatalog) {
                  return (
                    <motion.div 
                      key={link.path}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="flex flex-col"
                    >
                      <button
                        onClick={() => setIsMobileCatalogOpen(!isMobileCatalogOpen)}
                        className={`text-left block font-heading text-lg sm:text-xl uppercase tracking-widest py-4 px-4 rounded-xl transition-all ${
                          isActive
                            ? 'bg-soft-gold/10 text-soft-gold font-semibold translate-x-2'
                            : 'text-foreground/80 hover:bg-foreground/5 hover:text-foreground'
                        }`}
                      >
                        {link.label}
                      </button>

                      <AnimatePresence>
                        {isMobileCatalogOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden flex flex-col pl-8 mb-2"
                          >
                            <Link to="/catalog" onClick={closeMenu} className="block py-3 font-heading text-[13px] uppercase tracking-widest text-foreground/60 hover:text-foreground">
                              All Products
                            </Link>
                            <Link to="/catalog?collection=ready-to-ship" onClick={closeMenu} className="block py-3 font-heading text-[13px] uppercase tracking-widest text-foreground/60 hover:text-foreground">
                              Ready to Ship
                            </Link>
                            {collections.map(col => (
                              <Link key={col._id} to={`/catalog?collection=${getCollectionSlug(col)}`} onClick={closeMenu} className="block py-3 font-heading text-[13px] uppercase tracking-widest text-foreground/60 hover:text-foreground">
                                {col.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                }

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