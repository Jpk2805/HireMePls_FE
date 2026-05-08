import { useState } from 'react'

export default function LogsPage() {
  const [filter, setFilter] = useState({ jobId: '', level: '', search: '' })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">Execution Logs</h1>
        <p className="text-slate-400 mt-2">View and filter execution logs across all jobs</p>
      </div>

      <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-4 rounded-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Filter by job ID"
            value={filter.jobId}
            onChange={(e) => setFilter({ ...filter, jobId: e.target.value })}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <select
            value={filter.level}
            onChange={(e) => setFilter({ ...filter, level: e.target.value })}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>

          <input
            type="text"
            placeholder="Search logs"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-8 rounded-xl text-center">
        <p className="text-slate-400">Logs will appear as jobs execute. Run jobs to see logs here.</p>
      </div>
    </div>
  )
}
