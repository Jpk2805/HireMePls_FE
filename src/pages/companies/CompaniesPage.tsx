import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import * as companyService from '@services/company.service'
import type { Company, CompanyWatch, CreateCompanyInput, AtsType } from '@/types/index'

const ATS_TYPES: AtsType[] = [
  'greenhouse', 'lever', 'ashby', 'workable', 'smartrecruiters', 'bamboohr', 'custom',
]

const ATS_COLORS: Record<string, string> = {
  greenhouse: 'bg-emerald-50 text-emerald-700',
  lever: 'bg-orange-50 text-orange-700',
  ashby: 'bg-pink-50 text-pink-700',
  workable: 'bg-cyan-50 text-cyan-700',
  smartrecruiters: 'bg-indigo-50 text-indigo-700',
  bamboohr: 'bg-lime-50 text-lime-700',
  custom: 'bg-gray-100 text-gray-600',
}

interface FormState {
  name: string
  domain: string
  atsType: AtsType
  atsSlug: string
  careerUrl: string
}

const EMPTY_FORM: FormState = {
  name: '', domain: '', atsType: 'greenhouse', atsSlug: '', careerUrl: '',
}

type Tab = 'watchlist' | 'browse'

export default function CompaniesPage() {
  const [tab, setTab] = useState<Tab>('watchlist')
  const [watchlist, setWatchlist] = useState<CompanyWatch[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        const data = await companyService.getWatchedCompanies()
        setWatchlist(data)
        setWatchedIds(new Set(data.map((w) => w.companyId)))
      } catch {
        toast.error('Failed to load watchlist')
      } finally {
        setLoading(false)
      }
    }
    loadWatchlist()
  }, [])

  useEffect(() => {
    if (tab !== 'browse') return
    companyService
      .listCompanies(searchQuery || undefined)
      .then(setCompanies)
      .catch(() => toast.error('Failed to load companies'))
  }, [tab, searchQuery])

  const handleWatch = async (companyId: string) => {
    setTogglingId(companyId)
    try {
      const watch = await companyService.watchCompany(companyId)
      const company = companies.find((c) => c.id === companyId)
      if (company) {
        setWatchlist((prev) => [...prev, watch])
        setWatchedIds((prev) => new Set([...prev, companyId]))
      }
      toast.success('Added to watchlist')
    } catch {
      toast.error('Failed to watch company')
    } finally {
      setTogglingId(null)
    }
  }

  const handleUnwatch = async (companyId: string) => {
    setTogglingId(companyId)
    try {
      await companyService.unwatchCompany(companyId)
      setWatchlist((prev) => prev.filter((w) => w.companyId !== companyId))
      setWatchedIds((prev) => {
        const next = new Set(prev)
        next.delete(companyId)
        return next
      })
      toast.success('Removed from watchlist')
    } catch {
      toast.error('Failed to unwatch company')
    } finally {
      setTogglingId(null)
    }
  }

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Company name is required')
      return
    }
    setSaving(true)
    try {
      const input: CreateCompanyInput = {
        name: form.name.trim(),
        domain: form.domain.trim() || undefined,
        atsType: form.atsType,
        atsSlug: form.atsSlug.trim() || undefined,
        careerUrl: form.careerUrl.trim() || undefined,
      }
      const created = await companyService.createCompany(input)
      setCompanies((prev) => [created, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
      toast.success('Company added')
    } catch {
      toast.error('Failed to create company')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Companies</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Watch companies to get notified of new postings
          </p>
        </div>
        <button
          onClick={() => { setTab('browse'); setShowForm((v) => !v) }}
          className="px-4 py-2 bg-ink hover:bg-gray-800 text-white font-medium rounded-lg transition-colors text-sm"
        >
          + Add Company
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {(['watchlist', 'browse'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'text-ink border-ink'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {t === 'watchlist' ? `Watchlist (${watchlist.length})` : 'Browse All'}
          </button>
        ))}
      </div>

      {/* Add company form */}
      {showForm && tab === 'browse' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-ink">Add Company</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Name *</label>
              <input
                type="text"
                placeholder="Acme Corp"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-ink placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Domain</label>
              <input
                type="text"
                placeholder="acme.com"
                value={form.domain}
                onChange={(e) => setForm((p) => ({ ...p, domain: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-ink placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">ATS Platform *</label>
              <select
                value={form.atsType}
                onChange={(e) => setForm((p) => ({ ...p, atsType: e.target.value as AtsType }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-gray-400 transition-colors bg-white"
              >
                {ATS_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">ATS Slug</label>
              <input
                type="text"
                placeholder="acmecorp (for greenhouse.io/acmecorp)"
                value={form.atsSlug}
                onChange={(e) => setForm((p) => ({ ...p, atsSlug: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-ink placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Career Page URL</label>
              <input
                type="url"
                placeholder="https://acme.com/careers"
                value={form.careerUrl}
                onChange={(e) => setForm((p) => ({ ...p, careerUrl: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-ink placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              />
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
              {saving ? 'Adding…' : 'Add Company'}
            </button>
          </div>
        </div>
      )}

      {/* Watchlist tab */}
      {tab === 'watchlist' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : watchlist.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-16 text-center">
              <p className="text-ink font-medium">No companies watched yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Browse companies and click Watch to add them here.
              </p>
              <button
                onClick={() => setTab('browse')}
                className="mt-4 px-4 py-2 bg-ink text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Browse Companies
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchlist.map((watch) => (
                <CompanyCard
                  key={watch.id}
                  company={watch.company}
                  watched
                  toggling={togglingId === watch.companyId}
                  onToggle={() => handleUnwatch(watch.companyId)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Browse tab */}
      {tab === 'browse' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search companies…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-ink placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
          {companies.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-16 text-center">
              <p className="text-ink font-medium">No companies found</p>
              <p className="text-gray-500 text-sm mt-1">
                Add a company above to start tracking its job postings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  watched={watchedIds.has(company.id)}
                  toggling={togglingId === company.id}
                  onToggle={() =>
                    watchedIds.has(company.id)
                      ? handleUnwatch(company.id)
                      : handleWatch(company.id)
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CompanyCard({
  company,
  watched,
  toggling,
  onToggle,
}: {
  company: Company
  watched: boolean
  toggling: boolean
  onToggle: () => void
}) {
  const navigate = useNavigate()
  const atsClass = (company.atsType ? ATS_COLORS[company.atsType] : undefined) ?? 'bg-gray-100 text-gray-600'

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-ink text-sm truncate cursor-pointer hover:underline"
            onClick={() => navigate(`/companies/${company.id}`)}
          >
            {company.name}
          </h3>
          {company.domain && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{company.domain}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${atsClass}`}>
            {company.atsType ?? 'discovered'}
          </span>
          {company.autoCreated && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">
              Unverified
            </span>
          )}
        </div>
      </div>

      {company.careerUrl && (
        <a
          href={company.careerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-ink underline underline-offset-2 truncate"
          onClick={(e) => e.stopPropagation()}
        >
          {company.careerUrl.replace(/^https?:\/\//, '')}
        </a>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/companies/${company.id}`)}
          className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
        >
          View Details
        </button>
        <button
          onClick={onToggle}
          disabled={toggling}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all disabled:opacity-50 ${
            watched
              ? 'border-gray-200 text-gray-600 hover:border-danger hover:text-danger hover:bg-red-50'
              : 'border-ink text-ink hover:bg-ink hover:text-white'
          }`}
        >
          {toggling ? '…' : watched ? '✓ Watching' : '+ Watch'}
        </button>
      </div>
    </div>
  )
}
