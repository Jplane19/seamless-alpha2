'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/contexts/SupabaseContext'
import { Project } from '@/types'

interface UseProjectsOptions {
  clientId?: string
  onlyActive?: boolean
}

export function useProjects(options: UseProjectsOptions = {}) {
  const { supabase, user } = useSupabase()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        
        let query = supabase.from('projects').select('*')
        
        // Filter by client if clientId is provided or use current user's ID if they are a client
        if (options.clientId) {
          query = query.eq('client_id', options.clientId)
        } else if (user?.id) {
          // You would need to check the user's role here
          // This assumes you have a user_roles table or metadata
          const { data: userData } = await supabase
            .from('user_metadata')
            .select('role')
            .eq('user_id', user.id)
            .single()
            
          // If user is a client, only show their projects
          if (userData?.role === 'client') {
            query = query.eq('client_id', user.id)
          }
        }
        
        // Filter for active projects if requested
        if (options.onlyActive) {
          query = query.neq('status', 'Complete')
        }
        
        // Order by recent update
        query = query.order('last_update_date', { ascending: false })
        
        const { data, error } = await query
        
        if (error) {
          throw error
        }
        
        setProjects(data as Project[])
      } catch (error) {
        console.error('Error fetching projects:', error)
        setError(error as Error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      fetchProjects()
    }
  }, [supabase, user, options.clientId, options.onlyActive])

  const addProject = async (newProject: Omit<Project, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...newProject,
          last_update_date: new Date().toISOString().split('T')[0]
        })
        .select()
        
      if (error) {
        throw error
      }
      
      // Update local state
      setProjects(prev => [...prev, data[0] as Project])
      
      return data[0]
    } catch (error) {
      console.error('Error adding project:', error)
      throw error
    }
  }
  
  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          last_update_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id)
        .select()
        
      if (error) {
        throw error
      }
      
      // Update local state
      setProjects(prev => 
        prev.map(project => 
          project.id === id ? { ...project, ...updates } as Project : project
        )
      )
      
      return data[0]
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  }
  
  const updateProjectStatus = async (id: string, status: string, statusUpdate: string) => {
    return updateProject(id, { 
      status: status as any, 
      last_update: statusUpdate
    })
  }

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    updateProjectStatus
  }
}