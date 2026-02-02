import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Settings = ({ isOpen, onClose }: SettingsProps) => {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [aiOptimization, setAiOptimization] = useState(true);
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              aria-label="Close settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-dark-border">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {user.firstName?.[0] || user.username?.[0] || 'U'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          )}

          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Theme</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {theme === 'light' ? 'Light mode' : 'Dark mode'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'
              }`}
              aria-label="Toggle theme"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                }`}
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </span>
            </button>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive schedule updates
              </p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                notifications ? 'bg-primary-600' : 'bg-gray-300'
              }`}
              aria-label="Toggle notifications"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* AI Optimization Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Optimization</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Auto-adjust your schedule
              </p>
            </div>
            <button
              onClick={() => setAiOptimization(!aiOptimization)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                aiOptimization ? 'bg-primary-600' : 'bg-gray-300'
              }`}
              aria-label="Toggle AI optimization"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  aiOptimization ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Additional Settings */}
          <div className="pt-4 border-t border-gray-200 dark:border-dark-border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Preferences</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white">
                Priority Contacts
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white">
                Activity Preferences
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white">
                Time Zones
              </button>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-dark-border">
            <button
              onClick={() => signOut()}
              className="w-full px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-white font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
