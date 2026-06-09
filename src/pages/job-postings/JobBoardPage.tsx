import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import * as jobPostingService from '@services/job-posting.service'
import ScoreRing from '@components/ScoreRing'
import type { JobPostingItem, JobPostingFilters, PaginatedJobPostings } from '@/types/index'

const SOURCE_COLORS: Record<string, string> = {
  linkedin: 'bg-blue-50 text-blue-700 border-blue-100',
  indeed: 'bg-violet-50 text-violet-700 border-violet-100',
  glassdoor: 'bg-green-50 text-green-700 border-green-100',
  greenhouse: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  lever: 'bg-orange-50 text-orange-700 border-orange-100',
  ashby: 'bg-pink-50 text-pink-700 border-pink-100',
  workable: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  smartrecruiters: 'bg-indigo-50 text-indigo-700 border-indigo-100',
}

const EXP_LEVELS = ['', 'junior', 'mid', 'senior', 'staff', 'principal']
const WORK_MODES = ['', 'remote', 'hybrid', 'onsite']
const SORT_OPTIONS = [
  { value: 'score', label: 'Best Match' },
  { value: 'postedAt', label: 'Newest' },
  { value: 'salaryMin', label: 'Salary' },
  { value: 'createdAt', label: 'Added' },
]

// ─── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({ posting }: { posting: JobPostingItem }) {
  const navigate = useNavigate()
  const techs = (posting.technologiesReq as string[] | undefined) ?? []
  const sourceClass = SOURCE_COLORS[posting.source] ?? 'bg-gray-50 text-gray-600 border-gray-100'

  const relativeDate = (iso?: string) => {
    if (!iso) return null
    const diff = Date.now() - new Date(iso).getTime()
    const days = Math.floor(diff / 86_400_000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 30) return `${days}d ago`
    return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
  }

  return (
    <div
      onClick={() => navigate(`/job-postings/${posting.id}`)}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-ink text-sm leading-snug line-clamp-2 group-hover:text-gray-700">
            {posting.title}
          </h3>
          <p className="text-ink-secondary text-sm mt-0.5 truncate">{posting.company}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {posting.locations.slice(0, 3).map((loc) => (
              <span
                key={loc}
                className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100"
              >
                {loc}
              </span>
            ))}
            {posting.locations.length > 3 && (
              <span className="text-xs text-gray-400">+{posting.locations.length - 3}</span>
            )}
          </div>
        </div>
        <ScoreRing score={posting.matchScore} size="md" />
      </div>

      {techs.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          {techs.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-100"
            >
              {tech}
            </span>
          ))}
          {techs.length > 5 && (
            <span className="text-xs text-gray-400">+{techs.length - 5}</span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${sourceClass}`}>
            {posting.source}
          </span>
          {posting.workMode && (
            <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
              {posting.workMode}
            </span>
          )}
          {posting.experienceLevel && (
            <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
              {posting.experienceLevel}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {relativeDate(posting.postedAt)}
        </span>
      </div>

      {posting.reasoning && (
        <p className="mt-3 text-xs text-gray-500 italic line-clamp-2 border-t border-gray-50 pt-2">
          {posting.reasoning}
        </p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobBoardPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Derive filters from URL — survives navigate-away-and-back
  const filters: JobPostingFilters = {
    page: Number(searchParams.get('page') ?? 1),
    limit: 20,
    sortBy: (searchParams.get('sortBy') as JobPostingFilters['sortBy']) ?? 'score',
    sortDir: (searchParams.get('sortDir') as 'asc' | 'desc') ?? 'desc',
    query: searchParams.get('query') || undefined,
    locations: searchParams.get('locations') || undefined,
    technologies: searchParams.get('technologies') || undefined,
    experienceLevel: searchParams.get('experienceLevel') || undefined,
    workMode: searchParams.get('workMode') || undefined,
    minScore: searchParams.get('minScore') ? Number(searchParams.get('minScore')) : undefined,
  }

  const [result, setResult] = useState<PaginatedJobPostings | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(searchParams.get('query') ?? '')
  const [locationsInput, setLocationsInput] = useState(searchParams.get('locations') ?? '')
  const [technologiesInput, setTechnologiesInput] = useState(searchParams.get('technologies') ?? '')

  const searchParamsStr = searchParams.toString()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await jobPostingService.listJobPostings(filters)
      setResult(data)
    } catch {
      toast.error('Failed to load job postings')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsStr])

  useEffect(() => {
    load()
  }, [load])

  const setFilter = <K extends keyof JobPostingFilters>(key: K, value: JobPostingFilters[K]) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === undefined || value === null) {
        next.delete(key)
      } else {
        next.set(key, String(value))
      }
      if (key !== 'page') next.set('page', '1')
      return next
    })
  }

  const handleSearch = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', '1')
      if (searchInput) next.set('query', searchInput); else next.delete('query')
      if (locationsInput) next.set('locations', locationsInput); else next.delete('locations')
      if (technologiesInput) next.set('technologies', technologiesInput); else next.delete('technologies')
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Job Board</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {result ? `${result.total} postings` : '—'} — scored against your profile
          </p>
        </div>
        <button
          onClick={() => navigate('/saved-searches')}
          className="px-4 py-2 bg-ink hover:bg-gray-800 text-white font-medium rounded-lg transition-colors text-sm"
        >
          Manage Searches
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex flex-1 min-w-[200px] gap-2">
            <input
              type="text"
              placeholder="Search title or company…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-ink placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
            />
            <button
              onClick={handleSearch}
              className="px-3 py-2 bg-ink text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Locations */}
          <input
            type="text"
            placeholder="Locations (e.g. New York, Remote)"
            value={locationsInput}
            onChange={(e) => setLocationsInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm text-ink placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
          />

          {/* Technologies */}
          <input
            type="text"
            placeholder="Technologies (e.g. React, Node.js)"
            value={technologiesInput}
            onChange={(e) => setTechnologiesInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm text-ink placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
          />

          {/* Experience Level */}
          <select
            value={filters.experienceLevel ?? ''}
            onChange={(e) => setFilter('experienceLevel', e.target.value || undefined)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-gray-400 transition-colors bg-white"
          >
            <option value="">All levels</option>
            {EXP_LEVELS.filter(Boolean).map((l) => (
              <option key={l} value={l}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </option>
            ))}
          </select>

          {/* Work Mode */}
          <select
            value={filters.workMode ?? ''}
            onChange={(e) => setFilter('workMode', e.target.value || undefined)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-gray-400 transition-colors bg-white"
          >
            <option value="">All modes</option>
            {WORK_MODES.filter(Boolean).map((m) => (
              <option key={m} value={m}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>

          {/* Min Score */}
          <select
            value={filters.minScore ?? ''}
            onChange={(e) =>
              setFilter('minScore', e.target.value ? Number(e.target.value) : undefined)
            }
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-gray-400 transition-colors bg-white"
          >
            <option value="">Any score</option>
            <option value="40">40+ match</option>
            <option value="60">60+ match</option>
            <option value="75">75+ match</option>
            <option value="90">90+ match</option>
          </select>

          {/* Sort */}
          <div className="flex items-center gap-1">
            <select
              value={filters.sortBy ?? 'score'}
              onChange={(e) => setFilter('sortBy', e.target.value as JobPostingFilters['sortBy'])}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-gray-400 transition-colors bg-white"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                setFilter('sortDir', filters.sortDir === 'desc' ? 'asc' : 'desc')
              }
              className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-gray-600 hover:border-gray-400 transition-colors"
              title="Toggle sort direction"
            >
              {filters.sortDir === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {(filters.query || filters.experienceLevel || filters.workMode || filters.minScore || filters.locations || filters.technologies) && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100">
            {filters.query && (
              <Chip label={`"${filters.query}"`} onRemove={() => { setFilter('query', undefined); setSearchInput('') }} />
            )}
            {filters.locations && (
              <Chip label={`Loc: ${filters.locations}`} onRemove={() => { setFilter('locations', undefined); setLocationsInput('') }} />
            )}
            {filters.technologies && (
              <Chip label={`Tech: ${filters.technologies}`} onRemove={() => { setFilter('technologies', undefined); setTechnologiesInput('') }} />
            )}
            {filters.experienceLevel && (
              <Chip label={filters.experienceLevel} onRemove={() => setFilter('experienceLevel', undefined)} />
            )}
            {filters.workMode && (
              <Chip label={filters.workMode} onRemove={() => setFilter('workMode', undefined)} />
            )}
            {filters.minScore && (
              <Chip label={`Score ≥${filters.minScore}`} onRemove={() => setFilter('minScore', undefined)} />
            )}

          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="flex gap-1 mt-2">
                    <div className="h-5 bg-gray-100 rounded-full w-16" />
                    <div className="h-5 bg-gray-100 rounded-full w-12" />
                  </div>
                </div>
                <div className="w-14 h-14 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : result?.postings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-16 text-center">
          <p className="text-ink font-medium">No postings found</p>
          <p className="text-gray-500 text-sm mt-1">
            Try adjusting your filters or{' '}
            <button
              onClick={() => navigate('/saved-searches')}
              className="text-ink underline underline-offset-2"
            >
              create a saved search
            </button>{' '}
            to start scraping.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result?.postings.map((posting) => (
            <JobCard key={posting.id} posting={posting} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {result && result.pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-gray-500">
            Page {result.page} of {result.pages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={result.page <= 1}
              onClick={() => setFilter('page', (filters.page ?? 1) - 1)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <button
              disabled={result.page >= result.pages}
              onClick={() => setFilter('page', (filters.page ?? 1) + 1)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-ink text-white px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:opacity-70 leading-none">
        ×
      </button>
    </span>
  )
}
