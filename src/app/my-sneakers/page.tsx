'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'

export default function MySneakersPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [sneakers, setSneakers] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSessionAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        setLoading(false)
        return
      }
      setUser(session.user)
      // Fetch sneakers for the current user
      const { data, error } = await supabase
        .from('sneakers')
        .select('*')
      if (error) {
        setError(error.message)
      } else {
        setSneakers(data || [])
        console.log('Fetched sneakers for user:', session.user.id, data)
      }
      setLoading(false)
    }
    checkSessionAndFetch()
  }, [supabase, router])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }
  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">{error}</div>
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-4">My Sneakers</h1>
      <p>Welcome, {user?.email}!</p>
      <div className="mt-8 w-full max-w-xl">
        <h2 className="text-xl font-semibold mb-2">Your Sneakers</h2>
        {sneakers.length === 0 ? (
          <p>No sneakers found.</p>
        ) : (
          <ul className="space-y-2">
            {sneakers.map((sneaker) => (
              <li key={sneaker.id} className="border p-4 rounded">
                <pre className="text-xs">{JSON.stringify(sneaker, null, 2)}</pre>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
} 