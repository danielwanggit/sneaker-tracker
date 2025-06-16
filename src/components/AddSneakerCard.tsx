import React from 'react'
import { useRouter } from 'next/navigation'

export default function AddSneakerCard() {
  const router = useRouter()

  return (
    <div 
      onClick={() => router.push('/my-sneakers/add')}
      className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center w-full max-w-xs cursor-pointer hover:shadow-lg transition-shadow min-h-[200px] border-2 border-dashed border-gray-300 hover:border-gray-400"
    >
      <div className="flex flex-col items-center text-gray-500 hover:text-gray-700">
        <svg 
          className="w-12 h-12 mb-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 4v16m8-8H4" 
          />
        </svg>
        <span className="text-lg font-medium">Add Sneaker</span>
      </div>
    </div>
  )
} 