import { useAuth } from '@hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'User'
  const avatarInitial = displayName.charAt(0).toUpperCase()

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Jobs', path: '/jobs' },
    { label: 'Resumes', path: '/resumes' },
    { label: 'Logs', path: '/logs' },
    { label: 'API Keys', path: '/api-keys' },
    { label: 'Settings', path: '/settings' },
  ]

  return (
    <header className="backdrop-blur-md bg-slate-900/60 border-b border-slate-800/50 sticky top-0 z-40">
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <h1 className="text-lg font-bold text-white">Job Processor</h1>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {avatarInitial}
              </div>
              <span className="hidden sm:inline text-sm text-slate-300">{displayName}</span>
              <span className="text-slate-400">▼</span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 backdrop-blur-md bg-slate-900/95 border border-slate-800 rounded-lg shadow-xl py-2">
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="text-sm text-slate-300 font-medium">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <p className="text-xs text-purple-400 mt-0.5">{user?.plan === 'premium' ? 'Premium' : 'Free'} Plan</p>
                </div>
                <button
                  onClick={() => {
                    navigate('/settings')
                    setProfileOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
                >
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-slate-800 mt-2 pt-2"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
