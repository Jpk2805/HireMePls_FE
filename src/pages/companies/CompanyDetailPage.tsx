import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import * as reconService from '@services/company-recon.service'
import type { ReconData } from '@services/company-recon.service'
import * as companyService from '@services/company.service'
import type { Company } from '@/types/index'

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [company, setCompany] = useState<Company | null>(null)
  const [recon, setRecon] = useState<ReconData | null>(null)
  const [reconStatus, setReconStatus] = useState<string | null>(null)
  const [loadingRecon, setLoadingRecon] = useState(true)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }

  useEffect(() => {
    if (!id) return

    companyService.getCompany(id).then(setCompany).catch(() => {})

    reconService.getRecon(id).then((res) => {
      setRecon(res.recon)
      setReconStatus(res.reconStatus)
    }).catch(() => {}).finally(() => setLoadingRecon(false))

    return () => stopPolling()
  }, [id])

  useEffect(() => {
    if (reconStatus !== 'pending' || !id) { stopPolling(); return }
    if (pollRef.current) return

    pollRef.current = setInterval(() => {
      reconService.getRecon(id).then((res) => {
        setRecon(res.recon)
        setReconStatus(res.reconStatus)
        if (res.reconStatus !== 'pending') stopPolling()
      }).catch(() => {})
    }, 3000)

    return () => stopPolling()
  }, [reconStatus, id])

  const handleRefreshRecon = async () => {
    if (!id) return
    try {
      setReconStatus('pending')
      await reconService.refreshRecon(id)
    } catch {
      toast.error('Failed to trigger recon refresh')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/companies')} className="text-sm text-gray-500 hover:text-gray-700">
          ← Companies
        </button>
        {company && (
          <h1 className="text-xl font-semibold text-ink">{company.name}</h1>
        )}
      </div>

      {/* Company Recon */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink">Company Recon</h2>
          <button
            onClick={handleRefreshRecon}
            disabled={reconStatus === 'pending'}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {reconStatus === 'pending' ? 'Running…' : 'Refresh'}
          </button>
        </div>

        {loadingRecon ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
          </div>
        ) : reconStatus === 'pending' ? (
          <p className="text-sm text-gray-400">Recon in progress…</p>
        ) : reconStatus === 'failed' ? (
          <p className="text-sm text-gray-400">No recon data available. Try refreshing.</p>
        ) : reconStatus === 'done' ? (
          recon && (recon.funding || recon.headcount || recon.glassdoorRating || (recon.techStack?.length ?? 0) > 0 || (recon.news?.length ?? 0) > 0) ? (
            <div className="space-y-4 text-sm">
              {recon.funding && (
                <div>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Funding</span>
                  <p className="text-gray-800 mt-0.5">{recon.funding}</p>
                </div>
              )}
              {recon.headcount && (
                <div>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Headcount</span>
                  <p className="text-gray-800 mt-0.5">{recon.headcount}</p>
                </div>
              )}
              {(recon.techStack?.length ?? 0) > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Tech Stack</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {recon.techStack.map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {(recon.news?.length ?? 0) > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Recent News</span>
                  <ul className="mt-1.5 space-y-1">
                    {recon.news.map((n, i) => (
                      <li key={i} className="text-gray-700 text-sm">• {n}</li>
                    ))}
                  </ul>
                </div>
              )}
              {recon.glassdoorRating && (
                <div>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Glassdoor</span>
                  <p className="text-gray-800 mt-0.5">{recon.glassdoorRating} / 5</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Recon completed but no data found. Try refreshing.</p>
          )
        ) : (
          <p className="text-sm text-gray-400">No recon data yet. Click Refresh to start.</p>
        )}
      </div>

    </div>
  )
}
