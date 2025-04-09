'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/contexts/SupabaseContext'
import { Document, DocumentWithUser, DocumentCategory } from '@/types/supabase'

interface UseDocumentsOptions {
  category?: DocumentCategory
  includeInternal?: boolean
}

export function useDocuments(projectId: string, options: UseDocumentsOptions = {}) {
  const { supabase, user } = useSupabase()
  const [documents, setDocuments] = useState<DocumentWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true)
        
        let query = supabase
          .from('documents')
          .select(`
            *,
            uploader:uploaded_by(*)
          `)
          .eq('project_id', projectId)
        
        // Filter by category if provided
        if (options.category) {
          query = query.eq('category', options.category)
        }
        
        // Exclude internal documents for clients unless specifically requested
        if (!options.includeInternal) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user?.id || '')
            .single()
            
          if (profile?.role === 'client') {
            query = query.eq('is_internal', false)
          }
        }
        
        // Order by most recently uploaded
        query = query.order('created_at', { ascending: false })
        
        const { data, error } = await query
        
        if (error) {
          throw error
        }
        
        setDocuments(data as DocumentWithUser[])
      } catch (error) {
        console.error('Error fetching documents:', error)
        setError(error as Error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user && projectId) {
      fetchDocuments()
    }
  }, [supabase, user, projectId, options.category, options.includeInternal])

  // Set up real-time subscription for documents
  useEffect(() => {
    if (!user || !projectId) return
    
    const channel = supabase
      .channel(`documents:${projectId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'documents',
          filter: `project_id=eq.${projectId}`
        }, 
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newDocument = payload.new as Document
            
            // Check if we should add this document based on internal status
            if (!options.includeInternal && newDocument.is_internal) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()
                
              if (profile?.role === 'client') {
                return // Don't add internal documents for clients
              }
            }
            
            // Fetch uploader details
            let uploader = null
            if (newDocument.uploaded_by) {
              const { data: uploaderData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', newDocument.uploaded_by)
                .single()
                
              uploader = uploaderData
            }
            
            const documentWithUser = {
              ...newDocument,
              uploader
            } as DocumentWithUser
            
            setDocuments(prev => [documentWithUser, ...prev])
          } else if (payload.eventType === 'DELETE') {
            const deletedDocument = payload.old as Document
            setDocuments(prev => 
              prev.filter(doc => doc.id !== deletedDocument.id)
            )
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user, projectId, options.includeInternal])

  // Upload a document
  const uploadDocument = async (
    file: File, 
    name: string, 
    category: DocumentCategory, 
    description?: string, 
    isInternal: boolean = false
  ) => {
    if (!user) {
      throw new Error('User must be authenticated to upload a document')
    }
    
    try {
      // 1. Upload the file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const filePath = `${projectId}/${Date.now()}_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('documents')
        .upload(filePath, file)
        
      if (uploadError) {
        throw uploadError
      }
      
      // 2. Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('documents')
        .getPublicUrl(filePath)
      
      // 3. Create document record in the database
      const { data, error } = await supabase
        .from('documents')
        .insert({
          project_id: projectId,
          name,
          file_path: publicUrl,
          file_type: file.type,
          file_size: file.size,
          category,
          description,
          is_internal: isInternal,
          uploaded_by: user.id
        })
        .select()
        
      if (error) {
        throw error
      }
      
      return data[0] as Document
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    }
  }
  
  // Delete a document
  const deleteDocument = async (id: string) => {
    try {
      // First get the document to get the file path
      const { data: document, error: getError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', id)
        .single()
        
      if (getError) {
        throw getError
      }
      
      // Extract the storage file path from the public URL
      const filePath = document.file_path.split('/').pop()
      
      // Delete the file from storage
      const { error: storageError } = await supabase
        .storage
        .from('documents')
        .remove([`${projectId}/${filePath}`])
        
      if (storageError) {
        console.error('Error deleting file from storage:', storageError)
        // Continue anyway to delete the database record
      }
      
      // Delete the database record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        
      if (error) {
        throw error
      }
      
      return true
    } catch (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  }

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument
  }
}