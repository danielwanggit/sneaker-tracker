'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import SneakerCard from '@/components/SneakerCard'
import Link from 'next/link'

interface Profile {
  id: string
  username: string
}

interface Sneaker {
  id: string
  title: string
  image?: string
  tag?: string
  rating?: number
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;
  const { supabase } = useSupabase();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [sneakersLoading, setSneakersLoading] = useState(true);
  const [sneakersError, setSneakersError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', userId)
        .single();
      if (error) {
        setError(error.message);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [supabase, userId]);

  useEffect(() => {
    if (!userId) return;
    const fetchSneakers = async () => {
      setSneakersLoading(true);
      const { data, error } = await supabase
        .from('sneakers')
        .select('id, title, image, tag, rating')
        .eq('user_id', userId);
      if (error) {
        setSneakersError(error.message);
      } else {
        setSneakers(data || []);
      }
      setSneakersLoading(false);
    };
    fetchSneakers();
  }, [supabase, userId]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && profile && (
        <div className="w-full max-w-xl">
          <p className="text-lg">Username: <span className="font-semibold">{profile.username}</span></p>
          <p className="text-gray-500 mt-2 mb-6">User ID: {profile.id}</p>
          <h2 className="text-xl font-semibold mb-2">{profile.username}'s collection</h2>
          {sneakersLoading && <div>Loading sneakers...</div>}
          {sneakersError && <div className="text-red-500">{sneakersError}</div>}
          {!sneakersLoading && !sneakersError && sneakers.length === 0 && (
            <div className="text-gray-500">No sneakers found.</div>
          )}
          {!sneakersLoading && !sneakersError && sneakers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {sneakers.map(sneaker => (
                <div key={sneaker.id} className="block">
                  <SneakerCard
                    name={sneaker.title}
                    image={sneaker.image || ''}
                    tags={sneaker.tag ? [sneaker.tag] : []}
                    score={typeof sneaker.rating === 'number' ? sneaker.rating : 0}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {!loading && !error && !profile && (
        <div className="text-gray-500">User not found.</div>
      )}
    </main>
  )
} 