import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as resumeService from '@services/resume.service'

interface Resume {
  id: string
  userId: string
  jobPostingUrl?: string
  workHistory?: string
  sections?: Record<string, any>
  pdfUrl?: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true)
        const response = await resumeService.listResumes({
          page: pagination.page,
          limit: pagination.limit,
        })
        setResumes(response.data)
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        })
      } catch (error) {
        console.error('Failed to fetch resumes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResumes()
  }, [pagination.page])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this resume? This cannot be undone.')) return

    try {
      await resumeService.deleteResume(id)
      setResumes(resumes.filter((r) => r.id !== id))
    } catch (error) {
      console.error('Failed to delete resume:', error)
    }
  }

  if (loading && resumes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-300">Loading resumes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Generated Resumes</h1>
          <p className="text-slate-400 mt-2">View and manage your AI-generated resumes</p>
        </div>
        <button
          onClick={() => navigate('/resumes/create')}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          + Generate Resume
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-12 rounded-xl text-center">
          <p className="text-slate-400 text-lg">No resumes yet</p>
          <p className="text-slate-500 text-sm mt-2">Create your first resume to get started</p>
          <button
            onClick={() => navigate('/resumes/create')}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Generate First Resume
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-lg hover:bg-slate-800/60 hover:border-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm text-purple-400">{resume.id}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          resume.status === 'completed'
                            ? 'text-green-400 bg-green-500/10'
                            : resume.status === 'pending'
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-red-400 bg-red-500/10'
                        }`}
                      >
                        {resume.status}
                      </span>
                    </div>
                    {resume.jobPostingUrl && (
                      <p className="text-slate-400 text-sm mb-1 truncate">
                        Job: <span className="text-slate-300">{resume.jobPostingUrl}</span>
                      </p>
                    )}
                    <p className="text-slate-400 text-sm">Created {formatDate(resume.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {resume.status === 'completed' && resume.pdfUrl && (
                      <a
                        href={resume.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Download PDF
                      </a>
                    )}
                    <button
                      onClick={() => navigate(`/resumes/${resume.id}`)}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Delete
                    </button>
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
