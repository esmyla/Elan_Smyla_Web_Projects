

import { createClient } from 'https://esm.sh/@supabase/supabase-js';

export const supabase = createClient(
    'https://jdgljezoylnigbqymmel.supabase.co', //project url
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2anNtdm9nbHppa25nd3BmcnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTI1OTUsImV4cCI6MjA3MzYyODU5NX0.keIkYl0AhssKhOkVUf7MmDChXsrFDjCLWIsz9-bm0zA' //anon public key
);