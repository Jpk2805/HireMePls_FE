import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import * as resumeService from '@services/resume.service'
import type { Resume } from '@services/resume.service'

// ─── Resume content types (mirrors ai.service.ts) ─────────────────────────────

interface ResumeHeader {
  name?: string
  location?: string
  phone?: string
  email?: string
  linkedin?: string
  github?: string
  portfolio?: string
}

interface ResumeSkillCategory {
  category: string
  items: string[]
}

interface ResumeProject {
  name: string
  role: string
  techStack: string[]
  date: string
  url?: string
  bullets: string[]
}

interface ResumeOpenSource {
  name: string
  role: string
  techStack: string[]
  date: string
  bullets: string[]
}

interface ResumeEducation {
  institution: string
  degree: string
  date: string
}

interface ResumeAchievement {
  title: string
  subtitle?: string
}

interface ResumeContent {
  header?: ResumeHeader
  summary?: string
  skills?: ResumeSkillCategory[]
  projects?: ResumeProject[]
  openSource?: ResumeOpenSource[]
  education?: ResumeEducation[]
  achievements?: ResumeAchievement[]
}

// ─── Structured resume view ────────────────────────────────────────────────────

const BLUE = '#2941AB'

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mt-5 mb-2">
      <span
        className="text-xs font-semibold tracking-widest uppercase"
        style={{ color: BLUE, fontVariant: 'small-caps' }}
      >
        {title}
      </span>
      <div className="flex-1 h-px" style={{ background: BLUE }} />
    </div>
  )
}

function EntryHeader({ name, meta, date, url }: { name: string; meta?: string; date?: string; url?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-semibold text-sm text-gray-900">{name}</span>
        {date && <span className="text-xs text-gray-500 ml-3 whitespace-nowrap">{date}</span>}
      </div>
      {(meta || url) && (
        <div className="text-xs text-gray-500 italic mt-0.5">
          {meta}
          {url && meta && <span> &nbsp;|&nbsp; </span>}
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="not-italic" style={{ color: BLUE }}>
              {url.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  if (!items?.length) return null
  return (
    <ul className="list-disc list-inside space-y-0.5 mt-1">
      {items.map((b, i) => (
        <li key={i} className="text-xs text-gray-700 leading-relaxed">{b}</li>
      ))}
    </ul>
  )
}

function StructuredResumeView({ content }: { content: ResumeContent }) {
  const h = content.header ?? {}
  const contactParts = [h.location, h.phone, h.email, h.linkedin, h.github, h.portfolio].filter(Boolean)

  return (
    <div className="max-w-2xl mx-auto font-serif" style={{ fontFamily: "'Georgia', serif" }}>
      {/* Header */}
      {h.name && (
        <div className="text-center mb-3">
          <div className="text-xl font-semibold text-gray-900">{h.name}</div>
          {contactParts.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">{contactParts.join('  ·  ')}</div>
          )}
        </div>
      )}
      <hr className="border-gray-300 mb-1" />

      {/* Summary */}
      {content.summary && (
        <>
          <SectionHeading title="Summary" />
          <p className="text-sm text-gray-700 leading-relaxed">{content.summary}</p>
        </>
      )}

      {/* Skills */}
      {content.skills && content.skills.length > 0 && (
        <>
          <SectionHeading title="Technical Skills" />
          <div className="space-y-0.5">
            {content.skills.map((cat, i) => (
              <p key={i} className="text-xs text-gray-700">
                <span className="font-semibold">{cat.category}:</span>{' '}
                {(cat.items ?? []).join(', ')}
              </p>
            ))}
          </div>
        </>
      )}

      {/* Projects */}
      {content.projects && content.projects.length > 0 && (
        <>
          <SectionHeading title="Projects" />
          <div className="space-y-3">
            {content.projects.map((p, i) => (
              <div key={i}>
                <EntryHeader
                  name={p.name}
                  meta={[p.role, (p.techStack ?? []).join(' · ')].filter(Boolean).join(' | ')}
                  date={p.date}
                  url={p.url}
                />
                <BulletList items={p.bullets} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Open Source */}
      {content.openSource && content.openSource.length > 0 && (
        <>
          <SectionHeading title="Open Source Contribution" />
          <div className="space-y-3">
            {content.openSource.map((o, i) => (
              <div key={i}>
                <EntryHeader
                  name={o.name}
                  meta={[o.role, (o.techStack ?? []).join(' · ')].filter(Boolean).join(' | ')}
                  date={o.date}
                />
                <BulletList items={o.bullets} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Education */}
      {content.education && content.education.length > 0 && (
        <>
          <SectionHeading title="Education" />
          <div className="space-y-2">
            {content.education.map((e, i) => (
              <EntryHeader key={i} name={e.institution} meta={e.degree} date={e.date} />
            ))}
          </div>
        </>
      )}

      {/* Achievements */}
      {content.achievements && content.achievements.length > 0 && (
        <>
          <SectionHeading title="Professional Development" />
          <div className="space-y-0.5">
            {content.achievements.map((a, i) => (
              <p key={i} className="text-xs text-gray-700">
                <span className="font-semibold">{a.title}</span>
                {a.subtitle && <span className="text-gray-500"> — {a.subtitle}</span>}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type DetailTab = 'resume' | 'cover-letter'

export default function ResumeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<DetailTab>('resume')

  const handleDownload = async () => {
    if (!id || !resume?.pdfUrl || downloading) return
    try {
      setDownloading(true)
      const url = await resumeService.getResumeDownloadUrl(id)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      window.open(resume.pdfUrl, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  const handleCopy = async () => {
    if (!resume?.coverLetter) return
    try {
      await navigator.clipboard.writeText(resume.coverLetter)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text in a textarea
      const ta = document.createElement('textarea')
      ta.value = resume.coverLetter
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    const fetchResume = async () => {
      if (!id) return
      try {
        setLoading(true)
        const data = await resumeService.getResume(id)
        setResume(data)
        const terminal = ['completed', 'failed', 'cancelled']
        if (terminal.includes(data.status ?? '') && interval) {
          clearInterval(interval)
          interval = null
        }
      } finally {
        setLoading(false)
      }
    }

    fetchResume()
    interval = setInterval(fetchResume, 3000)
    return () => { if (interval) clearInterval(interval) }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-400 text-sm">Loading resume...</div>
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="bg-white border border-gray-200 rounded-md p-12 text-center">
        <p className="text-gray-500 text-sm">Resume not found</p>
        <button
          onClick={() => navigate('/resumes')}
          className="mt-4 px-3 py-1.5 bg-[#111111] hover:bg-gray-800 text-white font-medium rounded-md transition-colors text-sm"
        >
          Back to Resumes
        </button>
      </div>
    )
  }

  const content = resume.content as ResumeContent | undefined
  const hasContent = content && Object.keys(content).length > 0
  const isPending = resume.status === 'pending' || resume.status === 'active'
  const isFailed = resume.status === 'failed'
  const hasCoverLetter = !!resume.coverLetter

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between print:hidden">
        <button onClick={() => navigate('/resumes')} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </button>
        <div className="flex gap-2">
          {isPending ? (
            <button
              disabled
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-400 font-medium rounded-md text-sm cursor-not-allowed opacity-60"
            >
              Generating PDF…
            </button>
          ) : resume.pdfUrl ? (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-3 py-1.5 bg-[#111111] hover:bg-gray-800 text-white font-medium rounded-md transition-colors text-sm disabled:opacity-50"
            >
              {downloading ? 'Preparing…' : 'Download PDF'}
            </button>
          ) : null}
        </div>
      </div>

      {isPending && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md text-amber-700 text-sm print:hidden">
          Resume generation in progress. Page updates automatically.
        </div>
      )}

      {isFailed && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-600 text-sm print:hidden">
          Resume generation failed. Please try again.
        </div>
      )}

      {(hasContent || hasCoverLetter) ? (
        <>
          {hasCoverLetter && (
            <div className="flex border-b border-gray-200 print:hidden">
              {(['resume', 'cover-letter'] as DetailTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === t
                      ? 'text-[#111111] border-b-2 border-[#111111] -mb-px'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t === 'resume' ? 'Resume' : 'Cover Letter'}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'resume' && hasContent && (
            <div className="bg-white border border-gray-200 rounded-md p-8">
              <StructuredResumeView content={content!} />
            </div>
          )}

          {activeTab === 'cover-letter' && hasCoverLetter && (
            <div className="bg-white border border-gray-200 rounded-md p-8">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Cover Letter
                </h2>
                <button
                  onClick={handleCopy}
                  className="text-xs px-2.5 py-1 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-gray-600"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed" style={{ fontFamily: 'inherit' }}>
                {resume.coverLetter}
              </pre>
            </div>
          )}
        </>
      ) : (
        !isPending && !isFailed && (
          <div className="bg-white border border-gray-200 rounded-md p-12 text-center">
            <p className="text-gray-400 text-sm">No content available yet</p>
          </div>
        )
      )}
    </div>
  )
}
