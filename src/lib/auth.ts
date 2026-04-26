import { redirect } from '@tanstack/react-router'
import { supabase } from './supabase'
import type { Database } from './database.types'

// Types
export type UserRole = 'agency_admin' | 'client' | 'public'

export type UserProfile = Database['public']['Tables']['users']['Row'] & {
  organization?: Database['public']['Tables']['organizations']['Row'] | null
}

// ============================================
// AUTH STATE
// ============================================

export async function getAuthUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const authUser = await getAuthUser()
  if (!authUser) return null

  const { data, error } = await supabase
    .from('users')
    .select('*, organization:organizations(*)')
    .eq('id', authUser.id)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data as UserProfile
}

export async function getCurrentRole(): Promise<UserRole> {
  const profile = await getUserProfile()
  if (!profile) return 'public'
  return profile.role as UserRole
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthUser()
  return user !== null
}

export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentRole()
  return role === 'agency_admin'
}

export async function isClient(): Promise<boolean> {
  const role = await getCurrentRole()
  return role === 'client'
}

// ============================================
// AUTH ACTIONS
// ============================================

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  window.location.href = '/login'
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/set-password`,
  })
  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  if (error) throw error
}

// ============================================
// ROUTE GUARDS
// ============================================

export async function requireRole(requiredRole: UserRole) {
  const currentRole = await getCurrentRole()

  if (requiredRole === 'public') return

  if (currentRole !== requiredRole) {
    throw redirect({
      to: '/login',
      search: { redirect: window.location.pathname },
    })
  }
}

export async function requireAuth() {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    throw redirect({
      to: '/login',
      search: { redirect: window.location.pathname },
    })
  }
}

export async function redirectByRole() {
  const role = await getCurrentRole()

  switch (role) {
    case 'agency_admin':
      throw redirect({ to: '/agency/dashboard' })
    case 'client':
      throw redirect({ to: '/portal/dashboard' })
    default:
      throw redirect({ to: '/login' })
  }
}

// ============================================
// SIGN-UP HELPERS
// ============================================

type ApplicationData = {
  company_name: string
  kvk_number: string
  vat_number: string
  iban?: string
  contact_name: string
  contact_email: string
  contact_phone: string
  terms_accepted_version: string
}

/**
 * Submit account application (public sign-up).
 * 
 * IMPORTANT: This is called by ANONYMOUS users (not logged in).
 * Anonymous users can ONLY INSERT on account_applications (no SELECT).
 * That's why we skip the duplicate pre-check - the database unique
 * indexes will catch duplicates and return a specific error code.
 */
export async function submitApplication(data: ApplicationData) {
  // Insert new application
  // NOTE: We don't call .select() because anon users can't SELECT
  // We also don't pre-check for duplicates for the same reason
  // The database partial unique indexes will catch duplicates
  const { error } = await supabase
    .from('account_applications')
    .insert({
      ...data,
      terms_accepted_at: new Date().toISOString(),
      status: 'pending',
    })

  if (error) {
    console.error('Submit application error:', error)

    // Database unique constraint violation - duplicate pending application
    if (error.code === '23505') {
      // Determine which field conflicted based on error message
      const msg = error.message.toLowerCase()
      
      if (msg.includes('kvk')) {
        throw new Error(
          'Er is al een aanvraag met dit KVK nummer in behandeling. ' +
          'Neem contact op met support als je vragen hebt.'
        )
      }
      if (msg.includes('vat')) {
        throw new Error(
          'Er is al een aanvraag met dit BTW nummer in behandeling. ' +
          'Neem contact op met support als je vragen hebt.'
        )
      }
      if (msg.includes('email')) {
        throw new Error(
          'Er is al een aanvraag met dit email adres in behandeling. ' +
          'Check je inbox voor eerdere correspondentie.'
        )
      }
      
      // Generic duplicate error
      throw new Error(
        'Er is al een aanvraag met deze gegevens in behandeling.'
      )
    }

    // Check constraint violation (e.g., invalid KVK format)
    if (error.code === '23514') {
      throw new Error(
        'Ongeldige gegevens. Controleer KVK en BTW formaat.'
      )
    }

    // RLS policy violation
    if (error.code === '42501') {
      throw new Error(
        'Toegang geweigerd. Probeer de pagina te vernieuwen en opnieuw in te dienen.'
      )
    }

    // Generic error
    throw new Error(error.message || 'Er ging iets mis bij het verzenden.')
  }

  // Success - return success indicator
  // We can't return the created row because we can't SELECT it as anon
  return { success: true }
}

// ============================================
// AUTH STATE LISTENER
// ============================================

export function onAuthChange(callback: (isAuthenticated: boolean) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session !== null)
    }
  )

  return () => subscription.unsubscribe()
}