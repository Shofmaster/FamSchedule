import { useAuth, SignIn } from '@clerk/react'
import { Navigate } from 'react-router-dom'

export default function LoginPage() {
  const { isLoaded, isSignedIn } = useAuth()

  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-orange-400 via-orange-100 to-white overflow-hidden">
      {/* Blurred calendar grid layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 59px,
              rgba(249, 115, 22, 0.18) 59px,
              rgba(249, 115, 22, 0.18) 60px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 59px,
              rgba(249, 115, 22, 0.18) 59px,
              rgba(249, 115, 22, 0.18) 60px
            )
          `,
          filter: 'blur(3px)',
        }}
      />

      {/* Frosted glass sign-in card */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="bg-white/85 backdrop-blur-md shadow-xl rounded-2xl p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-orange-500">ScheduleMe</h1>
            <p className="text-gray-500 mt-2 text-sm">Coordinate your world, effortlessly.</p>
          </div>
          <SignIn />
        </div>
      </div>
    </div>
  )
}
