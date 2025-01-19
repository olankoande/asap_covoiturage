import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Ride } from '../types';

interface RideState {
  rides: Ride[];
  isLoading: boolean;
  error: string | null;
  searchRides: (params: {
    departure?: string;
    destination?: string;
    date?: string;
  }) => Promise<Ride[]>;
  createRide: (ride: Omit<Ride, 'id' | 'created_at' | 'driver' | 'vehicle' | 'bookings'>) => Promise<void>;
  updateRide: (id: string, ride: Partial<Ride>) => Promise<void>;
  deleteRide: (id: string) => Promise<void>;
}

export const useRideStore = create<RideState>((set) => ({
  rides: [],
  isLoading: false,
  error: null,

  searchRides: async (params) => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from('rides')
        .select(`
          *,
          driver:profiles!rides_driver_id_fkey(*),
          vehicle:vehicles(*),
          bookings(*)
        `)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (params.departure) {
        query = query.ilike('departure', `%${params.departure}%`);
      }
      if (params.destination) {
        query = query.ilike('destination', `%${params.destination}%`);
      }
      if (params.date) {
        query = query.eq('date', params.date);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ rides: data || [] });
      return data || [];
    } catch (error: any) {
      set({ error: error.message });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  createRide: async (ride) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('rides').insert([{
        ...ride,
        payment_methods: ride.payment_methods || ['cash']
      }]);
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateRide: async (id, ride) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('rides')
        .update(ride)
        .eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteRide: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('rides')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));