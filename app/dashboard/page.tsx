'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Project = {
  id: string
  name: string
  address: string
  status: string
  last_update: string
  last_update_date: string
  start_date: string
  end_date: string
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // In a real implementation, you would fetch the user's role from Supabase
        // and then fetch projects based on their role
        const { data: { user } } = await supabase.auth.getUser()
        
        // For now, we'll use a mock role
        const mockRole = 'client' // or 'coordinator'
        setUserRole(mockRole)
        
        // Mock projects data for demonstration
        const mockProjects: Project[] = [
          {
            id: '1',
            name: '123 Main St Renovation',
            address: '123 Main St, Vancouver, BC',
            status: 'Framing',
            last_update: 'Walls up, electrical rough-in started today.',
            last_update_date: '2024-07-25',
            start_date: '2024-06-15',
            end_date: '2024-09-30'
          },
          {
            id: '2',
            name: '456 Oak Ave New Build',
            address: '456 Oak Ave, Vancouver, BC',
            status: 'Foundation',
            last_update: 'Foundation poured, curing for 7 days.',
            last_update_date: '2024-07-24',
            start_date: '2024-07-01',
            end_date: '2024-12-15'
          },
          {
            id: '3',
            name: '789 Pine St Remodel',
            address: '789 Pine St, Vancouver, BC',
            status: 'Planning',
            last_update: 'Permit application submitted, awaiting approval.',
            last_update_date: '2024-07-26',
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {userRole === 'coordinator' ? 'All Projects' : 'Your Projects'}
        </h1>
        <p className="text-gray-600 mt-1">
          {userRole === 'coordinator' 
            ? 'Overview of all active projects' 
            : 'Current status of your active projects'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h2>
              <p className="text-gray-600 mb-4">{project.address}</p>
              
              <div className="flex items-center mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className="text-gray-500 text-sm ml-2">
                  Updated: {project.last_update_date}
                </span>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Latest Update</h3>
                <p className="text-gray-600 text-sm">{project.last_update}</p>
              </div>
              
              <div className="flex justify-between text-sm text-gray-500">
                <div>Start: {project.start_date}</div>
                <div>Est. End: {project.end_date}</div>
              </div>
              
              {userRole === 'coordinator' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
                    Update Status
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}