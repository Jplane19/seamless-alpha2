'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/contexts/SupabaseContext'
import { useProjects } from '@/hooks/useProjects'
import { Project, ProjectStatus } from '@/types'

// Status options list from our types
const STATUS_OPTIONS: ProjectStatus[] = [
  'Planning',
  'Permitting',
  'Demo',
  'Foundation',
  'Framing',
  'Mechanical',
  'Electrical',
  'Plumbing',
  'Drywall',
  'Finishing',
  'Landscaping',
  'Punch List',
  'Complete',
]

export default function UpdateProjectStatus({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    status: '',
    update: ''
  })
  
  // Get the project by ID
  useEffect(() => {
    const getProject = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', params.id)
          .single()
          
        if (error) {
          throw error
        }
        
        setProject(data as Project)
        setFormData({
          status: data.status,
          update: ''
        })
      } catch (error) {
        console.error('Error fetching project:', error)
        setError('Could not load project data')
      } finally {
        setLoading(false)
      }
    }
    
    getProject()
  }, [supabase, params.id])
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setError(null)
    setSuccess(false)
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          status: formData.status,
          last_update: formData.update,
          last_update_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', params.id)
        .select()
        
      if (error) {
        throw error
      }
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/projects')
      }, 1500)
    } catch (error: any) {
      console.error('Error updating project status:', error)
      setError(error.message || 'Failed to update project status')
    } finally {
      setUpdating(false)
    }
  }
  
  if (loading) {
    return <div className="text-center py-10">Loading project data...</div>
  }
  
  if (!project) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-red-600 mb-4">Project not found or you don't have access.</p>
        <Link href="/dashboard/projects" className="text-blue-600 hover:underline">
          Return to Projects
        </Link>
      </div>
    )
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Update Project Status</h1>
        <p className="text-gray-600 mt-1">
          {project.name} - {project.address}
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          Project status updated successfully! Redirecting...
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Current Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="update" className="block text-sm font-medium text-gray-700">
                Status Update
              </label>
              <textarea
                id="update"
                name="update"
                rows={4}
                value={formData.update}
                onChange={handleChange}
                placeholder="Provide details about the current status of the project..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              ></textarea>
            </div>
            
            <div className="flex items-center justify-between space-x-3">
              <Link
                href="/dashboard/projects"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={updating || success}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}