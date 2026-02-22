import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShopSettings } from '@/types/ai';
import { toast } from 'sonner';

export const useShopSettings = () => {
    const [settings, setSettings] = useState<ShopSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await (supabase as any)
                .from('shop_settings')
                .select('*')
                .single();

            if (error) {
                console.error('Error fetching shop settings:', error);
                return;
            }

            setSettings(data as ShopSettings);
        } catch (error) {
            console.error('Error fetching shop settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings: Partial<ShopSettings>) => {
        try {
            const { error } = await (supabase as any)
                .from('shop_settings')
                .update(newSettings)
                .eq('id', settings?.id || '00000000-0000-0000-0000-000000000000');

            if (error) {
                toast.error(error.message);
                return false;
            }

            toast.success("Sozlamalar yangilandi!");
            await fetchSettings();
            return true;
        } catch (error: any) {
            toast.error(error.message);
            return false;
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return {
        settings,
        loading,
        updateSettings,
        refreshSettings: fetchSettings
    };
};
