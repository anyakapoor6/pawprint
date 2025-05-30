import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://jdflyzjkqcdxkztubdwi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZmx5emprcWNkeGt6dHViZHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1ODI4MzEsImV4cCI6MjA2NDE1ODgzMX0.p0MQpdmiVrpeKMUnW6r7qWIVbxGg9Bz_hYbvyO3XJOI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    enabled: false
  },
  global: {
    headers: {
      'X-Platform': Platform.OS
    }
  }
});