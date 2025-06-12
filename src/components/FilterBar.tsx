import React, { useState } from 'react';

const DEFAULT_TAGS = ['skinny', 'chunky', 'dressy', 'everyday', 'heater'];

export default function FilterBar({ activeTag, setActiveTag }: {
  activeTag: string | null,
  setActiveTag: (tag: string | null) => void
}) {
  const [tags, setTags] = useState<string[]>(DEFAULT_TAGS);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  };

  const handleDeleteTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
    if (activeTag === tag) setActiveTag(null);
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTag(null)}
          className={`px-4 py-1 rounded-full border text-sm ${activeTag === null ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          All
        </button>
        {tags.map(tag => (
          <span key={tag} className="flex items-center">
            <button
              onClick={() => setActiveTag(tag)}
              className={`px-4 py-1 rounded-full border text-sm mr-1 ${activeTag === tag ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {tag}
            </button>
            <button
              onClick={() => handleDeleteTag(tag)}
              className="text-xs text-red-500 hover:text-red-700 ml-1"
              title={`Delete tag ${tag}`}
              type="button"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <form onSubmit={handleAddTag} className="flex gap-2 mt-1">
        <input
          type="text"
          placeholder="Add tag"
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          disabled={!newTag.trim() || tags.includes(newTag.trim().toLowerCase())}
        >
          Add
        </button>
      </form>
    </div>
  );
} 