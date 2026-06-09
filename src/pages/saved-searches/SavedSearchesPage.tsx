import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import * as savedSearchService from '@services/saved-search.service'
import type { SavedSearch, CreateSavedSearchInput, ScrapeSource } from '@/types/index'

const CRON_LABELS: Record<string, string> = {
  '0 * * * *': 'Every hour',
  '0 */6 * * *': 'Every 6 hours',
  '0 8,20 * * *': 'Twice daily',
  '0 8 * * *': 'Daily at 8am',
  '0 9 * * 1': 'Weekly (Mon 9am)',
}

const ALL_SOURCES: ScrapeSource[] = [
  'linkedin', 'indeed', 'glassdoor', 'greenhouse', 'lever', 'ashby', 'workable', 'smartrecruiters',
]

const SOURCE_COLORS: Record<string, string> = {
  linkedin: 'bg-blue-50 text-blue-700',
  indeed: 'bg-violet-50 text-violet-700',
  glassdoor: 'bg-green-50 text-green-700',
  greenhouse: 'bg-emerald-50 text-emerald-700',
  lever: 'bg-orange-50 text-orange-700',
  ashby: 'bg-pink-50 text-pink-700',
  workable: 'bg-cyan-50 text-cyan-700',
  smartrecruiters: 'bg-indigo-50 text-indigo-700',
}

const CRON_PRESETS = [
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Twice daily', value: '0 8,20 * * *' },
  { label: 'Daily at 8am', value: '0 8 * * *' },
  { label: 'Weekly (Mon 9am)', value: '0 9 * * 1' },
]

interface FormState {
  name: string
  query: string
  locations: string
  sources: ScrapeSource[]
  cronExpr: string
}

const EMPTY_FORM: FormState = {
  name: '', query: '', locations: '', sources: [], cronExpr: '',
}

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [triggeringId, setTriggeringId] = useState<string | null>(null)

  const load = async () => {
    try {
      const data = await savedSearchService.listSavedSearches()
      setSearches(data)
    } catch {
      toast.error('Failed to load saved searches')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.name.trim() || !form.query.trim() || !form.locations.trim() || !form.sources.length) {
      toast.error('Fill in all required fields and select at least one source')
      return
    }

    setSaving(true)
    try {
      const input: CreateSavedSearchInput = {
        name: form.name.trim(),
        query: form.query.trim(),
        locations: form.locations.split(',').map((l) => l.trim()).filter(Boolean),
        sources: form.sources,
        cronExpr: form.cronExpr || undefined,
      }
      const created = await savedSearchService.createSavedSearch(input)
      setSearches((prev) => [created, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
      toast.success('Saved search created')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? (err instanceof Error ? err.message : null)
        ?? 'Failed to create saved search'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this saved search?')) return
    try {
      await savedSearchService.deleteSavedSearch(id)
      setSearches((prev) => prev.filter((s) => s.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleToggle = async (id: string) => {
    try {
      const updated = await savedSearchService.toggleSavedSearch(id)
      setSearches((prev) => prev.map((s) => (s.id === id ? updated : s)))
    } catch {
      toast.error('Failed to toggle')
    }
  }

  const handleUpdateCron = async (id: string, cronExpr: string | undefined) => {
    try {
      const updated = await savedSearchService.updateSavedSearch(id, { cronExpr })
      setSearches((prev) => prev.map((s) => (s.id === id ? updated : s)))
      toast.success(cronExpr ? 'Schedule updated' : 'Schedule removed')
    } catch {
      toast.error('Failed to update schedule')
    }
  }

  const handleTrigger = async (id: string) => {
    setTriggeringId(id)
    try {
      const result = await savedSearchService.triggerSavedSearch(id)
      toast.success(`Queued ${result.queued} scrape job${result.queued !== 1 ? 's' : ''}`)
    } catch {
      toast.error('Failed to trigger scrape')
    } finally {
      setTriggeringId(null)
    }
  }

  const toggleSource = (src: ScrapeSource) => {
    setForm((prev) => ({
      ...prev,
      sources: prev.sources.includes(src)
        ? prev.sources.filter((s) => s !== src)
        : [...prev.sources, src],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Saved Searches</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Automate job scraping across platforms
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-ink hover:bg-gray-800 text-white font-medium rounded-lg transition-colors text-sm"
        >
          {showForm ? 'Cancel' : '+ New Search'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-ink">New Saved Search</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Name *</label>
              <input
                type="text"
                placeholder="e.g. Senior React Developer"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-ink placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Query *</label>
              <input
                type="text"
                placeholder="e.g. React developer TypeScript"
                value={form.query}
                onChange={(e) => setForm((p) => ({ ...p, query: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-ink placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Locations * <span className="font-normal text-gray-400">(comma-separated)</span>
              </label>
              <input
                type="text"
                placeholder="Ontario, Remote, Toronto"
                value={form.locations}
                onChange={(e) => setForm((p) => ({ ...p, locations: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-ink placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Schedule <span className="font-normal text-gray-400">(optional cron)</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={CRON_PRESETS.find((p) => p.value === form.cronExpr)?.value ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, cronExpr: e.target.value }))}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-gray-400 transition-colors bg-white"
                >
                  <option value="">One-time / manual</option>
                  {CRON_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Sources *</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SOURCES.map((src) => {
                const selected = form.sources.includes(src)
                return (
                  <button
                    key={src}
                    onClick={() => toggleSource(src)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                      selected
                        ? 'bg-ink text-white border-ink'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {src}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="px-4 py-2 bg-ink hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              {saving ? 'Creating…' : 'Create Search'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-100 rounded-lg w-16" />
                  <div className="h-8 bg-gray-100 rounded-lg w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : searches.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-16 text-center">
          <p className="text-ink font-medium">No saved searches yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Create one above to start scraping jobs automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((search) => (
            <SearchRow
              key={search.id}
              search={search}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onTrigger={handleTrigger}
              onUpdateCron={handleUpdateCron}
              triggering={triggeringId === search.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SearchRow({
  search,
  onDelete,
  onToggle,
  onTrigger,
  onUpdateCron,
  triggering,
}: {
  search: SavedSearch
  onDelete: (id: string) => void
  onToggle: (id: string) => void
  onTrigger: (id: string) => void
  onUpdateCron: (id: string, cronExpr: string | undefined) => void
  triggering: boolean
}) {
  const [editingCron, setEditingCron] = useState(false)
  const [cronDraft, setCronDraft] = useState(search.cronExpr ?? '')

  const saveCron = () => {
    onUpdateCron(search.id, cronDraft || undefined)
    setEditingCron(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-ink text-sm">{search.name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                search.isActive
                  ? 'bg-green-50 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {search.isActive ? 'active' : 'paused'}
            </span>
          </div>

          <p className="text-gray-600 text-sm mt-0.5">
            <span className="font-medium text-ink">"{search.query}"</span>
            {' — '}
            {search.locations.join(', ')}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {search.sources.map((src) => (
              <span
                key={src}
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  SOURCE_COLORS[src] ?? 'bg-gray-50 text-gray-600'
                }`}
              >
                {src}
              </span>
            ))}
          </div>

          {/* Cron schedule row */}
          <div className="mt-2 flex items-center gap-2">
            {editingCron ? (
              <>
                <select
                  value={cronDraft}
                  onChange={(e) => setCronDraft(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-gray-400"
                >
                  <option value="">Manual only</option>
                  {CRON_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <button onClick={saveCron} className="text-xs text-green-600 hover:text-green-800 font-medium">Save</button>
                <button onClick={() => { setEditingCron(false); setCronDraft(search.cronExpr ?? '') }} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
              </>
            ) : (
              <>
                <span className="text-xs text-gray-400">
                  {search.cronExpr
                    ? (CRON_LABELS[search.cronExpr] ?? search.cronExpr)
                    : 'No schedule'}
                </span>
                <button
                  onClick={() => setEditingCron(true)}
                  className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                >
                  {search.cronExpr ? 'Edit' : 'Set schedule'}
                </button>
              </>
            )}
          </div>

          {search.lastRunAt && (
            <p className="text-xs text-gray-400 mt-1">
              Last run: {new Date(search.lastRunAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onTrigger(search.id)}
            disabled={triggering}
            className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-700 hover:border-gray-400 hover:text-ink disabled:opacity-50 transition-all"
          >
            {triggering ? 'Running…' : '▶ Run now'}
          </button>
          <button
            onClick={() => onToggle(search.id)}
            className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-all ${
              search.isActive
                ? 'border-gray-200 text-gray-600 hover:border-gray-400'
                : 'border-green-200 text-green-700 hover:border-green-400'
            }`}
          >
            {search.isActive ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={() => onDelete(search.id)}
            className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-danger hover:border-danger hover:bg-red-50 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
