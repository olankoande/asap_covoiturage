import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Payment } from '../types';

interface PaymentState {
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  createPayment: (bookingId: string, amount: number, paymentMethod: Payment['payment_method']) => Promise<Payment>;
  processPayment: (bookingId: string, paymentData: { paymentId: string; amount: string }) => Promise<void>;
  getBookingPayment: (bookingId: string) => Promise<Payment | null>;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  isLoading: false,
  error: null,

  createPayment: async (bookingId, amount, paymentMethod) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([
          {
            booking_id: bookingId,
            amount,
            payment_method: paymentMethod,
          },
        ])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Erreur lors de la création du paiement');
      
      return data;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  processPayment: async (bookingId: string, paymentData: { paymentId: string; amount: string }) => {
    set({ isLoading: true, error: null });
    try {
      // Get booking and ride details first
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          ride:rides(
            *,
            driver:profiles(*)
          )
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;
      if (!booking) throw new Error('Réservation non trouvée');

      // Update payment status in database
      const { error: updateError } = await supabase
        .from('payments')
        .update({ 
          status: 'completed',
          payment_method: 'paypal'
        })
        .eq('booking_id', bookingId);

      if (updateError) throw updateError;

      // Update booking status
      const { error: bookingUpdateError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (bookingUpdateError) throw bookingUpdateError;
      
      // Update driver's wallet balance
      const { error: walletError } = await supabase
        .from('profiles')
        .update({
          wallet_balance: supabase.sql`wallet_balance + ${parseFloat(paymentData.amount)}`
        })
        .eq('id', booking.ride.driver_id);

      if (walletError) throw walletError;

    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getBookingPayment: async (bookingId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error: any) {
      set({ error: error.message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));