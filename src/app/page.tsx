import { Suspense } from 'react'
import { redirect } from 'next/navigation'

function RedirectComponent() {
  // Server-side redirect to login page
  redirect('/login')
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RedirectComponent />
    </Suspense>
  )
}