'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Project = {
  id: string
  name: string
  address: string
  client: string
  status: string
  start_date: string
  end_date: string
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // In a real implementation, you would fetch the user's role and projects from Supabase
        const { data: { user } } = await supabase.auth.getUser()
        
        // For now, we'll use a mock role - only coordinators should see this page
        const mockRole = 'coordinator'
        setUserRole(mockRole)
        
        // Mock projects data for demonstration
        const mockProjects: Project[] = [
          {
            id: '1',
            name: '123 Main St Renovation',
            address: '123 Main St, Vancouver, BC',
            client: 'John Smith',
            status: 'Framing',
            start_date: '2024-06-15',
            end_date: '2024-09-30'
          },
          {
            id: '2',
            name: '456 Oak Ave New Build',
            address: '456 Oak Ave, Vancouver, BC',
            client: 'Jane Doe',
            status: 'Foundation',
            start_date: '2024-07-01',
            end_date: '2024-12-15'
          },
          {
            id: '3',
            name: '789 Pine St Remodel',
            address: '789 Pine St, Vancouver, BC',
            client: 'John Smith',
            status: 'Planning',
            start_date: '2024-08-10',
            end_date: '2024-11-20'
          }
        ]
        
        setProjects(mockProjects)
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProjects()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planning':
        return 'bg-blue-100 text-blue-800'
      case 'foundation':
        return 'bg-yellow-100 text-yellow-800'
      case 'framing':
        return 'bg-green-100 text-green-800'
      case 'drywall':
        return 'bg-orange-100 text-orange-800'
      case 'finishing':
        return 'bg-purple-100 text-purple-800'
      case 'complete':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading projects...</div>
  }

  // Redirect if not a coordinator
  if (userRole !== 'coordinator') {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-red-600 mb-4">You don't have permission to view this page.</p>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600 mt-1">Manage all DeHyl Construction projects</p>
        </div>
        <Link 
          href="/dashboard/projects/new" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New Project
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timeline
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{project.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{project.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{project.client}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.start_date} to {project.end_date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link 
                    href={`/dashboard/projects/${project.id}`} 
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    View
                  </Link>
                  <Link 
                    href={`/dashboard/projects/${project.id}/edit`} 
                    className="text-green-600 hover:text-green-900 mr-4"
                  >
                    Edit
                  </Link>
                  <button className="text-blue-600 hover:text-blue-900">
                    Update Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}