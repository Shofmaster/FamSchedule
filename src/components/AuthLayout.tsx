import { SignOutButton } from '@clerk/react'
import { NavLink, Outlet } from 'react-router-dom'
import useAppStore from '../store/useAppStore.ts'

export default function AuthLayout() {
  const totalUnread = useAppStore((s) => s.conversations.reduce((sum, c) => sum + c.unreadCount, 0))

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
                to="/messages"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'}`
                }
              >
                Messages
                {totalUnread > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                )}
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
