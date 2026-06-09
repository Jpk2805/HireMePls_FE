import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import * as applicationService from '@services/application.service'
import type { Application, ApplicationStatus, ApplicationStats } from '@services/application.service'
import { STATUS_LABELS, STATUS_COLORS, APPLICATION_STATUSES } from '@services/application.service'

const PIPELINE: ApplicationStatus[] = ['applied', 'phone_screen', 'onsite', 'offer', 'rejected', 'withdrawn']

const SOURCE_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  indeed: 'Indeed',
  glassdoor: 'Glassdoor',
  greenhouse: 'Greenhouse',
  lever: 'Lever',
  ashby: 'Ashby',
  workable: 'Workable',
  smartrecruiters: 'SmartRecruiters',
  wellfound: 'Wellfound',
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [stats, setStats] = useState<ApplicationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      applicationService.listApplications(),
      applicationService.getApplicationStats(),
    ])
      .then(([list, s]) => { setApps(list); setStats(s) })
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (app: Application, status: ApplicationStatus) => {
    try {
      const updated = await applicationService.updateApplicationStatus(app.id, status)
      setApps((prev) => prev.map((a) => a.id === updated.id ? updated : a))
      applicationService.getApplicationStats().then(setStats).catch(() => toast.error('Failed to refresh stats'))
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this application?')) return
    try {
      await applicationService.deleteApplication(id)
      setApps((prev) => prev.filter((a) => a.id !== id))
      applicationService.getApplicationStats().then(setStats).catch(() => toast.error('Failed to refresh stats'))
      toast.success('Application removed')
    } catch {
      toast.error('Failed to remove application')
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-400 text-sm">Loading applications…</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#111111]">Applications</h1>
        <p className="text-gray-500 mt-0.5 text-sm">Track your job applications through the pipeline</p>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {PIPELINE.map((s) => {
          const count = apps.filter((a) => a.status === s).length
          return (
            <div key={s} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-semibold text-[#111111]">{count}</div>
              <div className="text-xs text-gray-500 mt-0.5">{STATUS_LABELS[s]}</div>
            </div>
          )
        })}
      </div>

      {/* Insights — only shown when there's data */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Source effectiveness */}
          {stats.bySource.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase mb-3">Source Effectiveness</h2>
              <div className="space-y-2">
                {stats.bySource.map((row) => (
                  <div key={row.source} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{SOURCE_LABELS[row.source] ?? row.source}</span>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{row.applied} applied</span>
                      <span className={`font-medium ${row.rate >= 30 ? 'text-green-600' : row.rate >= 10 ? 'text-amber-600' : 'text-gray-400'}`}>
                        {row.rate}% interview
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Avg score by status */}
          {stats.avgScoreByStatus.some((s) => s.avgScore !== null) && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase mb-3">Avg AI Score by Stage</h2>
              <div className="space-y-2">
                {stats.avgScoreByStatus.filter((s) => s.avgScore !== null).map((row) => (
                  <div key={row.status} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{STATUS_LABELS[row.status]}</span>
                    <span className={`text-xs font-medium ${(row.avgScore ?? 0) >= 70 ? 'text-green-600' : (row.avgScore ?? 0) >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                      {row.avgScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {apps.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-md p-10 text-center">
          <p className="text-gray-500 text-sm">No applications yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Mark a job posting as Applied, or use the "Track Application" option on the job detail page.
          </p>
          <button
            onClick={() => navigate('/job-postings')}
            className="mt-4 px-3 py-1.5 bg-[#111111] hover:bg-gray-800 text-white font-medium rounded-md transition-colors text-sm"
          >
            Browse Job Board
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <table className="table-fixed w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-xs font-medium text-gray-500 uppercase text-left py-2 px-3 border-b border-gray-100">Role</th>
                <th className="text-xs font-medium text-gray-500 uppercase text-left py-2 px-3 border-b border-gray-100 w-[140px]">Company</th>
                <th className="text-xs font-medium text-gray-500 uppercase text-left py-2 px-3 border-b border-gray-100 w-[110px]">Applied</th>
                <th className="text-xs font-medium text-gray-500 uppercase text-left py-2 px-3 border-b border-gray-100 w-[180px]">Status</th>
                <th className="text-xs font-medium text-gray-500 uppercase text-right py-2 px-3 border-b border-gray-100 w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-3 border-b border-gray-50">
                    <button
                      onClick={() => navigate(`/job-postings/${app.jobPostingId}`)}
                      className="text-sm font-medium text-[#111111] hover:underline underline-offset-2 text-left truncate block max-w-xs"
                      title={app.jobPosting.title}
                    >
                      {app.jobPosting.title}
                    </button>
                  </td>
                  <td className="py-2 px-3 border-b border-gray-50 text-sm text-gray-600 truncate">
                    {app.jobPosting.company}
                  </td>
                  <td className="py-2 px-3 border-b border-gray-50 text-sm text-gray-500">
                    {formatDate(app.appliedAt)}
                  </td>
                  <td className="py-2 px-3 border-b border-gray-50">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app, e.target.value as ApplicationStatus)}
                      className={`text-xs font-medium px-2 py-0.5 rounded border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 ${STATUS_COLORS[app.status]}`}
                    >
                      {APPLICATION_STATUSES.map((s: ApplicationStatus) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-3 border-b border-gray-50 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/job-postings/${app.jobPostingId}/outreach`)}
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Outreach
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
