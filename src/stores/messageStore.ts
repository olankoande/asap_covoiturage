import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Message } from '../types';

interface MessageState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: Omit<Message, 'id' | 'created_at'>) => Promise<void>;
  getConversation: (userId1: string, userId2: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  sendMessage: async (message) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('messages').insert([message]);
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getConversation: async (userId1, userId2) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(*),
          receiver:profiles!receiver_id(*)
        `)
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      set({ messages: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (messageId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));