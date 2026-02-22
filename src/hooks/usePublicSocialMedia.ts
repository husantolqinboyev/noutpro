import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SocialMediaLink } from '@/types/ai';

export const usePublicSocialMedia = () => {
  const [links, setLinks] = useState<SocialMediaLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media_links')
        .select('*')
        .eq('is_active', true)
        .order('platform');

      if (error) {
        console.error('Error fetching active social media links:', error);
        return;
      }

      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching active social media links:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveLinks();
  }, []);

  return {
    links,
    loading,
    refreshLinks: fetchActiveLinks
  };
};
