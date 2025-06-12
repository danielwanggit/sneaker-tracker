"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import SneakerCard from '@/components/SneakerCard'

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

export default function SneakerDetailPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [sneaker, setSneaker] = useState<Sneaker | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSneaker = async () => {
      const id = params?.id as string
      if (!id) {
        setError('No sneaker ID provided.')
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('sneakers')
        .select('*')
        .eq('id', id)
        .single()
      if (error) {
        setError(error.message)
      } else if (data) {
        setSneaker({
          ...data,
          image: data.image || 'https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/6b2e2e2e-2e2e-4e2e-8e2e-2e2e2e2e2e2e/air-jordan-4-retro-white-oreo.png',
          tag: data.tag || 'Heater',
          score: data.score || 4,
          brand: data.brand || 'Unknown Brand',
          model: data.model || 'Unknown Model',
        })
      }
      setLoading(false)
    }
    fetchSneaker()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }
  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">{error}</div>
  }
  if (!sneaker) {
    return <div className="flex min-h-screen items-center justify-center">Sneaker not found.</div>
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-4">{sneaker.name}</h1>
      <SneakerCard
        name={sneaker.brand + ' ' + sneaker.model}
        image={sneaker.image}
        tags={[sneaker.tag]}
        score={sneaker.score}
      />
      <div className="mt-6 text-center">
        <div className="mb-2">In Rotation: {sneaker.in_rotation ? 'Yes' : 'No'}</div>
        <div className="text-xs text-gray-500">Sneaker ID: {sneaker.id}</div>
      </div>
    </main>
  )
} 