
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qoihvoikodeyhuqvjogt.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvaWh2b2lrb2RleWh1cXZqb2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDE4NzYsImV4cCI6MjA3NzAxNzg3Nn0.J71wfq4oCwpdw7oxcpl8fr_uhge8hSU0QaVP6ZvZYog'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
