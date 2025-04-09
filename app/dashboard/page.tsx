'use client'

import { useState } from 'react'
import { useSupabase } from '@/contexts/SupabaseContext'
import { useProjects } from '@/hooks/useProjects'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Project } from '@/types'
import Link from 'next/link'

export default function Dashboard() {
  const { user } = useSupabase()
  const { profile, loading: profileLoading } = useUserProfile()
  const { projects, loading: projectsLoading, updateProjectStatus } = useProjects({ onlyActive: true })
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  const loading = profileLoading || projectsLoading

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
          {profile?.role === 'coordinator' ? 'All Projects' : 'Your Projects'}
        </h1>
        <p className="text-gray-600 mt-1">
          {profile?.role === 'coordinator' 
            ? 'Overview of all active projects' 
            : 'Current status of your active projects'}
        </p>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600 mb-4">No active projects found.</p>
          {profile?.role === 'coordinator' && (
            <Link 
              href="/dashboard/projects/new" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create New Project
            </Link>
          )}
        </div>
      ) : (
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
                
                {profile?.role === 'coordinator' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link 
                      href={`/dashboard/projects/${project.id}/update-status`}
                      className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    >
                      Update Status
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}