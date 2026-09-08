import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

const client = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
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
