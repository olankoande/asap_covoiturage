import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Review } from '../types';

interface ReviewState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  createReview: (review: Omit<Review, 'id' | 'created_at'>) => Promise<void>;
  getUserReviews: (userId: string) => Promise<void>;
}

export const useReviewStore = create<ReviewState>((set) => ({
  reviews: [],
  isLoading: false,
  error: null,

  createReview: async (review) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('reviews').insert([review]);
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getUserReviews: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviewer_id(*),
          reviewed:profiles!reviewed_id(*)
        `)
        .eq('reviewed_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ reviews: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));