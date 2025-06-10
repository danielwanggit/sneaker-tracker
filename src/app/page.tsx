'use client'

import { useState } from 'react'

const TAGS = [
  { label: 'Heater', value: 'heater' },
  { label: 'Low Profile', value: 'low-profile' },
  { label: 'Sporty', value: 'sporty' },
]

const DUMMY_SNEAKERS = [
  {
    id: 1,
    name: 'Jordan 4 White Oreo',
    image: 'https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/6b2e2e2e-2e2e-4e2e-8e2e-2e2e2e2e2e2e/air-jordan-4-retro-white-oreo.png',
    tags: ['Heater'],
  },
  {
    id: 2,
    name: 'New Balance 990',
    image: 'https://nb.scene7.com/is/image/NB/m990gl5_nb_02_i?$pdpflexf2$',
    tags: ['Bleate'],
  },
  {
    id: 3,
    name: 'Nike Dunk Low Pale Ivory',
    image: 'https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/1b2e2e2e-2e2e-4e2e-8e2e-2e2e2e2e2e2e/dunk-low-pale-ivory.png',
    tags: ['Low-Profile'],
  },
  {
    id: 4,
    name: 'Nike Dunk Low Syracuse',
    image: 'https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/2b2e2e2e-2e2e-4e2e-8e2e-2e2e2e2e2e2e/dunk-low-syracuse.png',
    tags: ['Shorts', 'Low-Profile'],
  },
]

export default function Home() {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const handleTagClick = (tag: string) => {
    setActiveTag(tag)
    console.log('Tag clicked:', tag)
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="mb-4">
        <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
        <p className="text-gray-600">Track your sneaker collection with ease.</p>
      </header>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Explore</h2>
        <div className="flex gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag.value}
              onClick={() => handleTagClick(tag.value)}
              className={`px-4 py-1 rounded-full border text-sm transition-colors ${
                activeTag === tag.value
                  ? 'bg-black text-white border-black'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Recently Added</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {DUMMY_SNEAKERS.map((sneaker) => (
            <div key={sneaker.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
              <img
                src={sneaker.image}
                alt={sneaker.name}
                className="w-32 h-24 object-contain mb-2"
                style={{ background: '#f3f3f3' }}
              />
              <div className="font-semibold mb-1 text-center">{sneaker.name}</div>
              <div className="flex flex-wrap gap-1 justify-center">
                {sneaker.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-200 text-xs px-2 py-0.5 rounded-full text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
