'use client'

import { useState } from 'react'
import BriefForm from '@/components/BriefForm'
import BriefDisplay from '@/components/BriefDisplay'
import { BriefResponse } from '@/lib/types'

export default function Home() {
  const [brief, setBrief] = useState<BriefResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBriefGenerated = (newBrief: BriefResponse) => {
    setBrief(newBrief)
    setError(null)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setBrief(null)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          AI Content Brief Generator
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <BriefForm 
              onBriefGenerated={handleBriefGenerated}
              onError={handleError}
              loading={loading}
              setLoading={setLoading}
            />
          </div>
          
          <div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {brief && <BriefDisplay brief={brief} />}
            
            {!brief && !error && !loading && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                <p>Enter keywords and generate a content brief to see the results here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}