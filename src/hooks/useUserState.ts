import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserState } from '@/types/ai';

export const useUserState = (userId: string) => {
  const [userState, setUserState] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserState = async () => {
    try {
      const { data, error } = await supabase
        .from('user_states')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user state:', error);
        return;
      }

      if (data) {
        setUserState({
          userId: data.user_id,
          mood: data.mood,
          message: data.message,
          timestamp: data.timestamp
        });
      }
    } catch (error) {
      console.error('Error fetching user state:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserState = async (mood: string, message: string) => {
    try {
      const { error } = await supabase
        .from('user_states')
        .insert({
          user_id: userId,
          mood,
          message,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating user state:', error);
        return false;
      }

      setUserState({
        userId,
        mood,
        message,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error updating user state:', error);
      return false;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserState();
    }
  }, [userId]);

  return {
    userState,
    loading,
    updateUserState,
    refreshState: fetchUserState
  };
};
