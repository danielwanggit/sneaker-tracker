"use client"

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { updateSneaker } from "@/services/updateSneaker";

interface SearchResult {
  title: string;
  brand: string;
  model_no: string;
  nickname: string;
  image: string;
  colorway: string;
  release_date: string;
  lowest_price: number;
  highest_price: number;
}

export default function EditSneakerPage() {
  const router = useRouter();
  const params = useParams();
  const { supabase: supa } = useSupabase();
  const [brand, setBrand] = useState("");
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [rating, setRating] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user and sneaker data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user session
        const { data: { session } } = await supa.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        setUser(session.user);

        // Get sneaker data
        const sneakerId = params?.id as string;
        if (!sneakerId) {
          setError('No sneaker ID provided');
          setLoading(false);
          return;
        }

        const { data: sneaker, error: sneakerError } = await supa
          .from('sneakers')
          .select('*')
          .eq('id', sneakerId)
          .single();

        if (sneakerError) throw sneakerError;

        // Pre-fill form with sneaker data
        setBrand(sneaker.brand || '');
        setTitle(sneaker.title || '');
        setTag(sneaker.tag || '');
        setRating(sneaker.rating?.toString() || '');
        setImageUrl(sneaker.image || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading sneaker');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supa, router, params?.id]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearching(true);
    setError(null);
    try {
      const res = await fetch(`/api/kickscrew?query=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setSearchResults(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSneaker = (sneaker: SearchResult) => {
    setBrand(sneaker.brand);
    setTitle(sneaker.title);
    setImageUrl(sneaker.image);
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    if (!user || typeof user !== 'object' || !('id' in user)) throw new Error("Not logged in");
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supa.storage
      .from('sneaker-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supa.storage
      .from('sneaker-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await handleImageUpload(imageFile);
      }
      if (!user || typeof user !== 'object' || !('id' in user)) throw new Error("Not logged in");
      const sneakerId = params?.id as string;
      await updateSneaker(sneakerId, {
        brand,
        title,
        tag,
        rating: parseFloat(rating),
        image: finalImageUrl,
      });
      router.push(`/sneakers/${sneakerId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating sneaker");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 relative">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute top-8 left-8 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
      >
        ← Back
      </button>

      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6 mt-16">
        <h1 className="text-2xl font-bold mb-6">Edit Sneaker</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Search for Sneaker</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a sneaker..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectSneaker(result)}
                    className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 flex items-center gap-4"
                  >
                    {result.image && (
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">{result.title}</h3>
                      <p className="text-sm text-gray-600">
                        {result.brand} • {result.model_no}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Manual Entry Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Sneaker Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tag</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g., Daily, Special Occasion"
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
              <input
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                min="1"
                max="5"
                step="0.1"
                required
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Image</label>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Current sneaker"
                  className="mt-2 w-32 h-32 object-cover rounded-lg"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="mt-2 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Sneaker'}
          </button>
        </form>
      </div>
    </main>
  );
} 