'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/contexts/SupabaseContext'
import { User } from '@/types'

export function useUserProfile() {
  const { supabase, user } = useSupabase()
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Query the profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          
        if (error) {
          throw error
        }
        
        setProfile(data as User)
      } catch (error) {
        console.error('Error fetching user profile:', error)
        setError(error as Error)
        
        // If no profile exists, create a basic one
        if ((error as any).code === 'PGRST116') {
          try {
            const newProfile = {
              id: user.id,
              email: user.email || '',
              role: 'client' // Default role
            }
            
            const { data, error: insertError } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              
            if (insertError) {
              throw insertError
            }
            
            setProfile(data[0] as User)
            setError(null)
          } catch (insertError) {
            console.error('Error creating user profile:', insertError)
            setError(insertError as Error)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase, user])

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      throw new Error('No authenticated user')
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        
      if (error) {
        throw error
      }
      
      setProfile(prev => prev ? { ...prev, ...updates } as User : null)
      
      return data[0]
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile
  }
}