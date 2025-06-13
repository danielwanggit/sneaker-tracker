import React from 'react'

interface SneakerCardProps {
  name: string
  image: string
  tags: string[]
  score: number // 1-5 star rating
}

export default function SneakerCard({ name, image, tags, score }: SneakerCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center w-full max-w-xs relative">
      <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
        {score} / 5
      </span>
      <img
        src={image || "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/6b2e2e2e-2e2e-4e2e-8e2e-2e2e2e2e2e2e/air-jordan-4-retro-white-oreo.png"}
        alt={name}
        onError={e => {
          e.currentTarget.src = "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/6b2e2e2e-2e2e-4e2e-8e2e-2e2e2e2e2e2e/air-jordan-4-retro-white-oreo.png";
        }}
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
    </div>
  )
} 