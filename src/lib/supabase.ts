import { createClient } from '@supabase/supabase-js';

// Supabase credentials provided by user
const rawUrl = 'https://iydtfudahgyiidqfdqsp.supabase.co/rest/v1/';
// Remove /rest/v1 or trailing slashes to get base project URL
export const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
export const SUPABASE_ANON_KEY = 'sb_publishable_p6IA8D_XCUJJkzC0b9Liwg_d04_znUD';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
