'use client'

import { useParams } from 'next/navigation'

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id;

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">User Profile (Coming Soon)</h1>
      <p className="mt-2 text-gray-500">User ID: {userId}</p>
    </main>
  )
} 