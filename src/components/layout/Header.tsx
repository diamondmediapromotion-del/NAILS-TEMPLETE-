import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Menu, X, Phone, Crown, Heart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll offset for dynamic navbar transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Packages', href: '/packages' },
    { name: 'Book Appointment', href: '/book' },
    { name: 'My Bookings', href: '/my-bookings' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass-nav-scrolled bg-white/90 dark:bg-slate-950/90 shadow-md py-2.5'
          : 'glass-nav bg-white/60 dark:bg-slate-950/60 py-3.5'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Premium Logo & Text Area */}
          <Link
            to="/"
            className="flex items-center gap-3 group transition-all duration-300 hover:opacity-95"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-amber-600 bg-clip-text text-transparent">
                  Nails by Uma
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-pink-100/80 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300">
                  Jaipur
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                Nail &amp; Beauty Studio
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-3.5 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all relative ${
                    isActive
                      ? 'text-pink-600 dark:text-pink-400 font-bold bg-pink-500/10 shadow-xs'
                      : 'text-slate-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-500/5'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA Buttons & Hamburger */}
          <div className="flex items-center gap-3">
            {/* Quick Call Button (Desktop) */}
            <a
              href="tel:+916376539366"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-pink-600 bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/10 hover:border-pink-300 transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-pink-500" />
              <span>+91 63765 39366</span>
            </a>

            {/* Book Appointment CTA Button */}
            <Button
              onClick={() => navigate('/book')}
              className="gap-2 bg-gradient-to-r from-pink-600 via-rose-500 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl shadow-md shadow-pink-600/25 font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </Button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-slate-800 transition-all"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="xl:hidden mt-3 pt-3 border-t border-pink-500/20 space-y-1 pb-3 overflow-hidden"
            >
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'text-pink-600 dark:text-pink-400 bg-pink-500/15 font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:text-pink-600 hover:bg-pink-500/5'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && <Sparkles className="w-4 h-4 text-pink-500" />}
                  </Link>
                );
              })}

              <div className="pt-3 mt-2 border-t border-pink-500/10 flex items-center justify-between px-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-pink-500" /> Mon–Sat 10AM–8PM
                </span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <Crown className="w-3.5 h-3.5 text-amber-500" /> VIP Salon
                </span>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export default Header;
