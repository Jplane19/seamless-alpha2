'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/contexts/SupabaseContext'
import { Project, ProjectWithRelations } from '@/types/supabase'

interface UseProjectsOptions {
  clientCompanyId?: string
  onlyActive?: boolean
  withRelations?: boolean
}

export function useProjects(options: UseProjectsOptions = {}) {
  const { supabase, user } = useSupabase()
  const [projects, setProjects] = useState<Project[] | ProjectWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        
        // Determine the query based on whether we need relations
        let query = options.withRelations
          ? supabase
              .from('projects')
              .select(`
                *,
                client_company:client_company_id(*),
                primary_contact:primary_contact_id(*),
                created_by_user:created_by(*),
                phases:project_phases(*)
              `)
          : supabase.from('projects').select('*')
        
        // Filter by client company if provided
        if (options.clientCompanyId) {
          query = query.eq('client_company_id', options.clientCompanyId)
        } else if (user?.id) {
          // Check user's role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
            
          // If user is a client contact, only show their company's projects
          if (profile?.role === 'client') {
            // Get client contact info
            const { data: clientContact } = await supabase
              .from('client_contacts')
              .select('company_id')
              .eq('profile_id', user.id)
              .single()
              
            if (clientContact) {
              query = query.eq('client_company_id', clientContact.company_id)
            }
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
        
        if (options.withRelations) {
          setProjects(data as ProjectWithRelations[])
        } else {
          setProjects(data as Project[])
        }
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
  }, [supabase, user, options.clientCompanyId, options.onlyActive, options.withRelations])

  // Set up real-time subscription for projects
  useEffect(() => {
    if (!user) return
    
    // Create channel for real-time updates
    const channel = supabase
      .channel('projects_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects' 
        }, 
        (payload) => {
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            const newProject = payload.new as Project
            setProjects(prev => [newProject, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const updatedProject = payload.new as Project
            setProjects(prev => 
              prev.map(project => 
                project.id === updatedProject.id 
                  ? { ...project, ...updatedProject } 
                  : project
              )
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedProject = payload.old as Project
            setProjects(prev => 
              prev.filter(project => project.id !== deletedProject.id)
            )
          }
        }
      )
      .subscribe()
    
    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user])

  const addProject = async (newProject: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...newProject,
          created_by: user?.id,
          last_update_date: new Date().toISOString().split('T')[0]
        })
        .select()
        
      if (error) {
        throw error
      }
      
      return data[0] as Project
    } catch (error) {
      console.error('Error adding project:', error)
      throw error
    }
  }
  
  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      // If updating status or last_update, update last_update_date as well
      const updatedFields = updates.status || updates.last_update
        ? { 
            ...updates, 
            last_update_date: new Date().toISOString().split('T')[0] 
          }
        : updates
        
      const { data, error } = await supabase
        .from('projects')
        .update(updatedFields)
        .eq('id', id)
        .select()
        
      if (error) {
        throw error
      }
      
      return data[0] as Project
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

  const getProjectStatusHistory = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_status_history')
        .select(`
          *,
          updated_by_user:updated_by(*)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Error fetching project status history:', error)
      throw error
    }
  }

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    updateProjectStatus,
    getProjectStatusHistory
  }
}