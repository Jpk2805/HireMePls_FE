import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import * as outreachService from '@services/outreach.service'
import type { OutreachDraft, InterviewPrep } from '@services/outreach.service'

type Tab = 'outreach' | 'prep'

export default function OutreachPage() {
  const { id: jobPostingId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [tab, setTab] = useState<Tab>(searchParams.get('prep') ? 'prep' : 'outreach')
  const [drafts, setDrafts] = useState<OutreachDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedType, setSelectedType] = useState<'cold_email' | 'linkedin_note'>('cold_email')
  const [recipientName, setRecipientName] = useState('')
  const [recipientTitle, setRecipientTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [editSubject, setEditSubject] = useState('')
  const [prep, setPrep] = useState<InterviewPrep | null>(null)
  const [loadingPrep, setLoadingPrep] = useState(false)

  useEffect(() => {
    if (!jobPostingId) return
    outreachService.getDrafts(jobPostingId).then((res) => {
      setDrafts(res.drafts)
    }).finally(() => setLoading(false))
  }, [jobPostingId])

  const handleLoadPrep = useCallback(async () => {
    if (!jobPostingId || prep) return
    setLoadingPrep(true)
    try {
      const data = await outreachService.getInterviewPrep(jobPostingId)
      setPrep(data)
    } catch {
      toast.error('Failed to generate interview prep')
    } finally {
      setLoadingPrep(false)
    }
  }, [jobPostingId, prep])

  useEffect(() => {
    if (tab === 'prep') handleLoadPrep()
  }, [tab, handleLoadPrep])

  const handleGenerate = async () => {
    if (!jobPostingId) return
    setGenerating(true)
    try {
      const draft = await outreachService.createDraft(
        jobPostingId,
        selectedType,
        recipientName.trim() || undefined,
        recipientTitle.trim() || undefined
      )
      setDrafts((prev) => [draft, ...prev])
      toast.success('Draft generated')
    } catch {
      toast.error('Failed to generate draft')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async (draftId: string) => {
    try {
      const updated = await outreachService.updateDraft(draftId, editBody, editSubject || null)
      setDrafts((prev) => prev.map((d) => d.id === draftId ? updated : d))
      setEditingId(null)
      toast.success('Saved')
    } catch {
      toast.error('Failed to save')
    }
  }

  const handleDelete = async (draftId: string) => {
    try {
      await outreachService.deleteDraft(draftId)
      setDrafts((prev) => prev.filter((d) => d.id !== draftId))
      toast.success('Draft deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const startEdit = (draft: OutreachDraft) => {
    setEditingId(draft.id)
    setEditBody(draft.body)
    setEditSubject(draft.subject ?? '')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </button>
        <h1 className="text-xl font-semibold text-ink">Job Tools</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {(['outreach', 'prep'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'text-ink border-ink' : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {t === 'outreach' ? 'Outreach Drafts' : 'Interview Prep'}
          </button>
        ))}
      </div>

      {/* Interview Prep Tab */}
      {tab === 'prep' && (
        <div className="space-y-4">
          {loadingPrep ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-4/5" />
            </div>
          ) : prep ? (
            <>
              <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
                <h2 className="text-sm font-semibold text-ink">Company Context</h2>
                <p className="text-sm text-gray-700">{prep.companyContext}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
                <h2 className="text-sm font-semibold text-ink">Likely Interview Questions</h2>
                <ol className="space-y-2">
                  {prep.questions.map((q, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700">
                      <span className="text-gray-400 font-mono text-xs mt-0.5 w-4 flex-shrink-0">{i + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
                <h2 className="text-sm font-semibold text-ink">Talking Points to Prepare</h2>
                <ul className="space-y-2">
                  {prep.talkingPoints.map((tp, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-gray-300 flex-shrink-0">—</span>
                      <span>{tp}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => { setPrep(null); handleLoadPrep() }}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Regenerate
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Outreach Tab */}
      {tab === 'outreach' && <>
      {/* Generator */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-ink">Generate New Draft</h2>
        <div className="space-y-3">
          <div className="flex gap-2">
            {(['cold_email', 'linkedin_note'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                  selectedType === t
                    ? 'bg-ink text-white border-ink'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t === 'cold_email' ? 'Cold Email' : 'LinkedIn Note'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Recipient name (optional)"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-gray-400"
            />
            <input
              type="text"
              value={recipientTitle}
              onChange={(e) => setRecipientTitle(e.target.value)}
              placeholder="Title, e.g. Talent Acquisition (optional)"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-gray-400"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-1.5 bg-ink hover:bg-gray-800 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {generating ? 'Generating…' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {/* Drafts */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : drafts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm">No drafts yet. Generate your first one above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div key={draft.id} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {draft.type === 'cold_email' ? 'Cold Email' : 'LinkedIn Note'}
                  </span>
                  {draft.contact && (
                    <span className="text-xs text-gray-500">→ {draft.contact.name}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {editingId === draft.id ? (
                    <>
                      <button onClick={() => handleSave(draft.id)} className="text-xs text-green-600 hover:text-green-700 font-medium">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleCopy(`${draft.subject ? `Subject: ${draft.subject}\n\n` : ''}${draft.body}`)} className="text-xs text-gray-400 hover:text-gray-600">Copy</button>
                      <button onClick={() => startEdit(draft)} className="text-xs text-gray-400 hover:text-gray-600">Edit</button>
                      <button onClick={() => handleDelete(draft.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                    </>
                  )}
                </div>
              </div>

              {editingId === draft.id ? (
                <div className="space-y-2">
                  {draft.type === 'cold_email' && (
                    <input
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      placeholder="Subject line"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                    />
                  )}
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={8}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-y font-mono"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {draft.subject && (
                    <p className="text-xs font-medium text-gray-500">Subject: {draft.subject}</p>
                  )}
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{draft.body}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </>}
    </div>
  )
}
