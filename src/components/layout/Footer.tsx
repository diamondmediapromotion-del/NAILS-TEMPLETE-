import { Heart, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com/nailsbyuma',
      color: 'hover:text-pink-500',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://facebook.com/nailsbyuma',
      color: 'hover:text-blue-600',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: 'https://twitter.com/nailsbyuma',
      color: 'hover:text-sky-500',
    },
    {
      name: 'YouTube',
      icon: Youtube,
      url: 'https://youtube.com/@nailsbyuma',
      color: 'hover:text-red-600',
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-background to-muted/20 border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
              Nails by Uma - Jaipur
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Best Nail, Beauty & Bridal Mehndi Salon in Mansarovar, Jaipur. 100% Hygienic & Sanitized Tools for your safe self-care.
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              📍 Main Market Road, Near City Center Plaza, Mansarovar, Jaipur, Rajasthan 302020 (Opposite Gold Souk Boulevard, Near Metro Station)
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Made with <Heart className="w-3 h-3 fill-red-500 text-red-500" /> by Uma Sharma
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/book" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Book Appointment
                </a>
              </li>
              <li>
                <a href="/packages" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Packages & Offers
                </a>
              </li>
              <li>
                <a href="/gallery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Gallery
                </a>
              </li>
              <li>
                <a href="/my-bookings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Track Booking
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/reviews" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Reviews
                </a>
              </li>
              <li>
                <a href="/admin/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors opacity-60">
                  Admin Login
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-semibold mb-4">Connect With Us</h3>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li>
                <a href="tel:+916376539366" className="hover:text-foreground transition-colors">
                  📞 +91 63765 39366
                </a>
              </li>
              <li>
                <a href="https://wa.me/916376539366" className="hover:text-foreground transition-colors">
                  💬 WhatsApp Us (+91 63765 39366)
                </a>
              </li>
              <li>
                <a href="mailto:info@nailsbyuma.in" className="hover:text-foreground transition-colors text-xs">
                  ✉️ info@nailsbyuma.in
                </a>
              </li>
            </ul>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className={`p-2 rounded-full bg-muted hover:scale-110 transition-all ${social.color}`}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Nails by Uma. All rights reserved.</p>
          <p className="text-xs mt-1">UPI: 6376539366-2@ybl | Phone: +91 6376539366</p>
        </div>
      </div>
    </footer>
  );
}
