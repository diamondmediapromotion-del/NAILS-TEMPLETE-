import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomePage } from '@/pages/HomePage';
import { NewBookingPage } from '@/pages/NewBookingPage';
import { BookingStatusPage } from '@/pages/BookingStatusPage';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { AdminSignupPage } from '@/pages/AdminSignupPage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { ReviewsPage } from '@/pages/ReviewsPage';
import WhatsAppLeadsPage from '@/pages/WhatsAppLeadsPage';
import GalleryPage from '@/pages/GalleryPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import FAQPage from '@/pages/FAQPage';
import PackagesPage from '@/pages/PackagesPage';
import MyBookingsPage from '@/pages/MyBookingsPage';
import ServicesPage from '@/pages/ServicesPage';
import { Toaster } from '@/components/ui/toaster';
import { WhatsAppButton } from '@/components/features/WhatsAppButton';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/book" element={<NewBookingPage />} />
            <Route path="/booking-status/:bookingId" element={<BookingStatusPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/signup" element={<AdminSignupPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/whatsapp-leads" element={<WhatsAppLeadsPage />} />
          </Routes>
          <Footer />
          <WhatsAppButton />
          <Toaster />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
