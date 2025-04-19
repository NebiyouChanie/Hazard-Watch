'use client'
import dynamic from 'next/dynamic'

const MinimalMap = dynamic(() => import('@/components/MinimalMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
})

export default function Dashboard() {
  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '700px',
      overflowX: 'hidden' 
    }}>
      <MinimalMap />
    </div>
  )
}