import { useAuth } from '@hooks/useAuth'
import { useState } from 'react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'billing', label: 'Billing' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="flex gap-4 border-b border-slate-700/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-semibold text-white">Profile Information</h3>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-400 cursor-not-allowed"
            />
            <p className="text-slate-500 text-sm mt-1">Verified ✓</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Plan</label>
            <p className="text-white font-medium capitalize">{user?.plan} Plan</p>
          </div>

          <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
            Save Changes
          </button>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Billing Information</h3>
          <p className="text-slate-400">Billing features coming soon.</p>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-slate-300">Job Completion Alerts</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-slate-300">Job Failure Alerts</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-slate-300">Weekly Summary Report</span>
          </label>

          <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors mt-4">
            Save Preferences
          </button>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
