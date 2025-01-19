import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { ParcelRequest, ParcelDelivery } from '../types';

interface ParcelState {
  requests: ParcelRequest[];
  deliveries: ParcelDelivery[];
  isLoading: boolean;
  error: string | null;
  createParcelRequest: (request: Omit<ParcelRequest, 'id' | 'status' | 'created_at' | 'sender'>) => Promise<void>;
  updateParcelRequest: (id: string, request: Partial<ParcelRequest>) => Promise<void>;
  createParcelDelivery: (delivery: Omit<ParcelDelivery, 'id' | 'status' | 'created_at' | 'request' | 'ride' | 'driver'>) => Promise<void>;
  updateParcelDelivery: (id: string, delivery: Partial<ParcelDelivery>) => Promise<void>;
  getUserParcelRequests: (userId: string) => Promise<void>;
  getUserParcelDeliveries: (userId: string) => Promise<void>;
  getAvailableParcelRequests: () => Promise<void>;
}

export const useParcelStore = create<ParcelState>((set) => ({
  requests: [],
  deliveries: [],
  isLoading: false,
  error: null,

  createParcelRequest: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('parcel_requests').insert([request]);
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateParcelRequest: async (id, request) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('parcel_requests')
        .update(request)
        .eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createParcelDelivery: async (delivery) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('parcel_deliveries').insert([delivery]);
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateParcelDelivery: async (id, delivery) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('parcel_deliveries')
        .update(delivery)
        .eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getUserParcelRequests: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('parcel_requests')
        .select(`
          *,
          sender:profiles(*)
        `)
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ requests: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getUserParcelDeliveries: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('parcel_deliveries')
        .select(`
          *,
          request:parcel_requests(*),
          ride:rides(*),
          driver:profiles(*)
        `)
        .eq('driver_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ deliveries: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getAvailableParcelRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('parcel_requests')
        .select(`
          *,
          sender:profiles(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ requests: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));