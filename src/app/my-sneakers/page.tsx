'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import SneakerCard from '@/components/SneakerCard'
import Link from 'next/link'
import { addSneaker } from '@/services/addSneaker'

interface Sneaker {
  id: string
  name: string
  image: string
  score: number
  user_id: string
  brand: string
  model: string
  tag: string
  in_rotation: boolean
}

export default function MySneakersPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [sneakers, setSneakers] = useState<Sneaker[]>([])
  const [error, setError] = useState<string | null>(null)
  const [newSneakerBrand, setNewSneakerBrand] = useState('')
  const [newSneakerModel, setNewSneakerModel] = useState('')
  const [adding, setAdding] = useState(false)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [showRotationOnly, setShowRotationOnly] = useState(false)

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
        .eq('user_id', session.user.id)
      if (error) {
        setError(error.message)
      } else {
        // Fallback for missing fields in DB: mock image, tags, score
        setSneakers(
          (data || []).map((s: any) => ({
            ...s,
            image: s.image || 'https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/6b2e2e2e-2e2e-4e2e-8e2e-2e2e2e2e2e2e/air-jordan-4-retro-white-oreo.png',
            tag: s.tag || 'Heater',
            score: s.score || 4,
            in_rotation: s.in_rotation || false,
          }))
        )
      }
      setLoading(false)
    }
    checkSessionAndFetch()
  }, [supabase, router])

  // Fetch unique tags for filtering
  useEffect(() => {
    const fetchTags = async () => {
      const { data, error } = await supabase
        .from('sneakers')
        .select('tag')
      if (!error && data) {
        const tags = Array.from(new Set(data.map((s: any) => s.tag).filter(Boolean))) as string[];
        setAvailableTags(tags);
      }
    };
    fetchTags();
  }, [sneakers]);

  const handleAddSneaker = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSneakerBrand || !newSneakerModel || !user) return
    setAdding(true)
    try {
      await addSneaker({
        user_id: user.id,
        brand: newSneakerBrand,
        model: newSneakerModel,
        in_rotation: false,
        tag: tagInput.trim(),
      })
      setNewSneakerBrand('')
      setNewSneakerModel('')
      setTagInput('')
      // Refresh sneaker list
      const { data, error } = await supabase
        .from('sneakers')
        .select('*')
        .eq('user_id', user.id)
      if (!error) {
        setSneakers(
          (data || []).map((s: any) => ({
            ...s,
            image: s.image || 'https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/6b2e2e2e-2e2e-4e2e-8e2e-2e2e2e2e2e2e/air-jordan-4-retro-white-oreo.png',
            tag: s.tag || 'Heater',
            score: s.score || 4,
            in_rotation: s.in_rotation || false,
          }))
        )
      }
    } catch (err) {
      console.error('Error adding sneaker:', err)
      alert('Error adding sneaker: ' + (err && typeof err === 'object' ? JSON.stringify(err) : String(err)))
    } finally {
      setAdding(false)
    }
  }

  // Filter sneakers locally by tag and rotation
  let filteredSneakers = sneakers;
  if (activeTag) {
    filteredSneakers = filteredSneakers.filter(s => s.tag === activeTag);
  }
  if (showRotationOnly) {
    filteredSneakers = filteredSneakers.filter(s => s.in_rotation);
  }

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
      {/* Inline Filter Bar for tags */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-4 py-1 rounded-full border text-sm ${activeTag === null ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            All
          </button>
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-4 py-1 rounded-full border text-sm ${activeTag === tag ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {tag}
            </button>
          ))}
          {/* Rotation Switch */}
          <label className="flex items-center gap-2 ml-4 cursor-pointer select-none">
            <span className="text-sm">Show My Rotation</span>
            <input
              type="checkbox"
              checked={showRotationOnly}
              onChange={e => setShowRotationOnly(e.target.checked)}
              className="sr-only"
            />
            <span className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out ${showRotationOnly ? 'bg-blue-600' : ''}`}>
              <span className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${showRotationOnly ? 'translate-x-5' : ''}`}></span>
            </span>
          </label>
        </div>
      </div>
      <div className="mt-8 w-full max-w-4xl">
        <h2 className="text-xl font-semibold mb-2">Your Sneakers</h2>
        {filteredSneakers.length === 0 ? (
          <p className="text-lg text-gray-500 text-center py-12">Add your first sneaker!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredSneakers.map((sneaker) => (
              <Link key={sneaker.id} href={`/sneakers/${sneaker.id}`} className="block hover:shadow-lg transition-shadow">
                <SneakerCard
                  name={sneaker.brand + ' ' + sneaker.model}
                  image={sneaker.image}
                  tags={[sneaker.tag]}
                  score={sneaker.score}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={handleAddSneaker} className="flex gap-2 mb-6 flex-wrap items-end">
        <button
          type="button"
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
          onClick={() => router.push('/my-sneakers/add')}
        >
          Add Sneaker
        </button>
      </form>
    </main>
  )
} 