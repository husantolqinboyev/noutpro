import Groq from 'groq-sdk';
import { supabase } from './supabase';

// Note: Groq client should ideally only be used serverside or via Edge Functions.
// For browser usage, we use the Edge Function proxy below.
const createGroqClient = async () => {
  throw new Error('Direct Groq SDK usage is disabled for security. Use getGroqResponse instead.');
};

// For client-side usage, we'll use a proxy through Supabase Edge Function
export const getGroqResponse = async (messages: Array<{ role: string; content: string }>) => {
  try {
    const { data, error } = await supabase.functions.invoke('groq-chat', {
      body: { messages }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting Groq response:', error);
    throw error;
  }
};

export default createGroqClient;
