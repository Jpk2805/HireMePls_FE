import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as resumeService from '@services/resume.service'
import type { Resume } from '@services/resume.service'

const statusColors: Record<string, string> = {
  completed: 'text-green-700 bg-green-50',
  pending: 'text-amber-700 bg-amber-50',
  failed: 'text-red-700 bg-red-50',
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true)
      const response = await resumeService.listResumes({ page: pagination.page, limit: pagination.limit })
      setResumes(response.data)
      setPagination({ page: response.page, limit: response.limit, total: response.total, totalPages: response.totalPages })
    } catch (error) {
      console.error('Failed to fetch resumes:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page])

  useEffect(() => {
    fetchResumes()
  }, [fetchResumes])

  useEffect(() => {
    const hasPending = resumes.some((r) => r.status === 'pending' || r.status === 'active')
    if (!hasPending) return
    const interval = setInterval(fetchResumes, 3000)
    return () => clearInterval(interval)
  }, [resumes, fetchResumes])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
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

  const handleDownload = async (id: string, pdfUrl: string) => {
    try {
      const url = await resumeService.getResumeDownloadUrl(id)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      window.open(pdfUrl, '_blank')
    }
  }

  if (loading && resumes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-400 text-sm">Loading resumes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111111]">Resumes</h1>
          <p className="text-gray-500 mt-0.5 text-sm">View and manage your AI-generated resumes</p>
        </div>
        <button
          onClick={() => navigate('/resumes/create')}
          className="px-3 py-1.5 bg-[#111111] hover:bg-gray-800 text-white font-medium rounded-md transition-colors text-sm"
        >
          + Generate Resume
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-md p-10 text-center">
          <p className="text-gray-500 text-sm">No resumes yet</p>
          <p className="text-gray-400 text-sm mt-1">Generate your first AI resume to get started</p>
          <button
            onClick={() => navigate('/resumes/create')}
            className="mt-4 px-3 py-1.5 bg-[#111111] hover:bg-gray-800 text-white font-medium rounded-md transition-colors text-sm"
          >
            Generate First Resume
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <table className="table-fixed w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-xs font-medium text-gray-500 uppercase text-left py-2 px-3 border-b border-gray-100 w-[120px]">
                    ID
                  </th>
                  <th className="text-xs font-medium text-gray-500 uppercase text-left py-2 px-3 border-b border-gray-100">
                    URL / Title
                  </th>
                  <th className="text-xs font-medium text-gray-500 uppercase text-left py-2 px-3 border-b border-gray-100 w-[100px]">
                    Status
                  </th>
                  <th className="text-xs font-medium text-gray-500 uppercase text-left py-2 px-3 border-b border-gray-100 w-[160px]">
                    Created
                  </th>
                  <th className="text-xs font-medium text-gray-500 uppercase text-right py-2 px-3 border-b border-gray-100 w-[220px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {resumes.map((resume) => (
                  <tr key={resume.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 border-b border-gray-50 font-mono text-xs text-gray-400">
                      {resume.id.slice(0, 8)}…
                    </td>
                    <td className="py-2 px-3 border-b border-gray-50 text-sm text-gray-700 truncate">
                      <span className="truncate block max-w-xs text-gray-600" title={resume.title}>
                        {resume.title}
                      </span>
                    </td>
                    <td className="py-2 px-3 border-b border-gray-50">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[resume.status] ?? 'text-gray-600 bg-gray-100'}`}>
                        {resume.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 border-b border-gray-50 text-sm text-gray-500">
                      {formatDate(resume.createdAt)}
                    </td>
                    <td className="py-2 px-3 border-b border-gray-50">
                      <div className="flex items-center justify-end gap-2">
                        {(resume.status === 'pending' || resume.status === 'active') && (
                          <button
                            disabled
                            className="px-2.5 py-1 bg-white border border-gray-200 text-gray-400 text-xs font-medium rounded-md opacity-60 cursor-not-allowed"
                          >
                            Generating…
                          </button>
                        )}
                        {resume.status === 'completed' && resume.pdfUrl && (
                          <button
                            onClick={() => handleDownload(resume.id, resume.pdfUrl!)}
                            className="px-2.5 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-[#111111] text-xs font-medium rounded-md transition-colors"
                          >
                            Download PDF
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/resumes/${resume.id}`)}
                          className="px-2.5 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-[#111111] text-xs font-medium rounded-md transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(resume.id)}
                          className="px-2.5 py-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-medium rounded-md transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-[#111111] text-sm rounded-md transition-colors"
              >
                ← Previous
              </button>
              <span className="text-gray-500 text-sm">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-[#111111] text-sm rounded-md transition-colors"
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
