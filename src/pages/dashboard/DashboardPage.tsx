import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as jobService from '@services/job.service'

interface JobStats {
  pending: number
  active: number
  completed: number
  failed: number
  total: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<JobStats | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await jobService.getJobStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-300">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-2">Monitor your job processing pipeline</p>
        </div>
        <button
          onClick={() => navigate('/jobs/create')}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          + Create Job
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl">
          <p className="text-slate-400 text-sm font-medium">Total</p>
          <p className="text-3xl font-bold text-white mt-2">{stats?.total || 0}</p>
        </div>

        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl">
          <p className="text-slate-400 text-sm font-medium">Pending</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{stats?.pending || 0}</p>
        </div>

        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl">
          <p className="text-slate-400 text-sm font-medium">Active</p>
          <p className="text-3xl font-bold text-amber-400 mt-2">{stats?.active || 0}</p>
        </div>

        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl">
          <p className="text-slate-400 text-sm font-medium">Completed</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{stats?.completed || 0}</p>
        </div>

        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl">
          <p className="text-slate-400 text-sm font-medium">Failed</p>
          <p className="text-3xl font-bold text-red-400 mt-2">{stats?.failed || 0}</p>
        </div>
      </div>

      <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-8 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Recent Jobs</h2>
          <button
            onClick={() => navigate('/jobs')}
            className="text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors"
          >
            View all →
          </button>
        </div>
        <p className="text-slate-400 text-center py-8">Create your first job to get started</p>
      </div>
    </div>
  )
}
