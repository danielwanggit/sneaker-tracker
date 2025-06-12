import React from 'react'

interface SneakerCardProps {
  name: string
  image: string
  tags: string[]
  score: number // 1-5 star rating
}

export default function SneakerCard({ name, image, tags, score }: SneakerCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center w-full max-w-xs">
      <img
        src={image}
        alt={name}
        className="w-32 h-24 object-contain mb-2"
        style={{ background: '#f3f3f3' }}
      />
      <div className="font-semibold mb-1 text-center">{name}</div>
      <div className="flex flex-wrap gap-1 justify-center mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-gray-200 text-xs px-2 py-0.5 rounded-full text-gray-700"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i <= score ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
          </svg>
        ))}
      </div>
    </div>
  )
} 