import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSupabaseErrorHandler = () => {
  useEffect(() => {
    // Handle Supabase auth errors
    const handleAuthError = (error: any) => {
      console.error('Supabase Auth Error:', error);
      
      if (error.message?.includes('Failed to fetch')) {
        toast.error('Server bilan aloqada xatolik. Iltimos, internet aloqangizni tekshiring.');
      } else if (error.message?.includes('Invalid login credentials')) {
        toast.error('Login yoki parol noto\'g\'ri.');
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error('Email tasdiqlanmagan. Iltimos, emailingizni tekshiring.');
      } else if (error.message?.includes('Too many requests')) {
        toast.error('Juda ko\'p urinishlar. Iltimos, biroz kuting.');
      } else {
        toast.error('Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
      }
    };

    // Test connection on mount
    const testConnection = async () => {
      try {
        const { error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
          handleAuthError(error);
        }
      } catch (error) {
        handleAuthError(error);
      }
    };

    testConnection();
  }, []);
};

export default useSupabaseErrorHandler;
