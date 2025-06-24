'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import SneakerCard from '@/components/SneakerCard'
import AddSneakerCard from '@/components/AddSneakerCard'
import Link from 'next/link'

interface Sneaker {
  id: string
  name: string
  image: string
  rating: number
  user_id: string
  brand: string
  title: string
  tag: string
  in_rotation: boolean
}

export default function MySneakersPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<unknown>(null)
  const [sneakers, setSneakers] = useState<Sneaker[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [showRotationOnly, setShowRotationOnly] = useState(false)
  const [profile, setProfile] = useState<{ username: string } | null>(null)

  useEffect(() => {
    const checkSessionAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        setLoading(false)
        return
      }
      setUser(session.user)
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single()
      if (!profileError && profileData) {
        setProfile(profileData)
      }
      // Fetch sneakers for the current user
      const { data, error } = await supabase
        .from('sneakers')
        .select('*')
        .eq('user_id', session.user.id)
      if (error) {
        setError(error.message)
      } else {
        setSneakers(
          (data || []).map((s: Record<string, unknown>) => ({
            ...s,
            image: (s.image as string) || 'https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/6b2e2e2e-2e2e-4e2e-8e2e-2e2e2e2e2e2e/air-jordan-4-retro-white-oreo.png',
            tag: (s.tag as string) || 'Heater',
            rating: (s.rating as number) || 0,
            in_rotation: (s.in_rotation as boolean) || false,
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
      <p>Welcome, {profile?.username ?? (user && typeof user === 'object' && 'email' in user ? (user as { email: string }).email : '')}!</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredSneakers.length === 0 ? 
          ( <AddSneakerCard />) : (
            <>
              {filteredSneakers.map((sneaker) => (
                <Link key={sneaker.id} href={`/sneakers/${sneaker.id}`} className="block hover:shadow-lg transition-shadow">
                  <SneakerCard
                    name={sneaker.title}
                    image={sneaker.image}
                    tags={[sneaker.tag]}
                    score={sneaker.rating}
                  />
                </Link>
              ))}
              <AddSneakerCard />
            </>
          )}
        </div>
      </div>
    </main>
  )
} 