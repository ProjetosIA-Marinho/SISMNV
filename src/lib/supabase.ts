import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://obworbfbkhazewtmlbkn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9id29yYmZia2hhemV3dG1sYmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MTM4NjcsImV4cCI6MjEwNjM4OTg2N30.4DwvF2UdR7OH0DiOpn8cnQJ8v5Ie8giHRBgMzUNZ9Kk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
