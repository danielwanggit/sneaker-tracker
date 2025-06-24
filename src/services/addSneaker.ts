import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Define a type for sneaker insert
export interface SneakerInsert {
  user_id: string;
  brand: string;
  title: string;
  tag: string;
  rating?: number;
  image?: string;
  in_rotation?: boolean;
}

export async function addSneaker(sneaker: SneakerInsert) {
  const { data, error } = await supabase.from('sneakers').insert([sneaker]).select().single()
  if (error) throw error
  return data
} 