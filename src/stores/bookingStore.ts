import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Booking } from '../types';

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  createBooking: (booking: Omit<Booking, 'id' | 'created_at'>) => Promise<void>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
  getUserBookings: (userId: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  isLoading: false,
  error: null,

  createBooking: async (booking) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('bookings').insert([booking]);
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateBookingStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getUserBookings: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          ride:rides(*),
          passenger:profiles(*)
        `)
        .or(`passenger_id.eq.${userId},ride.driver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ bookings: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));