import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function updateSneaker(id: string, updates: Partial<any>) {
  const { data, error } = await supabase.from('sneakers').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
} 