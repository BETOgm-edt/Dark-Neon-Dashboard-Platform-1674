import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kektsurmhnxtibpkuzec.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtla3RzdXJtaG54dGlicGt1emVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTE3MTMsImV4cCI6MjA2ODcyNzcxM30.IPWUDaIk_ZTYHwCtMZpbxwpqGu-KjExr5f0YEfPl2gI'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

export default supabase