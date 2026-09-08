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
        detectSessionInUrl: false,
        lock: async (_name, _acquireTimeout, fn) => await fn(),
      },
    })
  : null

if (client) {
  const originalGetSession = client.auth.getSession.bind(client.auth)
  client.auth.getSession = async () => {
    const timeout = new Promise((resolve) => {
      window.setTimeout(() => resolve({ data: { session: null }, error: null }), 4000)
    })
    return Promise.race([originalGetSession(), timeout])
  }
}

export const supabase = client
