import { createClient } from '@supabase/supabase-js';

// No "!" here to prevent crashing during build-time static analysis
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Warn instead of throwing to allow the build to complete
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("⚠️ Supabase environment variables are missing.");
}

// Provide empty strings as fallbacks so createClient doesn't crash the builder
export const supabaseChicken = createClient(
  supabaseUrl || '',
  supabaseServiceRoleKey || ''
);
