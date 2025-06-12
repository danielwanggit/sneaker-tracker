import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function addSneaker(sneaker: Omit<any, 'id'> & { user_id: string }) {
  const { data, error } = await supabase.from('sneakers').insert([sneaker]).select().single()
  if (error) throw error
  return data
} 