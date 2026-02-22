import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AIUsage } from '@/types/ai';

export const useAIUsage = (userId: string) => {
  const [usage, setUsage] = useState<AIUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUsage = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('ai_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking AI usage:', error);
        return;
      }

      if (data) {
        setUsage({
          userId: data.user_id,
          date: data.date,
          count: data.count
        });
      } else {
        setUsage({
          userId,
          date: today,
          count: 0
        });
      }
    } catch (error) {
      console.error('Error checking AI usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (usage && usage.count >= 5) {
        return false;
      }

      const newCount = usage ? usage.count + 1 : 1;

      const { error } = await supabase
        .from('ai_usage')
        .upsert({
          user_id: userId,
          date: today,
          count: newCount
        });

      if (error) {
        console.error('Error incrementing AI usage:', error);
        return false;
      }

      setUsage(prev => prev ? { ...prev, count: newCount } : {
        userId,
        date: today,
        count: newCount
      });

      return true;
    } catch (error) {
      console.error('Error incrementing AI usage:', error);
      return false;
    }
  };

  useEffect(() => {
    if (userId) {
      checkUsage();
    }
  }, [userId]);

  return {
    usage,
    loading,
    canUseAI: usage ? usage.count < 5 : true,
    remainingUses: usage ? Math.max(0, 5 - usage.count) : 5,
    incrementUsage,
    refreshUsage: checkUsage
  };
};
