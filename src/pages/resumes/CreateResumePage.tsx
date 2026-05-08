import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import * as resumeService from '@services/resume.service'
import type { Resume } from '@services/resume.service'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

export default function CreateResumePage() {
  const [jobPostingUrl, setJobPostingUrl] = useState('')
  const [workHistory, setWorkHistory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previousResumes, setPreviousResumes] = useState<Resume[]>([])
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    resumeService.listResumes({ limit: 20 })
      .then((res) => setPreviousResumes(res.data))
      .catch(() => {})
  }, [])

  const loadPreviousResume = async (resumeId: string) => {
    if (!resumeId) return
    try {
      const resume = await resumeService.getResume(resumeId)
      const content = (resume as unknown as { content?: Record<string, unknown> }).content
      if (content) {
        setWorkHistory(JSON.stringify(content, null, 2))
      }
    } catch {
      setError('Failed to load previous resume')
    }
  }

  const handleFile = async (file: File) => {
    const name = file.name.toLowerCase()
    setError('')

    if (name.endsWith('.txt') || file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => setWorkHistory(String(e.target?.result ?? ''))
      reader.readAsText(file)
      return
    }

    if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      try {
        const buffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
        const pages = await Promise.all(
          Array.from({ length: pdf.numPages }, (_, i) =>
            pdf.getPage(i + 1).then((p) => p.getTextContent())
          )
        )
        const text = pages
          .flatMap((p) => p.items.map((item) => ('str' in item ? item.str : '')))
          .join(' ')
        setWorkHistory(text)
      } catch {
        setError('Failed to read PDF')
      }
      return
    }

    if (
      name.endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      try {
        const buffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer: buffer })
        setWorkHistory(result.value)
      } catch {
        setError('Failed to read Word document')
      }
      return
    }

    setError('Unsupported file type. Use .txt, .pdf, or .docx')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resumeService.createResume({ jobPostingUrl, workHistory })
      toast.success('Resume generation started! Check Jobs to track progress.')
      navigate('/jobs')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Failed to start resume generation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">Generate Resume</h1>
        <p className="text-slate-400 mt-2">AI will tailor your resume to the job posting</p>
      </div>

      <form onSubmit={handleSubmit} className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-8 rounded-xl space-y-6">
        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Job Posting URL <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            placeholder="https://example.com/jobs/123"
            value={jobPostingUrl}
            onChange={(e) => setJobPostingUrl(e.target.value)}
            required
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-slate-500 text-xs mt-1">AI will scrape this URL for the job description</p>
        </div>

        {/* Work history source options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            Work History <span className="text-red-400">*</span>
          </label>

          {/* Load from previous resume */}
          {previousResumes.length > 0 && (
            <div className="flex gap-2 items-center">
              <select
                onChange={(e) => loadPreviousResume(e.target.value)}
                defaultValue=""
                className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="" disabled>Load from previous resume...</option>
                {previousResumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id.slice(0, 8)}… — {new Date(r.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* File drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg px-4 py-3 text-center cursor-pointer transition-colors text-sm ${
              dragging
                ? 'border-purple-400 bg-purple-500/10 text-purple-300'
                : 'border-slate-600/50 hover:border-slate-500 text-slate-500'
            }`}
          >
            Drop a resume here, or click to browse
            <span className="block text-xs mt-1 opacity-60">.pdf, .docx, .txt supported</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
            />

          </div>

          {/* Manual textarea */}
          <textarea
            placeholder="Or type / paste your work history and skills here..."
            value={workHistory}
            onChange={(e) => setWorkHistory(e.target.value)}
            required
            rows={10}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
          />
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate('/resumes')}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Starting generation...' : 'Generate Resume'}
          </button>
        </div>
      </form>
    </div>
  )
}
