"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { addSneaker } from "@/services/addSneaker";
import { supabase } from "@/lib/supabaseClient";

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

export default function AddSneakerPage() {
  const router = useRouter();
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

  // Fetch user on mount
  useEffect(() => {
    supa.auth.getSession().then((res: { data?: { session?: { user?: unknown } } }) => {
      const session = res.data?.session;
      setUser(session?.user || null);
    });
  }, [supa]);

  // KicksCrew API search
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    setSearchResults([]);
    setError(null);
    try {
      const res = await fetch(`/api/kickscrew?query=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setSearchResults(data.products || []);
    } catch (e) {
      setError("Error fetching sneaker images");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSneaker = (sneaker: SearchResult) => {
    setBrand(sneaker.brand || "");
    setTitle(sneaker.title || sneaker.nickname || "");
    setImageUrl(sneaker.image || "");
    setTag("");
    setRating("");
  };

  // Handle image upload to Supabase Storage
  const handleImageUpload = async (file: File) => {
    const filePath = `public/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("sneaker-images").upload(filePath, file);
    if (error) throw error;
    const { publicUrl } = supabase.storage.from("sneaker-images").getPublicUrl(filePath).data;
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
      await addSneaker({
        user_id: (user as { id: string }).id,
        brand,
        title,
        tag,
        rating: parseFloat(rating),
        image: finalImageUrl,
        in_rotation: false,
      });
      router.push("/my-sneakers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding sneaker");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 relative">
      {/* Add back button */}
      <button
        onClick={() => router.push('/my-sneakers')}
        className="absolute top-8 left-8 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
      >
        ← Back
      </button>

      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6 mt-16">
        <h1 className="text-2xl font-bold mb-6">Add Sneaker</h1>
        
        {/* Search Section */}
        <div className="mb-8">
          <label className="block text-lg font-medium mb-2">Search for Sneaker</label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search (e.g. Jordan 1, Nike Dunk)"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={event => event.key === 'Enter' && handleSearch()}
              className="border px-4 py-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              type="button" 
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={searching}
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {searchResults.map((result, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSneaker(result)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md border-gray-200`}
                >
                  <img
                    src={result.image}
                    alt={result.title}
                    className="w-full h-48 object-contain mb-3 rounded"
                  />
                  <h3 className="font-medium text-lg mb-1">{result.title}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Brand: {result.brand}</p>
                    <p>Model: {result.model_no || result.nickname}</p>
                    {result.colorway && <p>Colorway: {result.colorway}</p>}
                    {result.release_date && <p>Release: {result.release_date}</p>}
                    {result.lowest_price && (
                      <p className="text-green-600">
                        Price: ${result.lowest_price} - ${result.highest_price}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Sneaker Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tag</label>
              <input
                type="text"
                value={tag}
                onChange={e => setTag(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rating (0-5)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={rating}
                onChange={e => setRating(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Manual Image Upload Section */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium mb-2">Upload Custom Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setImageFile(e.target.files?.[0] || null)}
              className="w-full"
            />
            {imageUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Selected Image:</p>
                <img
                  src={imageUrl}
                  alt="Selected sneaker"
                  className="w-32 h-32 object-contain border rounded"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Sneaker"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 