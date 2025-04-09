'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/contexts/SupabaseContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading, signOut } = useSupabase()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Seamless Alpha</h1>
        </div>
        <nav className="mt-6">
          <Link 
            href="/dashboard" 
            className="block py-3 px-6 hover:bg-blue-700"
          >
            Dashboard
          </Link>
          <Link 
            href="/dashboard/projects" 
            className="block py-3 px-6 hover:bg-blue-700"
          >
            Projects
          </Link>
          <Link 
            href="/dashboard/settings" 
            className="block py-3 px-6 hover:bg-blue-700"
          >
            Settings
          </Link>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
            <div className="flex items-center">
              <span className="mr-4 text-sm">{user?.email}</span>
              <button 
                onClick={handleSignOut}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}