import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserLocation } from '@/types/ai';

export const useUserLocation = (userId: string) => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz`
      );
      const data = await response.json();
      
      if (data.display_name) {
        return data.display_name;
      }
      
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Error getting address:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const saveLocation = async (latitude: number, longitude: number, address: string) => {
    try {
      const { data, error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: userId,
          latitude,
          longitude,
          address,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving location:', error);
        return null;
      }

      const newLocation: UserLocation = {
        userId: data.user_id,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        timestamp: data.timestamp
      };

      setLocation(newLocation);
      return newLocation;
    } catch (error) {
      console.error('Error saving location:', error);
      return null;
    }
  };

  const updateLocation = async () => {
    try {
      setLoading(true);
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;
      
      const address = await getAddressFromCoordinates(latitude, longitude);
      await saveLocation(latitude, longitude, address);
      
      return { latitude, longitude, address };
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching saved location:', error);
        return;
      }

      if (data) {
        setLocation({
          userId: data.user_id,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address,
          timestamp: data.timestamp
        });
      }
    } catch (error) {
      console.error('Error fetching saved location:', error);
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (mapProvider: 'google' | 'yandex' = 'google') => {
    if (!location) return;

    const { latitude, longitude } = location;
    let mapUrl = '';

    if (mapProvider === 'google') {
      mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    } else if (mapProvider === 'yandex') {
      mapUrl = `https://yandex.uz/maps/?ll=${longitude},${latitude}&z=15`;
    }

    window.open(mapUrl, '_blank');
  };

  useEffect(() => {
    if (userId) {
      fetchSavedLocation();
    }
  }, [userId]);

  return {
    location,
    loading,
    updateLocation,
    openInMaps,
    refreshLocation: fetchSavedLocation
  };
};
