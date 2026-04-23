import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check your .env file.'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Helper to check if user is authenticated
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) return null
  return user
}

// Helper to get user profile with role
export async function getCurrentUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*, organization:organizations(*)')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

// Helper to sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
