import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface UpdateSneakerData {
  brand?: string;
  title?: string;
  tag?: string;
  rating?: number;
  image?: string;
  in_rotation?: boolean;
}

export async function updateSneaker(id: string, data: UpdateSneakerData) {
  const { data: updatedSneaker, error } = await supabase
    .from('sneakers')
    .update({
      ...data,

    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updatedSneaker;
} 