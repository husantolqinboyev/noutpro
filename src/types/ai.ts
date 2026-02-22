export interface AIUsage {
  userId: string;
  date: string;
  count: number;
}

export interface UserState {
  userId: string;
  mood: string;
  message: string;
  timestamp: string;
}

export interface SocialMediaLink {
  id: string;
  platform: 'telegram' | 'instagram' | 'youtube';
  url: string;
  isActive: boolean;
}

export interface UserLocation {
  userId: string;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
}

export interface ShopSettings {
  id: string;
  phone: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  updated_at: string;
}
