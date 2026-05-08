import { useState } from 'react'

export default function ApiKeysPage() {
  const [showGenerateForm, setShowGenerateForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">API Keys</h1>
          <p className="text-slate-400 mt-2">Manage API keys for accessing the job processing system</p>
        </div>
        <button
          onClick={() => setShowGenerateForm(true)}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          + Generate New Key
        </button>
      </div>

      {showGenerateForm && (
        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Generate New API Key</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Key Name</label>
              <input
                type="text"
                placeholder="e.g., Production, Staging"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowGenerateForm(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
                Generate Key
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-8 rounded-xl text-center">
        <p className="text-slate-400">No API keys yet. Generate your first key to get started.</p>
      </div>
    </div>
  )
}
