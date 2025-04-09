'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/contexts/SupabaseContext'
import { useProjects } from '@/hooks/useProjects'
import { ProjectStatus } from '@/types'

// Status options from our types
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
  'Complete'
]

type Client = {
  id: string
  email: string
  role: string
}

export default function NewProject() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { addProject } = useProjects()
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    clientId: '',
    status: 'Planning' as ProjectStatus,
    startDate: '',
    endDate: '',
    initialUpdate: ''
  })

  // Fetch clients with the client role
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoadingClients(true)
        // In a real app, you'd fetch clients from profiles table where role = 'client'
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'client')
          
        if (error) {
          throw error
        }
        
        setClients(data as Client[])
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setLoadingClients(false)
      }
    }
    
    fetchClients()
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      await addProject({
        name: formData.name,
        address: formData.address,
        client_id: formData.clientId,
        status: formData.status,
        start_date: formData.startDate,
        end_date: formData.endDate,
        last_update: formData.initialUpdate,
        last_update_date: new Date().toISOString().split('T')[0]
      })
      
      // Navigate back to the projects list
      router.push('/dashboard/projects')
    } catch (error: any) {
      setError(error.message || 'An error occurred while creating the project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-gray-600 mt-1">Add a new construction project to the system</p>
      </div>
      
      {error && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Project Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                Client
              </label>
              <select
                id="clientId"
                name="clientId"
                required
                value={formData.clientId}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a client</option>
                {loadingClients ? (
                  <option value="">Loading clients...</option>
                ) : clients.length === 0 ? (
                  <option value="">No clients available</option>
                ) : clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.email}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Initial Status
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Estimated Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                Estimated End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="col-span-2">
              <label htmlFor="initialUpdate" className="block text-sm font-medium text-gray-700">
                Initial Status Update
              </label>
              <textarea
                id="initialUpdate"
                name="initialUpdate"
                rows={3}
                required
                value={formData.initialUpdate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the initial status update for this project..."
              ></textarea>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-end space-x-3">
            <Link
              href="/dashboard/projects"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}