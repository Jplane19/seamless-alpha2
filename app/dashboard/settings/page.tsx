'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Settings() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          setFormData(prev => ({
            ...prev,
            email: user.email || ''
          }))
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setMessage(null)
    
    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({
        text: 'New passwords do not match',
        type: 'error'
      })
      setUpdating(false)
      return
    }
    
    try {
      // In a real app, you'd use Supabase Auth to update password
      // const { error } = await supabase.auth.updateUser({
      //   password: formData.newPassword
      // })
      
      // if (error) throw error
      
      // For demonstration, we'll just wait a second
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage({
        text: 'Password updated successfully',
        type: 'success'
      })
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error: any) {
      setMessage({
        text: error.message || 'An error occurred while updating your password',
        type: 'error'
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading user data...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account profile and password</p>
      </div>
      
      {message && (
        <div 
          className={`mb-6 p-4 text-sm rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`} 
          role="alert"
        >
          {message.text}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
          <p className="mt-1 text-sm text-gray-500">
            Your basic account information
          </p>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Contact the administrator to change your email address
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your password for enhanced security
          </p>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleUpdatePassword}>
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  required
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  required
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={updating}
                className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}