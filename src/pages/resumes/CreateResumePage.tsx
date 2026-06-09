import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import * as resumeService from '@services/resume.service'
import type { Resume } from '@services/resume.service'
import { getProfile, type GitHubRepo } from '@services/profile.service'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

const TONES = [
  { id: 'professional', label: 'Professional', description: 'Formal, polished, corporate-ready' },
  { id: 'human', label: 'Human', description: 'Warm, conversational, personable' },
  { id: 'creative', label: 'Creative', description: 'Bold, distinctive, memorable' },
  { id: 'technical', label: 'Technical', description: 'Precise, metrics-focused, detail-rich' },
  { id: 'executive', label: 'Executive', description: 'Leadership-forward, strategic, results-driven' },
] as const

type Tone = typeof TONES[number]['id']

export default function CreateResumePage() {
  const [jobPostingUrl, setJobPostingUrl] = useState('')
  const [workHistory, setWorkHistory] = useState('')
  const [tone, setTone] = useState<Tone>('professional')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previousResumes, setPreviousResumes] = useState<Resume[]>([])
  const [dragging, setDragging] = useState(false)
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    resumeService.listResumes({ limit: 20 }).then((res) => setPreviousResumes(res.data)).catch(() => {})
    getProfile().then((p) => {
      if (p?.githubRepos?.length) setGithubRepos(p.githubRepos.filter((r) => r.readme))
    }).catch(() => {})
  }, [])

  const loadPreviousResume = async (resumeId: string) => {
    if (!resumeId) return
    try {
      const resume = await resumeService.getResume(resumeId)
      const content = (resume as unknown as { content?: Record<string, unknown> }).content
      if (content) setWorkHistory(JSON.stringify(content, null, 2))
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
          Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1).then((p) => p.getTextContent()))
        )
        const text = pages.flatMap((p) => p.items.map((item) => ('str' in item ? item.str : ''))).join(' ')
        setWorkHistory(text)
      } catch {
        setError('Failed to read PDF')
      }
      return
    }

    if (name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
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
      const picked = githubRepos
        .filter((r) => selectedRepos.has(r.name) && r.readme)
        .map((r) => ({ name: r.name, readme: r.readme! }))
      await resumeService.createResume({ jobPostingUrl, workHistory, tone, ...(picked.length > 0 && { selectedRepos: picked }) })
      toast.success('Resume generation started!')
      navigate('/resumes')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Failed to start resume generation')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent text-sm transition-shadow'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Generate Resume</h1>
        <p className="text-gray-500 mt-1 text-sm">AI will tailor your resume to the job posting</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Job Posting URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://example.com/jobs/123"
              value={jobPostingUrl}
              onChange={(e) => setJobPostingUrl(e.target.value)}
              required
              className={inputClass}
            />
            <p className="text-gray-400 text-xs mt-1.5">AI will scrape this URL for the job description</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-3">
              Resume Tone <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border text-center transition-all text-sm ${
                    tone === t.id
                      ? 'border-ink bg-ink text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium text-xs">{t.label}</span>
                  <span className="text-xs opacity-70 leading-tight">{t.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <label className="block text-sm font-medium text-ink">
            Work History <span className="text-red-500">*</span>
          </label>

          {previousResumes.length > 0 && (
            <select
              onChange={(e) => loadPreviousResume(e.target.value)}
              defaultValue=""
              className={inputClass}
            >
              <option value="" disabled>Load from previous resume...</option>
              {previousResumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id.slice(0, 8)}… — {new Date(r.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          )}

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl px-4 py-5 text-center cursor-pointer transition-colors text-sm ${
              dragging
                ? 'border-ink bg-gray-50 text-ink'
                : 'border-gray-200 hover:border-gray-300 text-gray-400 hover:bg-gray-50'
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

          <textarea
            placeholder="Or type / paste your work history and skills here..."
            value={workHistory}
            onChange={(e) => setWorkHistory(e.target.value)}
            required
            rows={10}
            className={`${inputClass} resize-y`}
          />
        </div>

        {githubRepos.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <div>
              <p className="text-sm font-medium text-ink">GitHub Projects</p>
              <p className="text-xs text-gray-400 mt-0.5">Select repos Claude should use as context when tailoring your resume.</p>
            </div>
            <div className="space-y-2">
              {githubRepos.map((r) => (
                <label key={r.name} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedRepos.has(r.name)}
                    onChange={(e) => {
                      setSelectedRepos((prev) => {
                        const next = new Set(prev)
                        if (e.target.checked) next.add(r.name)
                        else next.delete(r.name)
                        return next
                      })
                    }}
                    className="w-4 h-4 accent-ink"
                  />
                  <span className="text-sm text-[#111111] group-hover:text-ink">{r.name}</span>
                  {r.language && <span className="text-xs text-gray-400">{r.language}</span>}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/resumes')}
            className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-ink font-medium rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-5 py-2.5 bg-ink hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
          >
            {loading ? 'Starting generation...' : 'Generate Resume'}
          </button>
        </div>
      </form>
    </div>
  )
}
