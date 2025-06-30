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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      try {
        // Check authentication status
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)

        const { data, error } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('id', userId)
          .single();
        
        if (error) {
          // Handle authentication errors specifically
          if (error.message.includes('JWT') || error.message.includes('auth') || error.message.includes('permission')) {
            setError('Please log in to view user profiles.');
          } else {
            setError(error.message);
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError('Failed to load user profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [supabase, userId]);

  useEffect(() => {
    if (!userId) return;
    const fetchSneakers = async () => {
      setSneakersLoading(true);
      try {
        const { data, error } = await supabase
          .from('sneakers')
          .select('id, title, image, tag, rating')
          .eq('user_id', userId);
        
        if (error) {
          // Handle authentication errors for sneakers
          if (error.message.includes('JWT') || error.message.includes('auth') || error.message.includes('permission')) {
            setSneakersError('Please log in to view sneaker collections.');
          } else {
            setSneakersError(error.message);
          }
        } else {
          setSneakers(data || []);
        }
      } catch (err) {
        setSneakersError('Failed to load sneaker collection.');
      } finally {
        setSneakersLoading(false);
      }
    };
    fetchSneakers();
  }, [supabase, userId]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">User Profile</h1>
        
        {loading && <div>Loading...</div>}
      
      {error && (
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          {!isAuthenticated && (
            <Link 
              href="/login" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Log in to view profiles
            </Link>
          )}
        </div>
      )}
      
      {!loading && !error && profile && (
        <div>
          <p className="text-lg">Username: <span className="font-semibold">{profile.username}</span></p>
          <p className="text-gray-500 mt-2 mb-6">User ID: {profile.id}</p>
          <h2 className="text-xl font-semibold mb-2">{profile.username}&apos;s collection</h2>
          
          {sneakersLoading && <div>Loading sneakers...</div>}
          
          {sneakersError && (
            <div className="text-center">
              <div className="text-red-500 mb-4">{sneakersError}</div>
              {!isAuthenticated && (
                <Link 
                  href="/login" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Log in to view collection
                </Link>
              )}
            </div>
          )}
          
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
        <div className="text-center">
          <div className="text-gray-500 mb-4">User not found.</div>
          <Link 
            href="/users" 
            className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            Back to Community
          </Link>
        </div>
      )}
      </div>
    </main>
  )
} 