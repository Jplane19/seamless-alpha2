'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/contexts/SupabaseContext'
import { ClientCompany } from '@/types/supabase'

export function useClientCompanies() {
  const { supabase, user } = useSupabase()
  const [companies, setCompanies] = useState<ClientCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('client_companies')
          .select('*')
          .eq('is_active', true)
          .order('name')
          
        if (error) {
          throw error
        }
        
        setCompanies(data as ClientCompany[])
      } catch (error) {
        console.error('Error fetching client companies:', error)
        setError(error as Error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      fetchCompanies()
    }
  }, [supabase, user])

  const addCompany = async (company: Omit<ClientCompany, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('client_companies')
        .insert(company)
        .select()
        
      if (error) {
        throw error
      }
      
      setCompanies(prev => [...prev, data[0] as ClientCompany])
      
      return data[0] as ClientCompany
    } catch (error) {
      console.error('Error adding client company:', error)
      throw error
    }
  }
  
  const updateCompany = async (id: string, updates: Partial<ClientCompany>) => {
    try {
      const { data, error } = await supabase
        .from('client_companies')
        .update(updates)
        .eq('id', id)
        .select()
        
      if (error) {
        throw error
      }
      
      setCompanies(prev => 
        prev.map(company => 
          company.id === id ? { ...company, ...updates } as ClientCompany : company
        )
      )
      
      return data[0] as ClientCompany
    } catch (error) {
      console.error('Error updating client company:', error)
      throw error
    }
  }
  
  const archiveCompany = async (id: string) => {
    return updateCompany(id, { is_active: false })
  }
  
  const getCompanyWithContacts = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('client_companies')
        .select(`
          *,
          contacts:client_contacts(*)
        `)
        .eq('id', id)
        .single()
        
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Error fetching client company with contacts:', error)
      throw error
    }
  }

  return {
    companies,
    loading,
    error,
    addCompany,
    updateCompany,
    archiveCompany,
    getCompanyWithContacts
  }
}