'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import SneakerCard from '@/components/SneakerCard'
import Link from 'next/link'
import { addSneaker } from '@/services/addSneaker'
import FilterBar from '@/components/FilterBar'

interface Sneaker {
  id: string
  name: string
  image: string
  tags: string[]
  score: number
  user_id: string
  brand: string
  model: string
}

const DEFAULT_TAGS = ['skinny', 'chunky', 'dressy', 'everyday', 'heater'];

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
  const [selectedTags, setSelectedTags] = useState<string[]>([])

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
            tags: s.tags || ['Heater'],
            score: s.score || 4,
          }))
        )
      }
      setLoading(false)
    }
    checkSessionAndFetch()
  }, [supabase, router])

  const handleTagChange = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

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
        tags: selectedTags,
      })
      setNewSneakerBrand('')
      setNewSneakerModel('')
      setSelectedTags([])
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
            tags: s.tags || ['Heater'],
            score: s.score || 4,
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

  // Filter sneakers locally by tag
  const filteredSneakers = activeTag
    ? sneakers.filter(s => Array.isArray(s.tags) && s.tags.includes(activeTag))
    : sneakers;

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
      <FilterBar activeTag={activeTag} setActiveTag={setActiveTag} />
      <div className="mt-8 w-full max-w-4xl">
        <h2 className="text-xl font-semibold mb-2">Your Sneakers</h2>
        {filteredSneakers.length === 0 ? (
          <p>No sneakers found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredSneakers.map((sneaker) => (
              <Link key={sneaker.id} href={`/sneakers/${sneaker.id}`} className="block hover:shadow-lg transition-shadow">
                <SneakerCard
                  name={sneaker.brand + ' ' + sneaker.model}
                  image={sneaker.image}
                  tags={sneaker.tags}
                  score={sneaker.score}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={handleAddSneaker} className="flex gap-2 mb-6 flex-wrap items-end">
        <input
          type="text"
          placeholder="Brand"
          value={newSneakerBrand}
          onChange={e => setNewSneakerBrand(e.target.value)}
          className="border px-3 py-1 rounded w-40"
          disabled={adding}
          required
        />
        <input
          type="text"
          placeholder="Model"
          value={newSneakerModel}
          onChange={e => setNewSneakerModel(e.target.value)}
          className="border px-3 py-1 rounded w-40"
          disabled={adding}
          required
        />
        <div className="flex gap-2 flex-wrap items-center">
          {DEFAULT_TAGS.map(tag => (
            <label key={tag} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => handleTagChange(tag)}
                disabled={adding}
              />
              {tag}
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
          disabled={adding || !newSneakerBrand || !newSneakerModel}
        >
          {adding ? 'Adding...' : 'Add Sneaker'}
        </button>
      </form>
    </main>
  )
} 