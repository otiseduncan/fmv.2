import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://nnogzhjvaxtqjbintmhv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ub2d6aGp2YXh0cWpiaW50bWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTc2NDAsImV4cCI6MjA3NTM5MzY0MH0.7yeF5blg1FE37f7m4Jt49Vk74WEr-l2xtkgoOwlmyTE';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };