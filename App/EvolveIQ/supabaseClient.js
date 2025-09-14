

import { createClient } from 'https://esm.sh/@supabase/supabase-js';

export const supabase = createClient(
    'https://jdgljezoylnigbqymmel.supabase.co', //project url
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZ2xqZXpveWxuaWdicXltbWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNTM2NzQsImV4cCI6MjA2OTkyOTY3NH0.faUHQhrbUP1nWHKrQTxFOCXcDhwfX0XKu7E7hLwsGF0' //anon public key
);