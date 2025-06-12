import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function deleteSneaker(id: string) {
  const { data, error } = await supabase.from('sneakers').delete().eq('id', id).select().single()
  if (error) throw error
  return data
} 