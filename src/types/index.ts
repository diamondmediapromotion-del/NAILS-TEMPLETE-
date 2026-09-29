export interface Service {
  id: string;
  name: string;
  category: 'basic' | 'premium' | 'bridal' | 'art';
  description: string;
  duration: number; // in minutes
  price: number;
  image: string;
  popular?: boolean;
  designs?: string[]; // For nail art services
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  price: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  isReturning?: boolean;
}
