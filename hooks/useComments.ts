'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/contexts/SupabaseContext'
import { Comment, CommentWithUser } from '@/types/supabase'

export function useComments(projectId: string) {
  const { supabase, user } = useSupabase()
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            user:user_id(*)
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          
        if (error) {
          throw error
        }
        
        setComments(data as CommentWithUser[])
      } catch (error) {
        console.error('Error fetching comments:', error)
        setError(error as Error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user && projectId) {
      fetchComments()
    }
  }, [supabase, user, projectId])

  // Set up real-time subscription for comments
  useEffect(() => {
    if (!user || !projectId) return
    
    const channel = supabase
      .channel(`comments:${projectId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'comments',
          filter: `project_id=eq.${projectId}`
        }, 
        async (payload) => {
          // When a new comment is added, we need to fetch the user details
          if (payload.eventType === 'INSERT') {
            const newComment = payload.new as Comment
            
            // Fetch user details
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newComment.user_id)
              .single()
              
            if (!userError && userData) {
              const commentWithUser = {
                ...newComment,
                user: userData
              } as CommentWithUser
              
              setComments(prev => [commentWithUser, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedComment = payload.new as Comment
            setComments(prev => 
              prev.map(comment => 
                comment.id === updatedComment.id 
                  ? { ...comment, ...updatedComment } 
                  : comment
              )
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedComment = payload.old as Comment
            setComments(prev => 
              prev.filter(comment => comment.id !== deletedComment.id)
            )
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user, projectId])

  const addComment = async (text: string, isInternal: boolean = false) => {
    if (!user) {
      throw new Error('User must be authenticated to add a comment')
    }
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          project_id: projectId,
          user_id: user.id,
          text,
          is_internal: isInternal
        })
        .select()
        
      if (error) {
        throw error
      }
      
      return data[0] as Comment
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  }
  
  const updateComment = async (id: string, text: string) => {
    if (!user) {
      throw new Error('User must be authenticated to update a comment')
    }
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({ text })
        .eq('id', id)
        .eq('user_id', user.id) // Only allow updating own comments
        .select()
        
      if (error) {
        throw error
      }
      
      return data[0] as Comment
    } catch (error) {
      console.error('Error updating comment:', error)
      throw error
    }
  }
  
  const deleteComment = async (id: string) => {
    if (!user) {
      throw new Error('User must be authenticated to delete a comment')
    }
    
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // Only allow deleting own comments
        
      if (error) {
        throw error
      }
      
      return true
    } catch (error) {
      console.error('Error deleting comment:', error)
      throw error
    }
  }

  return {
    comments,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment
  }
}