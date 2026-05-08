import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import * as jobService from '@services/job.service'
import { Job } from '@types/index'
import toast from 'react-hot-toast'

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

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState({ result: true, logs: true })

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    const fetchJob = async () => {
      if (!id) return
      try {
        setLoading(true)
        const data = await jobService.getJob(id)
        setJob(data)
        const terminal = ['completed', 'failed', 'cancelled']
        if (terminal.includes(data.status) && interval) {
          clearInterval(interval)
          interval = null
        }
      } catch (error) {
        console.error('Failed to fetch job:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
    interval = setInterval(fetchJob, 3000)
    return () => { if (interval) clearInterval(interval) }
  }, [id])

  const handleRetry = async () => {
    if (!id) return
    try {
      setActionLoading(true)
      await jobService.retryJob(id)
      const updated = await jobService.getJob(id)
      setJob(updated)
    } catch (error) {
      console.error('Failed to retry job:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!id) return
    if (!window.confirm('Cancel this job? This action cannot be undone.')) return

    try {
      setActionLoading(true)
      await jobService.cancelJob(id)
      toast.success('Job cancelled')
      navigate('/jobs')
    } catch (error) {
      console.error('Failed to cancel job:', error)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-300">Loading job details...</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-12 rounded-xl text-center">
        <p className="text-slate-400 text-lg">Job not found</p>
        <button
          onClick={() => navigate('/jobs')}
          className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          Back to Jobs
        </button>
      </div>
    )
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Job {job.id}</h1>
          <p className="text-slate-400 mt-2">{job.name || typeLabels[job.type]}</p>
        </div>
        <div className="flex gap-2">
          {(job.status === 'failed' || job.status === 'cancelled') && (
            <button
              onClick={handleRetry}
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {actionLoading ? 'Retrying...' : 'Retry'}
            </button>
          )}
          {(job.status === 'pending' || job.status === 'active') && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {actionLoading ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
          <button
            onClick={() => navigate('/jobs')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl">
          <p className="text-slate-400 text-sm font-medium">Type</p>
          <p className="text-white text-2xl font-bold mt-2">{typeLabels[job.type]}</p>
        </div>

        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl">
          <p className="text-slate-400 text-sm font-medium">Status</p>
          <div className={`text-2xl font-bold mt-2 inline-block px-3 py-1 rounded-lg ${statusColors[job.status]}`}>
            {job.status}
          </div>
        </div>

        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl">
          <p className="text-slate-400 text-sm font-medium">Attempts</p>
          <p className="text-white text-2xl font-bold mt-2">
            {job.attempts}/{job.maxAttempts}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Job Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-slate-400 text-sm">Created</p>
              <p className="text-white font-mono text-sm">{formatDate(job.createdAt)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Updated</p>
              <p className="text-white font-mono text-sm">{formatDate(job.updatedAt)}</p>
            </div>
            {job.startedAt && (
              <div>
                <p className="text-slate-400 text-sm">Started</p>
                <p className="text-white font-mono text-sm">{formatDate(job.startedAt)}</p>
              </div>
            )}
            {job.completedAt && (
              <div>
                <p className="text-slate-400 text-sm">Completed</p>
                <p className="text-white font-mono text-sm">{formatDate(job.completedAt)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Payload</h3>
          <pre className="bg-slate-900/50 p-3 rounded text-slate-300 text-xs overflow-auto max-h-48">
            {JSON.stringify(job.payload, null, 2)}
          </pre>
        </div>
      </div>

      {job.result && (
        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 rounded-xl overflow-hidden">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, result: !expandedSections.result })}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/60 transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">Result</h3>
            <span className={`transition-transform ${expandedSections.result ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {expandedSections.result && (
            <div className="px-6 pb-4 border-t border-slate-700/30">
              <pre className="bg-slate-900/50 p-3 rounded text-slate-300 text-xs overflow-auto max-h-64">
                {JSON.stringify(job.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {job.error && (
        <div className="backdrop-blur-md bg-red-500/10 border border-red-500/30 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-red-400 mb-3">Error</h3>
          <pre className="text-red-300 text-sm overflow-auto max-h-48">
            {typeof job.error === 'string' ? job.error : JSON.stringify(job.error, null, 2)}
          </pre>
        </div>
      )}

      <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 rounded-xl overflow-hidden">
        <button
          onClick={() => setExpandedSections({ ...expandedSections, logs: !expandedSections.logs })}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/60 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white">Logs</h3>
          <span className={`transition-transform ${expandedSections.logs ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {expandedSections.logs && (
          <div className="px-6 pb-4 border-t border-slate-700/30">
            <p className="text-slate-400 text-sm">Logs will appear as job executes. Refresh to see latest.</p>
          </div>
        )}
      </div>
    </div>
  )
}
