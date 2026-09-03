import { createClient } from '@supabase/supabase-js'

// The Supabase publishable key is intentionally safe for browser applications.
// Environment variables can override these values for local/deployed builds.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nedgozguqjbhwfevuhqs.supabase.co'
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_AeFMXd_B8cqsA0A3SD3lwA_JYfX7WjP'

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null
