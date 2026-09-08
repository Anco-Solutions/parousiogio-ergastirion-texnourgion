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

const client = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      global: {
        fetch: fetchWithTimeout,
      },
      auth: {
        // Avoid Safari persistent-storage initialization during app startup.
        // Admin authentication remains available for the current browser session.
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        lock: async (_name, _acquireTimeout, fn) => await fn(),
      },
    })
  : null

export const supabase = client
