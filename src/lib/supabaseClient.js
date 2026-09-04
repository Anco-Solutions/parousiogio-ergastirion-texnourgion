import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null

// Never let the initial authentication check leave the whole application
// stuck on the loading screen if the Auth endpoint/storage is temporarily slow.
if (supabase) {
  const originalGetSession = supabase.auth.getSession.bind(supabase.auth)
  supabase.auth.getSession = async (...args) => {
    const timeout = new Promise((resolve) => {
      window.setTimeout(() => resolve({ data: { session: null }, error: new Error('Ο έλεγχος σύνδεσης καθυστέρησε.') }), 5000)
    })
    return Promise.race([originalGetSession(...args), timeout])
  }
}
