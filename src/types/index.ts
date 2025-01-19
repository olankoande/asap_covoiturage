export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  color: string;
  plate_number: string;
  image_url?: string;
  created_at: string;
}

export interface Ride {
  id: string;
  driver_id: string;
  vehicle_id: string;
  departure_location?: string;
  destination_location?: string;
  departure: string;
  destination: string;
  date: string;
  time: string;
  price: number;
  seats: number;
  description?: string;
  payment_methods: ('cash' | 'credit_card')[];
  created_at: string;
  driver?: User;
  vehicle?: Vehicle;
  bookings?: Booking[];
  parcel_deliveries?: ParcelDelivery[];
}

export interface Booking {
  id: string;
  ride_id: string;
  passenger_id: string;
  seats: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  ride?: Ride;
  passenger?: User;
  payment?: Payment;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'credit_card' | 'debit_card' | 'paypal';
  created_at: string;
}

export interface PaymentFormData {
  paymentId: string;
  amount: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  ride_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: User;
  reviewed?: User;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  ride_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface Preference {
  id: string;
  user_id: string;
  smoking_allowed: boolean;
  pets_allowed: boolean;
  music_allowed: boolean;
  created_at: string;
}

export interface ParcelRequest {
  id: string;
  sender_id: string;
  pickup_location: string;
  delivery_location: string;
  description?: string;
  weight: number;
  size: 'small' | 'medium' | 'large';
  requested_delivery_date: string;
  price_offer: number;
  status: 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';
  created_at: string;
  sender?: User;
}

export interface ParcelDelivery {
  id: string;
  request_id: string;
  ride_id: string;
  driver_id: string;
  status: 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  delivery_price: number;
  pickup_time?: string;
  delivery_time?: string;
  created_at: string;
  request?: ParcelRequest;
  ride?: Ride;
  driver?: User;
}