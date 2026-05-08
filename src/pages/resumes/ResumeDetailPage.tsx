import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import * as resumeService from '@services/resume.service'

interface Resume {
  id: string
  userId: string
  jobId: string
  title?: string
  content?: Record<string, any>
  pdfUrl?: string
  coverLetter?: string
  createdAt: string
  updatedAt: string
  job?: {
    id: string
    status: string
    progress: number
    createdAt: string
  }
}

export default function ResumeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    const fetchResume = async () => {
      if (!id) return
      try {
        setLoading(true)
        const data = await resumeService.getResume(id)
        setResume(data)
        if (data.content) {
          const sections: Record<string, boolean> = {}
          Object.keys(data.content).forEach((key) => {
            sections[key] = true
          })
          setExpandedSections(sections)
        }
        const terminal = ['completed', 'failed', 'cancelled']
        if (terminal.includes(data.job?.status ?? '') && interval) {
          clearInterval(interval)
          interval = null
        }
      } catch (error) {
        console.error('Failed to fetch resume:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResume()
    interval = setInterval(fetchResume, 3000)
    return () => { if (interval) clearInterval(interval) }
  }, [id])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-300">Loading resume...</div>
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-12 rounded-xl text-center">
        <p className="text-slate-400 text-lg">Resume not found</p>
        <button
          onClick={() => navigate('/resumes')}
          className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          Back to Resumes
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">{resume.title ?? 'Resume'}</h1>
          <p className="text-slate-400 mt-2">Generated {formatDate(resume.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          {resume.pdfUrl && (
            <a
              href={resume.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Download PDF
            </a>
          )}
          <button
            onClick={() => navigate('/resumes')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl">
          <p className="text-slate-400 text-sm font-medium">Status</p>
          <div
            className={`text-2xl font-bold mt-2 inline-block px-3 py-1 rounded-lg ${
              resume.job?.status === 'completed'
                ? 'text-green-400 bg-green-500/10'
                : resume.job?.status === 'active'
                  ? 'text-amber-400 bg-amber-500/10'
                  : resume.job?.status === 'failed'
                    ? 'text-red-400 bg-red-500/10'
                    : 'text-blue-400 bg-blue-500/10'
            }`}
          >
            {resume.job?.status ?? 'pending'}
          </div>
        </div>

        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl">
          <p className="text-slate-400 text-sm font-medium">Created</p>
          <p className="text-white text-sm font-mono mt-2">{formatDate(resume.createdAt)}</p>
        </div>

        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl">
          <p className="text-slate-400 text-sm font-medium">Updated</p>
          <p className="text-white text-sm font-mono mt-2">{formatDate(resume.updatedAt)}</p>
        </div>
      </div>

      {resume.content && Object.keys(resume.content).length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Resume Sections</h3>
          <div className="space-y-3">
            {Object.entries(resume.content).map(([key, value]) => (
              <div key={key} className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 rounded-xl overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedSections({
                      ...expandedSections,
                      [key]: !expandedSections[key],
                    })
                  }
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/60 transition-colors"
                >
                  <h4 className="text-lg font-semibold text-white capitalize">{key}</h4>
                  <span className={`transition-transform ${expandedSections[key] ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {expandedSections[key] && (
                  <div className="px-6 pb-4 border-t border-slate-700/30">
                    {typeof value === 'object' ? (
                      <pre className="bg-slate-900/50 p-3 rounded text-slate-300 text-xs overflow-auto max-h-48">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-slate-300 whitespace-pre-wrap">{String(value)}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(resume.job?.status === 'pending' || resume.job?.status === 'active') && (
        <div className="backdrop-blur-md bg-amber-500/10 border border-amber-500/30 p-6 rounded-xl">
          <p className="text-amber-400">Resume generation in progress. This page will update automatically.</p>
        </div>
      )}

      {resume.job?.status === 'failed' && (
        <div className="backdrop-blur-md bg-red-500/10 border border-red-500/30 p-6 rounded-xl">
          <p className="text-red-400">Resume generation failed. Please try again from the Jobs page.</p>
        </div>
      )}
    </div>
  )
}
