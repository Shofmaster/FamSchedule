import { useState } from 'react'
import { SignOutButton } from '@clerk/react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import useAppStore from '../store/useAppStore.ts'

const navLinks: readonly { to: string; label: string; badge?: boolean }[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/friends', label: 'Friends' },
  { to: '/group-sync', label: 'Group Sync' },
  { to: '/family-sync', label: 'Family Sync' },
  { to: '/messages', label: 'Messages', badge: true },
]

export default function AuthLayout() {
  const totalUnread = useAppStore((s) => s.conversations.reduce((sum, c) => sum + c.unreadCount, 0))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'}`

  return (
    <div className="min-h-screen flex flex-col bg-orange-50">
      {/* Top navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="text-xl font-bold text-orange-500 hover:text-orange-600">ScheduleMe</Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass}>
                  {link.label}
                  {link.badge && totalUnread > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                  )}
                </NavLink>
              ))}
              <SignOutButton>
                <button className="text-sm text-gray-600 hover:text-orange-500 transition-colors cursor-pointer">
                  Sign Out
                </button>
              </SignOutButton>
            </div>

            {/* Mobile hamburger button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive ? 'text-orange-500 bg-orange-50' : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'}`
                  }
                >
                  <span className="flex items-center gap-2">
                    {link.label}
                    {link.badge && totalUnread > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {totalUnread > 9 ? '9+' : totalUnread}
                      </span>
                    )}
                  </span>
                </NavLink>
              ))}
              <SignOutButton>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
