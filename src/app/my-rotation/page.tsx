'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import SneakerCard from '@/components/SneakerCard'

const ROTATION_TITLES = [
  'Something skinny',
  'Something chunky',
  'Something for everyday',
  'Something dressy',
]

interface Sneaker {
  id: string
  name: string
  image: string
  score: number
  user_id: string
  in_rotation: boolean
  brand: string
  model: string
  tag: string
}

export default function MyRotationPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [sneakers, setSneakers] = useState<Sneaker[]>([])
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
      // Fetch sneakers for the current user that are in rotation
      const { data, error } = await supabase
        .from('sneakers')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('in_rotation', true)
      if (error) {
        setError(error.message)
      } else {
        setSneakers(
          (data || []).map((s: any) => ({
            ...s,
            image: s.image || 'https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/6b2e2e2e-2e2e-4e2e-8e2e-2e2e2e2e2e2e/air-jordan-4-retro-white-oreo.png',
            tag: s.tag || 'Heater',
            score: s.score || 4,
            brand: s.brand || 'Unknown',
            model: s.model || 'Unknown',
          }))
        )
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
      <h1 className="text-3xl font-bold mb-4">My Rotation</h1>
      <div className="mt-8 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8">
        {sneakers.length === 0 ? (
          <p className="col-span-full">No sneakers in rotation.</p>
        ) : (
          sneakers.map((sneaker, i) => (
            <div key={sneaker.id} className="flex flex-col items-center">
              <div className="mb-2 text-lg font-semibold text-center">
                {ROTATION_TITLES[i % ROTATION_TITLES.length]}
              </div>
              <SneakerCard
                name={sneaker.brand + ' ' + sneaker.model}
                image={sneaker.image}
                tags={[sneaker.tag]}
                score={sneaker.score}
              />
            </div>
          ))
        )}
      </div>
    </main>
  )
} 