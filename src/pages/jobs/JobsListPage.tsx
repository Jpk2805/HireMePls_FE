import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as jobService from '@services/job.service'
import { Job, PaginatedResponse } from '@types/index'

const statusColors: Record<string, string> = {
  pending: 'text-blue-400 bg-blue-500/10',
  active: 'text-amber-400 bg-amber-500/10',
  completed: 'text-green-400 bg-green-500/10',
  failed: 'text-red-400 bg-red-500/10',
  cancelled: 'text-slate-400 bg-slate-500/10',
}

const typeLabels: Record<string, string> = {
  email: '📧 Email',
  pdf: '📄 PDF',
  scrape: '🔍 Scrape',
  generic: '⚙️ Generic',
  resume: '💼 Resume',
}

export default function JobsListPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState({ status: '', type: '' })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const response: PaginatedResponse<Job> = await jobService.listJobs({
          page: pagination.page,
          limit: pagination.limit,
          status: filters.status || undefined,
          type: filters.type || undefined,
        })
        setJobs(response.data)
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        })
      } catch (error) {
        console.error('Failed to fetch jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [pagination.page, filters])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-300">Loading jobs...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Jobs</h1>
          <p className="text-slate-400 mt-2">Manage and monitor your background jobs</p>
        </div>
        <button
          onClick={() => navigate('/jobs/create')}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          + Create Job
        </button>
      </div>

      <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-4 rounded-xl flex gap-4">
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters({ ...filters, status: e.target.value })
            setPagination({ ...pagination, page: 1 })
          }}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>

        <select
          value={filters.type}
          onChange={(e) => {
            setFilters({ ...filters, type: e.target.value })
            setPagination({ ...pagination, page: 1 })
          }}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All Types</option>
          <option value="email">Email</option>
          <option value="pdf">PDF</option>
          <option value="scrape">Scrape</option>
          <option value="generic">Generic</option>
          <option value="resume">Resume</option>
        </select>
      </div>

      {jobs.length === 0 ? (
        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-12 rounded-xl text-center">
          <p className="text-slate-400 text-lg">No jobs found</p>
          <p className="text-slate-500 text-sm mt-2">Create your first job to get started</p>
          <button
            onClick={() => navigate('/jobs/create')}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Create First Job
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-4 rounded-lg hover:bg-slate-800/60 hover:border-slate-700/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm text-purple-400">{job.id}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[job.status]}`}>
                        {job.status}
                      </span>
                      <span className="text-slate-400 text-xs">{typeLabels[job.type]}</span>
                    </div>
                    {job.name && <p className="text-white font-medium mb-1">{job.name}</p>}
                    <p className="text-slate-400 text-sm">Created {formatDate(job.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-300 text-sm">Attempt {job.attempts}/{job.maxAttempts}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                ← Previous
              </button>
              <span className="text-slate-300 text-sm">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
