"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import SneakerCard from '@/components/SneakerCard'
import { updateSneaker } from '@/services/updateSneaker'
import { deleteSneaker } from '@/services/deleteSneaker'

interface Sneaker {
  id: string
  name: string
  image: string
  rating: number
  user_id: string
  in_rotation: boolean
  brand: string
  title: string
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
          rating: data.rating || 0,
          brand: data.brand || 'Unknown Brand',
          title: data.title || 'Unknown Title',
        })
      }
      setLoading(false)
    }
    fetchSneaker()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id])

  const handleToggleRotation = async () => {
    if (!sneaker) return;
    const updated = await updateSneaker(sneaker.id, { in_rotation: !sneaker.in_rotation });
    setSneaker((prev) => prev && { ...prev, in_rotation: updated.in_rotation });
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }
  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">{error}</div>
  }
  if (!sneaker) {
    return <div className="flex min-h-screen items-center justify-center">Sneaker not found.</div>
  }

  const handleDelete = async () => {
    if (!sneaker) return;
    const confirmed = window.confirm('Are you sure you want to delete this sneaker?');
    if (confirmed) {
      await deleteSneaker(sneaker.id);
      router.push('/my-sneakers');
    }
  };
  

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 relative">
      <button
        onClick={() => router.back()}
        className="absolute top-8 left-8 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-4">{sneaker.name}</h1>
      <SneakerCard
        name={sneaker.title}
        image={sneaker.image}
        tags={[sneaker.tag]}
        score={sneaker.rating}
      />
      <div className="mt-6 text-center">
        <div className="mb-2">In Rotation: {sneaker.in_rotation ? 'Yes' : 'No'}</div>
        <div className="text-xs text-gray-500">Sneaker ID: {sneaker.id}</div>
        <div className="flex gap-2 justify-center mt-4">
          <button
            onClick={() => router.push(`/my-sneakers/${sneaker.id}/edit`)}
            className="px-4 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors border border-gray-200"
          >
            Edit Sneaker
          </button>
          <button
            onClick={handleToggleRotation}
            className={`px-4 py-2 rounded border ${
              sneaker.in_rotation 
                ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' 
                : 'bg-white text-gray-800 hover:bg-gray-50'
            } transition-colors border-gray-200`}
          >
            {sneaker.in_rotation ? 'Remove from Rotation' : 'Add to Rotation'}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200"
          >
            Delete Sneaker
          </button>
        </div>
      </div>
    </main>
  )
} 