'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/contexts/SupabaseContext'
import { ClientContact } from '@/types/supabase'

interface UseClientContactsOptions {
  companyId?: string
  includingInactive?: boolean
}

export function useClientContacts(options: UseClientContactsOptions = {}) {
  const { supabase, user } = useSupabase()
  const [contacts, setContacts] = useState<ClientContact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true)
        
        let query = supabase.from('client_contacts').select('*')
        
        // Filter by company if provided
        if (options.companyId) {
          query = query.eq('company_id', options.companyId)
        }
        
        // Filter for active contacts unless specifically requested
        if (!options.includingInactive) {
          query = query.eq('is_active', true)
        }
        
        // Order by primary contacts first, then by name
        query = query.order('is_primary', { ascending: false }).order('last_name')
        
        const { data, error } = await query
        
        if (error) {
          throw error
        }
        
        setContacts(data as ClientContact[])
      } catch (error) {
        console.error('Error fetching client contacts:', error)
        setError(error as Error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      fetchContacts()
    }
  }, [supabase, user, options.companyId, options.includingInactive])

  const addContact = async (contact: Omit<ClientContact, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // If this is a primary contact, we need to unset any existing primary contacts for this company
      if (contact.is_primary) {
        await supabase
          .from('client_contacts')
          .update({ is_primary: false })
          .eq('company_id', contact.company_id)
          .eq('is_primary', true)
      }
      
      const { data, error } = await supabase
        .from('client_contacts')
        .insert(contact)
        .select()
        
      if (error) {
        throw error
      }
      
      setContacts(prev => [...prev, data[0] as ClientContact])
      
      return data[0] as ClientContact
    } catch (error) {
      console.error('Error adding client contact:', error)
      throw error
    }
  }
  
  const updateContact = async (id: string, updates: Partial<ClientContact>) => {
    try {
      // Handle updating primary contact
      if (updates.is_primary === true) {
        const { data: contactData } = await supabase
          .from('client_contacts')
          .select('company_id')
          .eq('id', id)
          .single()
          
        if (contactData) {
          await supabase
            .from('client_contacts')
            .update({ is_primary: false })
            .eq('company_id', contactData.company_id)
            .eq('is_primary', true)
        }
      }
      
      const { data, error } = await supabase
        .from('client_contacts')
        .update(updates)
        .eq('id', id)
        .select()
        
      if (error) {
        throw error
      }
      
      setContacts(prev => 
        prev.map(contact => 
          contact.id === id ? { ...contact, ...updates } as ClientContact : contact
        )
      )
      
      return data[0] as ClientContact
    } catch (error) {
      console.error('Error updating client contact:', error)
      throw error
    }
  }
  
  const archiveContact = async (id: string) => {
    return updateContact(id, { is_active: false })
  }
  
  // Link an existing auth user to a contact
  const linkContactToUser = async (contactId: string, profileId: string) => {
    return updateContact(contactId, { profile_id: profileId })
  }

  return {
    contacts,
    loading,
    error,
    addContact,
    updateContact,
    archiveContact,
    linkContactToUser
  }
}