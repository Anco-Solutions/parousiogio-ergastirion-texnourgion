import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

function fetchWithTimeout(input, init = {}) {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 10000)

  if (init.signal) {
    if (init.signal.aborted) controller.abort()
    else init.signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  return fetch(input, { ...init, signal: controller.signal }).finally(() => window.clearTimeout(timer))
}

// Public/data client: never initializes persistent auth storage on startup.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      global: { fetch: fetchWithTimeout },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        lock: async (_name, _acquireTimeout, fn) => await fn(),
      },
    })
  : null

// Authentication client is intentionally separate from the public data client.
// It is created only when the application actually needs administrator auth.
export const authSupabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      global: { fetch: fetchWithTimeout },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        lock: async (_name, _acquireTimeout, fn) => await fn(),
      },
    })
  : null
