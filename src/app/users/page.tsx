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

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
      if (error) {
        setError(error.message)
      } else {
        setProfiles(data || [])
      }
      setLoading(false)
    }
    fetchProfiles()
  }, [supabase])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold mb-4">User Directory</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <ul className="space-y-2">
          {profiles.map(profile => (
            <li key={profile.id} className="text-lg">
              <Link href={`/users/${profile.id}`} className="text-blue-600 hover:underline">
                {profile.username}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
} 