import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { useDashboardStats } from '@hooks/useDashboardStats'
import { StatsRange } from '@services/job.service'
import { getJobBoardStats } from '@services/job-posting.service'
import type { JobBoardStats } from '@services/job-posting.service'

const STATUS_COLORS: Record<string, string> = {
  completed: 'text-green-700 bg-green-50',
  pending: 'text-blue-700 bg-blue-50',
  active: 'text-amber-700 bg-amber-50',
  failed: 'text-red-700 bg-red-50',
  cancelled: 'text-gray-600 bg-gray-100',
}

const PIE_COLORS = ['#111111', '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

const RANGES: { label: string; value: StatsRange }[] = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
]

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60_000).toFixed(1)}m`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatLastUpdated(date: Date | null): string {
  if (!date) return ''
  const diffS = Math.round((Date.now() - date.getTime()) / 1000)
  if (diffS < 5) return 'just now'
  return `${diffS}s ago`
}

export default function DashboardPage() {
  const [range, setRange] = useState<StatsRange>('7d')
  const { stats, loading, error, lastUpdated } = useDashboardStats(range)
  const navigate = useNavigate()
  const [boardStats, setBoardStats] = useState<JobBoardStats | null>(null)

  useEffect(() => {
    getJobBoardStats().then(setBoardStats).catch(() => {})
  }, [])

  const counts = stats?.counts
  const byTypeData = stats
    ? Object.entries(stats.byType).map(([name, value]) => ({ name, value }))
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111111]">Dashboard</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Monitor your job processing pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">Updated {formatLastUpdated(lastUpdated)}</span>
          )}
          <button
            onClick={() => navigate('/jobs/create')}
            className="px-3 py-1.5 bg-[#111111] hover:bg-gray-800 text-white font-medium rounded-md transition-colors text-sm"
          >
            + Create Job
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && !stats && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
          Failed to load stats: {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Jobs" value={counts?.total ?? 0} loading={loading && !stats} />
        <StatCard label="Active" value={counts?.active ?? 0} color="text-amber-600" loading={loading && !stats} />
        <StatCard label="Failed" value={counts?.failed ?? 0} color="text-red-600" loading={loading && !stats} />
        <StatCard
          label="Success Rate"
          value={stats ? `${stats.successRate}%` : '—'}
          color="text-green-600"
          loading={loading && !stats}
          sub={stats && stats.avgDurationMs > 0 ? `avg ${formatDuration(stats.avgDurationMs)}` : undefined}
        />
      </div>

      {/* Job board stats */}
      {boardStats && boardStats.totalScored > 0 && (
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-[#111111]">Job Board</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
            {/* Summary */}
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Postings scored</p>
                <p className="text-2xl font-semibold text-[#111111] mt-1">{boardStats.totalScored}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Avg match score</p>
                <p className={`text-2xl font-semibold mt-1 ${(boardStats.avgScore ?? 0) >= 70 ? 'text-green-600' : (boardStats.avgScore ?? 0) >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                  {boardStats.avgScore ?? '—'}
                </p>
              </div>
            </div>

            {/* Score distribution */}
            <div className="p-4">
              <p className="text-xs text-gray-500 uppercase font-medium mb-3">Score distribution</p>
              <div className="space-y-2">
                {boardStats.scoreDistribution.map(({ bracket, count }) => {
                  const pct = boardStats.totalScored > 0 ? Math.round((count / boardStats.totalScored) * 100) : 0
                  return (
                    <div key={bracket} className="flex items-center gap-2 text-xs">
                      <span className="w-10 text-gray-500 shrink-0">{bracket}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-[#111111] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-gray-500">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top matches */}
            <div className="p-4">
              <p className="text-xs text-gray-500 uppercase font-medium mb-3">Top matches</p>
              <div className="space-y-2">
                {boardStats.topMatches.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => navigate(`/job-postings/${m.id}`)}
                    className="w-full text-left flex items-center justify-between gap-2 hover:bg-gray-50 rounded px-1 py-0.5 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#111111] truncate">{m.title}</p>
                      <p className="text-xs text-gray-400 truncate">{m.company}</p>
                    </div>
                    <span className={`text-xs font-semibold shrink-0 ${m.score >= 70 ? 'text-green-600' : m.score >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                      {m.score}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Range selector + charts */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-[#111111]">Jobs Over Time</h2>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  range === r.value
                    ? 'bg-[#111111] text-white'
                    : 'text-gray-500 hover:text-[#111111] hover:bg-gray-100'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {/* Line chart */}
          <div className="lg:col-span-2 p-4">
            {loading && !stats ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
            ) : stats && stats.timeSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.timeSeries} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    name="Completed"
                  />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    name="Failed"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                No data for this period
              </div>
            )}
          </div>

          {/* Pie chart */}
          <div className="p-4 flex flex-col items-center justify-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 self-start">By Type</p>
            {byTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={byTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {byTypeData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: 11, color: '#6b7280' }}>{value}</span>}
                  />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No jobs yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent jobs */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-[#111111]">Recent Jobs</h2>
          <button
            onClick={() => navigate('/jobs')}
            className="text-gray-500 hover:text-[#111111] text-sm transition-colors"
          >
            View all →
          </button>
        </div>

        {loading && !stats ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : !stats?.recentJobs.length ? (
          <div className="px-4 py-8 text-center">
            <p className="text-gray-400 text-sm">No jobs yet. Create your first job to get started.</p>
            <button
              onClick={() => navigate('/jobs/create')}
              className="mt-3 px-3 py-1.5 bg-[#111111] hover:bg-gray-800 text-white text-sm font-medium rounded-md transition-colors"
            >
              Create Job
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-xs font-medium text-gray-500 uppercase text-left py-2 px-3 border-b border-gray-100">ID</th>
                <th className="text-xs font-medium text-gray-500 uppercase text-left py-2 px-3 border-b border-gray-100">Name / Type</th>
                <th className="text-xs font-medium text-gray-500 uppercase text-left py-2 px-3 border-b border-gray-100">Status</th>
                <th className="text-xs font-medium text-gray-500 uppercase text-left py-2 px-3 border-b border-gray-100">Duration</th>
                <th className="text-xs font-medium text-gray-500 uppercase text-left py-2 px-3 border-b border-gray-100">Created</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentJobs.map((job) => (
                <tr
                  key={job.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <td className="py-2 px-3 border-b border-gray-50 font-mono text-xs text-gray-400">
                    {job.id.slice(0, 8)}…
                  </td>
                  <td className="py-2 px-3 border-b border-gray-50">
                    <span className="text-sm text-gray-800">{job.name ?? job.type}</span>
                    {job.name && (
                      <span className="ml-1.5 text-xs text-gray-400">{job.type}</span>
                    )}
                  </td>
                  <td className="py-2 px-3 border-b border-gray-50">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[job.status] ?? 'text-gray-600 bg-gray-100'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 border-b border-gray-50 text-sm text-gray-500">
                    {job.duration != null ? formatDuration(job.duration) : '—'}
                  </td>
                  <td className="py-2 px-3 border-b border-gray-50 text-sm text-gray-500">
                    {formatDate(job.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number | string
  color?: string
  loading?: boolean
  sub?: string
}

function StatCard({ label, value, color = 'text-[#111111]', loading, sub }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-md">
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
      {loading ? (
        <div className="h-8 w-16 bg-gray-100 rounded animate-pulse mt-1.5" />
      ) : (
        <>
          <p className={`text-2xl font-semibold mt-1.5 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </>
      )}
    </div>
  )
}
