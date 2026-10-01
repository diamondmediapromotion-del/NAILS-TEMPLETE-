import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { HomePage } from '@/pages/HomePage';
import { BookingPage } from '@/pages/BookingPage';
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
import UserProfilePage from '@/pages/UserProfilePage';
import ServicesPage from '@/pages/ServicesPage';
import ServiceDetailPage from '@/pages/ServiceDetailPage';
import { Toaster } from '@/components/ui/toaster';
import { WhatsAppButton } from '@/components/features/WhatsAppButton';
import { MobileOverflowDiagnostic } from '@/components/common/MobileOverflowDiagnostic';

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <div className="min-h-screen bg-background pb-24 md:pb-0">
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/book" element={<BookingPage />} />
              <Route path="/booking-status/:bookingId" element={<BookingStatusPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/loyalty" element={<UserProfilePage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/signup" element={<AdminSignupPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/whatsapp-leads" element={<WhatsAppLeadsPage />} />
            </Routes>
            <Footer />
            <WhatsAppButton />
            <MobileBottomNav />
            <MobileOverflowDiagnostic />
            <Toaster />
          </div>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
