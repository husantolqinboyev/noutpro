import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SocialMediaLink } from '@/types/ai';

export const useSocialMediaLinks = () => {
  const [links, setLinks] = useState<SocialMediaLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media_links')
        .select('*')
        .order('platform');

      if (error) {
        console.error('Error fetching social media links:', error);
        return;
      }

      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching social media links:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLink = async (platform: 'telegram' | 'instagram' | 'youtube', url: string) => {
    try {
      const { data, error } = await supabase
        .from('social_media_links')
        .insert({
          platform,
          url,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding social media link:', error);
        return false;
      }

      setLinks(prev => [...prev, data]);
      return true;
    } catch (error) {
      console.error('Error adding social media link:', error);
      return false;
    }
  };

  const updateLink = async (id: string, url: string, isActive: boolean) => {
    try {
      const { data, error } = await supabase
        .from('social_media_links')
        .update({
          url,
          is_active: isActive
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating social media link:', error);
        return false;
      }

      setLinks(prev => prev.map(link => 
        link.id === id ? { ...data } : link
      ));
      return true;
    } catch (error) {
      console.error('Error updating social media link:', error);
      return false;
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('social_media_links')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting social media link:', error);
        return false;
      }

      setLinks(prev => prev.filter(link => link.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting social media link:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  return {
    links,
    loading,
    addLink,
    updateLink,
    deleteLink,
    refreshLinks: fetchLinks
  };
};
