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
 * Submit account application (public sign-up)
 * Creates pending application for admin review.
 * 
 * Checks for existing pending applications first to give user-friendly errors.
 * Database has partial unique indexes on (kvk, vat, email) WHERE status='pending'
 * as a safety net.
 */
export async function submitApplication(data: ApplicationData) {
  // Pre-check: does a pending application already exist?
  const { data: existing, error: checkError } = await supabase
    .from('account_applications')
    .select('id, kvk_number, vat_number, contact_email')
    .eq('status', 'pending')
    .or(
      `kvk_number.eq.${data.kvk_number},` +
      `vat_number.eq.${data.vat_number},` +
      `contact_email.eq.${data.contact_email}`
    )
    .maybeSingle()

  if (checkError) {
    // Log but continue - DB constraint will catch it anyway
    console.error('Error checking existing applications:', checkError)
  }

  if (existing) {
    // Give specific error based on which field matches
    if (existing.kvk_number === data.kvk_number) {
      throw new Error(
        'Er is al een aanvraag met dit KVK nummer in behandeling. ' +
        'Neem contact op met support als je vragen hebt.'
      )
    }
    if (existing.vat_number === data.vat_number) {
      throw new Error(
        'Er is al een aanvraag met dit BTW nummer in behandeling. ' +
        'Neem contact op met support als je vragen hebt.'
      )
    }
    if (existing.contact_email === data.contact_email) {
      throw new Error(
        'Er is al een aanvraag met dit email adres in behandeling. ' +
        'Check je inbox voor eerdere correspondentie.'
      )
    }
  }

  // Insert new application
  const { data: application, error } = await supabase
    .from('account_applications')
    .insert({
      ...data,
      terms_accepted_at: new Date().toISOString(),
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    // Database unique constraint violation (safety net)
    if (error.code === '23505') {
      throw new Error(
        'Er is al een aanvraag met deze gegevens in behandeling.'
      )
    }
    // Check constraint violation (bv. ongeldig KVK format)
    if (error.code === '23514') {
      throw new Error(
        'Ongeldige gegevens. Controleer KVK en BTW formaat.'
      )
    }
    console.error('Submit application error:', error)
    throw new Error(error.message || 'Er ging iets mis bij het verzenden.')
  }

  return application
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