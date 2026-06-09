import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import * as jobPostingService from '@services/job-posting.service'
import { setFeedback, resolveCompany } from '@services/job-posting.service'
import * as resumeService from '@services/resume.service'
import ScoreRing from '@components/ScoreRing'
import type { JobPostingItem, ParsedDescription } from '@/types/index'

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

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink mb-2">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-700">
            <span className="text-gray-300 flex-shrink-0 mt-0.5">—</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Raw Description Renderer ─────────────────────────────────────────────────

function renderRawDescription(raw: string) {
  const isBullet = (l: string) => /^[•\-\*·▪▸◦‣]/.test(l) || /^\d+[.)]\s/.test(l)
  const isHeader = (l: string) =>
    !isBullet(l) &&
    l.length < 70 &&
    ((l === l.toUpperCase() && l.length > 3 && /[A-Z]/.test(l)) ||
      (l.length < 55 && /[A-Z][^.!?]*:\s*$/.test(l)))
  const stripBullet = (l: string) =>
    l.replace(/^[•\-\*·▪▸◦‣]\s*/, '').replace(/^\d+[.)]\s*/, '')

  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean)
  const nodes: React.ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]
    if (isHeader(line)) {
      nodes.push(
        <h3 key={key++} className="text-sm font-semibold text-ink pt-3 pb-0.5 first:pt-0">
          {line.replace(/:\s*$/, '')}
        </h3>
      )
      i++
    } else if (isBullet(line)) {
      const items: string[] = []
      while (i < lines.length && isBullet(lines[i])) {
        items.push(stripBullet(lines[i]))
        i++
      }
      nodes.push(
        <ul key={key++} className="space-y-1.5 my-1">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2 text-sm text-gray-700">
              <span className="text-gray-300 flex-shrink-0 mt-0.5">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    } else {
      nodes.push(
        <p key={key++} className="text-sm text-gray-700 leading-relaxed">
          {line}
        </p>
      )
      i++
    }
  }

  return nodes
}

// ─── Resume Modal ─────────────────────────────────────────────────────────────

type ModalTab = 'profile' | 'upload'

function ResumeModal({
  postingId,
  postingUrl,
  postingTitle,
  postingCompany,
  onClose,
  onSuccess,
}: {
  postingId: string
  postingUrl: string
  postingTitle: string
  postingCompany: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [tab, setTab] = useState<ModalTab>('profile')
  const [workHistory, setWorkHistory] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [parsing, setParsing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const name = file.name.toLowerCase()
    setParsing(true)
    try {
      if (name.endsWith('.txt')) {
        setWorkHistory(await file.text())
      } else if (name.endsWith('.pdf')) {
        const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
        GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
        const pdf = await getDocument({ data: await file.arrayBuffer() }).promise
        const pages: string[] = []
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          pages.push(content.items.map((item: unknown) => ('str' in (item as object) ? (item as { str: string }).str : '')).join(' '))
        }
        setWorkHistory(pages.join('\n\n'))
      } else if (name.endsWith('.docx') || name.endsWith('.doc')) {
        const mammoth = await import('mammoth')
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
        setWorkHistory(result.value)
      } else {
        toast.error('Unsupported file type — use .pdf, .docx, or .txt')
      }
    } catch {
      toast.error('Failed to parse file — try pasting the content manually')
    } finally {
      setParsing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }, [])

  const handleProfileSubmit = async () => {
    setSubmitting(true)
    try {
      await jobPostingService.triggerResume(postingId)
      toast.success('Resume generation queued — check Resumes page')
      onSuccess()
    } catch {
      toast.error('Failed to queue resume generation')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCustomSubmit = async () => {
    if (!workHistory.trim()) {
      toast.error('Work history is required')
      return
    }
    setSubmitting(true)
    try {
      await resumeService.createResume({ jobPostingUrl: postingUrl, workHistory: workHistory.trim(), tone: 'professional', jobTitle: postingTitle, jobCompany: postingCompany })
      toast.success('Resume generation queued — check Resumes page')
      onSuccess()
    } catch {
      toast.error('Failed to queue resume generation')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-ink">Generate Resume</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-ink transition-colors text-lg leading-none">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['profile', 'upload'] as ModalTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === t ? 'text-ink border-b-2 border-ink -mb-px' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'profile' ? 'Use My Profile' : 'Custom Work History'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {tab === 'profile' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Claude will use your saved profile (work history, skills, education) to tailor a resume for this specific role.
              </p>
              <p className="text-xs text-gray-400">
                Make sure your Profile page is up to date for the best results.
              </p>
            </div>
          )}

          {tab === 'upload' && (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={parsing}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50"
                >
                  {parsing ? 'Parsing…' : 'Upload PDF / DOCX / TXT'}
                </button>
                <span className="text-xs text-gray-400">or paste below</span>
                <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={handleFile} />
              </div>
              <textarea
                value={workHistory}
                onChange={(e) => setWorkHistory(e.target.value)}
                placeholder="Paste your work history, skills, and experience here…"
                rows={10}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-ink/20 placeholder-gray-300"
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-ink transition-colors">
            Cancel
          </button>
          {tab === 'profile' ? (
            <button
              onClick={handleProfileSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-ink hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Queuing…' : 'Generate Resume'}
            </button>
          ) : (
            <button
              onClick={handleCustomSubmit}
              disabled={submitting || !workHistory.trim()}
              className="px-4 py-2 bg-ink hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Queuing…' : 'Generate Resume'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobPostingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [posting, setPosting] = useState<JobPostingItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [feedbackSaving, setFeedbackSaving] = useState(false)
  const [resolvingCompany, setResolvingCompany] = useState(false)

  const handleResolveCompany = async () => {
    if (!posting) return
    setResolvingCompany(true)
    try {
      const res = await resolveCompany(posting.id)
      if (res.companyId) {
        setPosting((prev) => prev ? { ...prev, companyId: res.companyId ?? undefined } : prev)
        navigate(`/companies/${res.companyId}`)
      } else {
        toast.error('Could not identify company')
      }
    } catch {
      toast.error('Failed to resolve company')
    } finally {
      setResolvingCompany(false)
    }
  }

  const handleFeedback = async (feedback: 'interested' | 'not_interested' | 'applied' | null) => {
    if (!posting) return
    setFeedbackSaving(true)
    try {
      await setFeedback(posting.id, feedback)
      setPosting((prev) => prev ? { ...prev, userFeedback: feedback } : prev)
      const labels = { interested: 'Marked as Interested', not_interested: 'Marked as Not Interested', applied: 'Marked as Applied', null: 'Feedback cleared' }
      toast.success(labels[String(feedback) as keyof typeof labels] ?? 'Feedback updated')
    } catch {
      toast.error('Failed to save feedback')
    } finally {
      setFeedbackSaving(false)
    }
  }

  useEffect(() => {
    if (!id) return
    jobPostingService
      .getJobPosting(id)
      .then(setPosting)
      .catch(() => toast.error('Failed to load job posting'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-1/3" />
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <div className="h-6 bg-gray-100 rounded w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="flex gap-2 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-100 rounded-full w-16" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!posting) {
    return (
      <div className="text-center py-20">
        <p className="text-ink font-medium">Posting not found</p>
        <button
          onClick={() => navigate('/job-postings')}
          className="mt-4 text-sm text-gray-500 underline underline-offset-2"
        >
          Back to Job Board
        </button>
      </div>
    )
  }

  const parsed = posting.descriptionParsed as ParsedDescription | undefined
  const hasParsedContent = !!(parsed && (
    parsed.aboutCompany ||
    (parsed.responsibilities?.length ?? 0) > 0 ||
    (parsed.requirements?.length ?? 0) > 0 ||
    (parsed.niceToHave?.length ?? 0) > 0 ||
    (parsed.benefits?.length ?? 0) > 0 ||
    parsed.salary
  ))
  const techs = (posting.technologiesReq as string[] | undefined) ?? []
  const techsNice = (posting.technologiesNice as string[] | undefined) ?? []
  const sourceClass = SOURCE_COLORS[posting.source] ?? 'bg-gray-50 text-gray-600'

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <button
        onClick={() => navigate('/job-postings')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-ink transition-colors"
      >
        ← Job Board
      </button>

      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-ink leading-snug">{posting.title}</h1>
            <p className="text-ink-secondary text-base mt-1">{posting.company}</p>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {posting.locations.map((loc) => (
                <span
                  key={loc}
                  className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100"
                >
                  {loc}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sourceClass}`}>
                {posting.source}
              </span>
              {posting.workMode && (
                <span className="text-xs text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                  {posting.workMode}
                </span>
              )}
              {posting.experienceLevel && (
                <span className="text-xs text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                  {posting.experienceLevel}
                </span>
              )}
              {posting.jobType && (
                <span className="text-xs text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                  {posting.jobType}
                </span>
              )}
              {posting.yearsRequired && (
                <span className="text-xs text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                  {posting.yearsRequired}+ yrs
                </span>
              )}
            </div>

            {(posting.salaryMin || posting.salaryMax) && (
              <p className="mt-3 text-sm font-medium text-success">
                {posting.salaryCurrency ?? '$'}
                {posting.salaryMin?.toLocaleString()}
                {posting.salaryMax ? ` – ${posting.salaryMax.toLocaleString()}` : '+'}
              </p>
            )}

            {techs.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-ink uppercase tracking-wide mb-2">Required Technologies</p>
                <div className="flex flex-wrap gap-1.5">
                  {techs.map((tech) => (
                    <span key={tech} className="text-xs font-mono text-ink bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {techsNice.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Nice to Have</p>
                <div className="flex flex-wrap gap-1.5">
                  {techsNice.map((tech) => (
                    <span key={tech} className="text-xs font-mono text-gray-500 bg-gray-50 px-2.5 py-1 rounded border border-gray-100">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
              {posting.postedAt && (
                <span className="text-gray-500">Posted <span className="text-ink font-medium">{new Date(posting.postedAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}</span></span>
              )}
              <span className="text-gray-500">Source <span className="text-ink font-medium capitalize">{posting.source}</span></span>
              {posting.companyId ? (
                <button onClick={() => navigate(`/companies/${posting.companyId}`)} className="text-ink font-medium underline underline-offset-2 text-xs">View company profile</button>
              ) : (
                <button onClick={handleResolveCompany} disabled={resolvingCompany} className="text-ink font-medium underline underline-offset-2 text-xs disabled:opacity-50">
                  {resolvingCompany ? 'Researching…' : 'Research company'}
                </button>
              )}
            </div>
          </div>

          {/* Score ring + actions */}
          <div className="flex flex-col items-center gap-4 flex-shrink-0">
            <ScoreRing score={posting.matchScore} size="lg" />
            <div className="text-xs text-gray-400 text-center">match score</div>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-ink hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                Generate Resume
              </button>
              <button
                onClick={() => navigate(`/job-postings/${posting.id}/outreach`)}
                className="px-4 py-2 border border-gray-200 hover:border-gray-400 text-ink text-sm font-medium rounded-lg transition-colors text-center"
              >
                Draft Outreach
              </button>
              <button
                onClick={() => navigate(`/job-postings/${posting.id}/outreach?prep=1`)}
                className="px-4 py-2 border border-gray-200 hover:border-gray-400 text-ink text-sm font-medium rounded-lg transition-colors text-center"
              >
                Interview Prep
              </button>
              <a
                href={posting.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-200 hover:border-gray-400 text-ink text-sm font-medium rounded-lg transition-colors text-center"
              >
                View Original →
              </a>
              <div className="flex gap-1.5 pt-1 border-t border-gray-100">
                {(
                  [
                    { value: 'interested', label: '★ Interested', active: 'bg-green-50 border-green-300 text-green-700' },
                    { value: 'applied', label: '✓ Applied', active: 'bg-blue-50 border-blue-300 text-blue-700' },
                    { value: 'not_interested', label: '✕ Pass', active: 'bg-red-50 border-red-300 text-red-600' },
                  ] as const
                ).map(({ value, label, active }) => {
                  const isCurrent = posting.userFeedback === value
                  return (
                    <button
                      key={value}
                      disabled={feedbackSaving}
                      onClick={() => handleFeedback(isCurrent ? null : value)}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium border rounded-lg transition-all ${
                        isCurrent ? active : 'border-gray-200 text-gray-500 hover:border-gray-400'
                      } disabled:opacity-50`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* AI reasoning */}
        {posting.reasoning && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              AI Match Reasoning
            </p>
            <p className="text-sm text-gray-700 italic">{posting.reasoning}</p>
          </div>
        )}
      </div>

      {/* Description — full width */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">Job Description</h2>

        {hasParsedContent ? (
          <>
            {parsed.aboutCompany && (
              <div>
                <h3 className="text-sm font-semibold text-ink mb-2">About the Company</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{parsed.aboutCompany}</p>
              </div>
            )}
            <Section title="Responsibilities" items={parsed.responsibilities} />
            <Section title="Requirements" items={parsed.requirements} />
            <Section title="Nice to Have" items={parsed.niceToHave} />
            <Section title="Benefits" items={parsed.benefits} />
            {parsed.salary && (
              <div>
                <h3 className="text-sm font-semibold text-ink mb-1">Compensation</h3>
                <p className="text-sm text-gray-700">{parsed.salary}</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2">
            {renderRawDescription(posting.descriptionRaw)}
          </div>
        )}
      </div>

      {showModal && posting && (
        <ResumeModal
          postingId={posting.id}
          postingUrl={posting.url}
          postingTitle={posting.title}
          postingCompany={posting.company}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            navigate('/resumes')
          }}
        />
      )}
    </div>
  )
}
