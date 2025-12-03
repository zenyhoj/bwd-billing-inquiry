import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dblqpxsowpgprgzoeboc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRibHFweHNvd3BncHJnem9lYm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MTc0MjYsImV4cCI6MjA4MDI5MzQyNn0.l9feRAgv7hSRH9sRC4yCe_elPAlZNmY5LkQf5jpwCUc';

export const supabase = createClient(supabaseUrl, supabaseKey);