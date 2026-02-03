import { useAuth } from '@clerk/react'
import { Navigate, Outlet } from 'react-router-dom'

export default function AuthGuard() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-orange-500 text-lg font-medium">Loading...</div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
