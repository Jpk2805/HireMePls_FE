import { useAuth } from '@hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'User'
  const avatarInitial = displayName.charAt(0).toUpperCase()

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-end px-4 flex-shrink-0">
      <div className="relative">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          <div className="w-6 h-6 bg-[#111111] rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {avatarInitial}
          </div>
          <span className="hidden sm:inline text-sm text-gray-700 font-medium">{displayName}</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {profileOpen && (
          <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-md shadow-sm py-1 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-[#111111]">{displayName}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
              <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                {user?.plan === 'premium' ? 'Premium' : 'Free'} Plan
              </span>
            </div>
            <div className="py-1">
              <button
                onClick={() => { navigate('/settings'); setProfileOpen(false) }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Settings
              </button>
            </div>
            <div className="border-t border-gray-100 py-1">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
