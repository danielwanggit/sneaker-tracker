'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useEffect, useState } from 'react'

export default function NavBar() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<unknown>(null)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    getSession()
  }, [supabase, pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="w-full bg-[#2d2d2d] border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-white text-lg font-bold">Sneaker Tracker</Link>
        <Link href="/my-sneakers" className="text-gray-200 hover:text-white">My Sneakers</Link>
        <Link href="/users" className="text-gray-200 hover:text-white">Community</Link>
      </div>
      <div>
        {user ? (
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600">
            Logout
          </button>
        ) : (
          <Link href="/login" className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
            Login
          </Link>
        )}
      </div>
    </nav>
  )
} 