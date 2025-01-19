import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Vehicle } from '../types';

interface VehicleState {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  createVehicle: (vehicle: Omit<Vehicle, 'id' | 'created_at'>) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  getUserVehicles: (userId: string) => Promise<void>;
}

export const useVehicleStore = create<VehicleState>((set) => ({
  vehicles: [],
  isLoading: false,
  error: null,

  createVehicle: async (vehicle) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('vehicles').insert([vehicle]);
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateVehicle: async (id, vehicle) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('vehicles')
        .update(vehicle)
        .eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteVehicle: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('vehicles')
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

  getUserVehicles: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ vehicles: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));