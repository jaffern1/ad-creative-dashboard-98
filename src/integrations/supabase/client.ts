import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uohxbqotntxosvfcnfnt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvaHhicW90bnR4b3N2ZmNuZm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjA3MTEsImV4cCI6MjA2NDc5NjcxMX0.HBpzwOVfGqNUQjMo3jxo2KeaXHlZpe83GL94NmhcJI8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);