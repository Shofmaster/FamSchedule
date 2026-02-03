import { SignOutButton } from '@clerk/react'
import { NavLink, Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-orange-50">
      {/* Top navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-xl font-bold text-orange-500">ScheduleMe</span>
            <div className="flex items-center gap-6">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'}`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/friends"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'}`
                }
              >
                Friends
              </NavLink>
              <NavLink
                to="/group-sync"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'}`
                }
              >
                Group Sync
              </NavLink>
              <NavLink
                to="/family-sync"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'}`
                }
              >
                Family Sync
              </NavLink>
              <NavLink
                to="/ai-planner"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'}`
                }
              >
                AI Planner
              </NavLink>
              <SignOutButton>
                <button className="text-sm text-gray-600 hover:text-orange-500 transition-colors cursor-pointer">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
