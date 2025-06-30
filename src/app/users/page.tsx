'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import Link from 'next/link'

interface Profile {
  id: string
  username: string
}

export default function UsersPage() {
  const { supabase } = useSupabase()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuthAndFetchProfiles = async () => {
      try {
        // First check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession()
        const authenticated = !!session
        setIsAuthenticated(authenticated)
        console.log('Authentication status:', authenticated)

        // If not authenticated, show login message immediately
        if (!authenticated) {
          setError('Please log in to view the community directory.')
          setLoading(false)
          return
        }

        // Try to fetch profiles only if authenticated
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username')
        
        console.log('Supabase query result:', { data, error })
        
        if (error) {
          setError(error.message)
        } else {
          setProfiles(data || [])
        }
      } catch (err) {
        console.error('Error in checkAuthAndFetchProfiles:', err)
        setError('Failed to load user directory. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuthAndFetchProfiles()
  }, [supabase])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">User Directory</h1>
      
        {loading && <div className="text-center">Loading...</div>}
        
        {error && (
          <div className="text-center">
            <div className="text-red-500 mb-4">{error}</div>
            {!isAuthenticated && (
              <Link 
                href="/login" 
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Log in to view community
              </Link>
            )}
          </div>
        )}
        
        {!loading && !error && profiles.length > 0 && (
          <div>
            <p className="text-gray-600 mb-4 text-center">Discover other collections</p>
            <ul className="space-y-2">
              {profiles.map(profile => (
                <li key={profile.id} className="text-lg">
                  <Link 
                    href={`/users/${profile.id}`} 
                    className="block text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                  >
                    {profile.username}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {!loading && !error && profiles.length === 0 && isAuthenticated && (
          <div className="text-center">
            <p className="text-gray-500 mb-4">No users found in the community yet.</p>
            <p className="text-sm text-gray-400">Be the first to join!</p>
          </div>
        )}
      </div>
    </main>
  )
} 