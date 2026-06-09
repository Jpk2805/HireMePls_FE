import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  getProfile,
  upsertProfile,
  acceptSuggestion,
  dismissSuggestion,
  parseResume,
  importLinkedIn,
  syncGitHub,
  type CertificationItem,
  type EducationItem,
  type ProjectItem,
  type OpenSourceItem,
  type AchievementItem,
  type WorkHistoryItem,
  type Preferences,
  type SuggestedSkill,
  type UpsertProfileInput,
  type UserProfile,
  type GitHubRepo,
} from '@services/profile.service'

// ─── Shared primitives ────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-[#111111]">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function Tag({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-700 transition-colors leading-none"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </span>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-[#111111] focus:outline-none focus:border-gray-400 transition-colors"
      />
    </div>
  )
}

function FormActions({ onSave, onCancel, saveLabel = 'Add' }: { onSave: () => void; onCancel: () => void; saveLabel?: string }) {
  return (
    <div className="flex gap-2 pt-1">
      <button onClick={onSave} className="px-3 py-1.5 bg-[#111111] text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">{saveLabel}</button>
      <button onClick={onCancel} className="px-3 py-1.5 border border-gray-200 text-sm text-gray-600 rounded-md hover:bg-gray-50 transition-colors">Cancel</button>
    </div>
  )
}

// ─── Education ────────────────────────────────────────────────────────────────

function EducationForm({
  initial,
  onSave,
  onCancel,
  saveLabel,
}: {
  initial?: EducationItem
  onSave: (item: EducationItem) => void
  onCancel: () => void
  saveLabel?: string
}) {
  const [form, setForm] = useState<EducationItem>(
    initial ?? { degree: '', institution: '', field: '', graduationYear: undefined }
  )

  const submit = () => {
    if (!form.degree.trim() || !form.institution.trim()) {
      toast.error('Degree and institution required')
      return
    }
    onSave({
      degree: form.degree.trim(),
      institution: form.institution.trim(),
      field: form.field?.trim() || undefined,
      graduationYear: form.graduationYear,
    })
  }

  return (
    <div className="border border-gray-200 rounded-md p-4 space-y-3 bg-gray-50">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Degree" value={form.degree} onChange={(v) => setForm({ ...form, degree: v })} placeholder="e.g. B.Sc. Computer Science" required />
        <Field label="Institution" value={form.institution} onChange={(v) => setForm({ ...form, institution: v })} placeholder="e.g. University of Toronto" required />
        <Field label="Field of Study" value={form.field ?? ''} onChange={(v) => setForm({ ...form, field: v })} placeholder="e.g. Software Engineering" />
        <Field label="Graduation Year" type="number" value={form.graduationYear?.toString() ?? ''} onChange={(v) => setForm({ ...form, graduationYear: v ? parseInt(v) : undefined })} placeholder="e.g. 2022" />
      </div>
      <FormActions onSave={submit} onCancel={onCancel} saveLabel={saveLabel ?? 'Add'} />
    </div>
  )
}

function EducationList({
  items,
  onChange,
}: {
  items: EducationItem[]
  onChange: (items: EducationItem[]) => void
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)

  return (
    <div className="space-y-3">
      {items.length === 0 && editingIndex === null && !adding && (
        <p className="text-sm text-gray-400">No education added yet</p>
      )}
      {items.map((edu, i) =>
        editingIndex === i ? (
          <EducationForm
            key={i}
            initial={edu}
            saveLabel="Save"
            onSave={(updated) => {
              const next = items.map((x, j) => (j === i ? updated : x))
              onChange(next)
              setEditingIndex(null)
            }}
            onCancel={() => setEditingIndex(null)}
          />
        ) : (
          <div key={i} className="flex items-start justify-between p-3 border border-gray-100 rounded-md bg-gray-50">
            <div>
              <p className="text-sm font-medium text-[#111111]">{edu.degree}</p>
              <p className="text-sm text-gray-500">{edu.institution}{edu.field ? ` · ${edu.field}` : ''}</p>
              {edu.graduationYear && <p className="text-xs text-gray-400 mt-0.5">{edu.graduationYear}</p>}
            </div>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <button onClick={() => { setAdding(false); setEditingIndex(i) }} className="text-gray-400 hover:text-[#111111] transition-colors text-xs">Edit</button>
              <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none">×</button>
            </div>
          </div>
        )
      )}
      {adding ? (
        <EducationForm
          onSave={(item) => { onChange([...items, item]); setAdding(false) }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        editingIndex === null && (
          <button onClick={() => { setEditingIndex(null); setAdding(true) }} className="text-sm text-gray-500 hover:text-[#111111] transition-colors">
            + Add Education
          </button>
        )
      )}
    </div>
  )
}

// ─── Certifications ───────────────────────────────────────────────────────────

function CertificationForm({
  initial,
  onSave,
  onCancel,
  saveLabel,
}: {
  initial?: CertificationItem
  onSave: (item: CertificationItem) => void
  onCancel: () => void
  saveLabel?: string
}) {
  const [form, setForm] = useState<CertificationItem>(initial ?? { name: '', issuer: '', year: undefined })

  const submit = () => {
    if (!form.name.trim() || !form.issuer.trim()) {
      toast.error('Name and issuer required')
      return
    }
    onSave({ name: form.name.trim(), issuer: form.issuer.trim(), year: form.year })
  }

  return (
    <div className="border border-gray-200 rounded-md p-4 space-y-3 bg-gray-50">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Certification Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. AWS Solutions Architect" required />
        <Field label="Issuer" value={form.issuer} onChange={(v) => setForm({ ...form, issuer: v })} placeholder="e.g. Amazon Web Services" required />
        <Field label="Year" type="number" value={form.year?.toString() ?? ''} onChange={(v) => setForm({ ...form, year: v ? parseInt(v) : undefined })} placeholder="e.g. 2023" />
      </div>
      <FormActions onSave={submit} onCancel={onCancel} saveLabel={saveLabel ?? 'Add'} />
    </div>
  )
}

function CertificationList({
  items,
  onChange,
}: {
  items: CertificationItem[]
  onChange: (items: CertificationItem[]) => void
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)

  return (
    <div className="space-y-3">
      {items.length === 0 && editingIndex === null && !adding && (
        <p className="text-sm text-gray-400">No certifications added yet</p>
      )}
      {items.map((cert, i) =>
        editingIndex === i ? (
          <CertificationForm
            key={i}
            initial={cert}
            saveLabel="Save"
            onSave={(updated) => {
              onChange(items.map((x, j) => (j === i ? updated : x)))
              setEditingIndex(null)
            }}
            onCancel={() => setEditingIndex(null)}
          />
        ) : (
          <div key={i} className="flex items-start justify-between p-3 border border-gray-100 rounded-md bg-gray-50">
            <div>
              <p className="text-sm font-medium text-[#111111]">{cert.name}</p>
              <p className="text-sm text-gray-500">{cert.issuer}{cert.year ? ` · ${cert.year}` : ''}</p>
            </div>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <button onClick={() => { setAdding(false); setEditingIndex(i) }} className="text-gray-400 hover:text-[#111111] transition-colors text-xs">Edit</button>
              <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none">×</button>
            </div>
          </div>
        )
      )}
      {adding ? (
        <CertificationForm
          onSave={(item) => { onChange([...items, item]); setAdding(false) }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        editingIndex === null && (
          <button onClick={() => { setEditingIndex(null); setAdding(true) }} className="text-sm text-gray-500 hover:text-[#111111] transition-colors">
            + Add Certification
          </button>
        )
      )}
    </div>
  )
}

// ─── Projects ─────────────────────────────────────────────────────────────────

function ProjectForm({
  initial,
  onSave,
  onCancel,
  saveLabel,
}: {
  initial?: ProjectItem
  onSave: (item: ProjectItem) => void
  onCancel: () => void
  saveLabel?: string
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    techInput: initial?.techStack?.join(', ') ?? '',
    url: initial?.url ?? '',
  })

  const submit = () => {
    if (!form.name.trim()) {
      toast.error('Project name required')
      return
    }
    const techStack = form.techInput.split(',').map((t) => t.trim()).filter(Boolean)
    onSave({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      techStack,
      url: form.url.trim() || undefined,
    })
  }

  return (
    <div className="border border-gray-200 rounded-md p-4 space-y-3 bg-gray-50">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Project Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Job Scraper" required />
        <Field label="URL" type="url" value={form.url} onChange={(v) => setForm({ ...form, url: v })} placeholder="https://github.com/you/project" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Briefly describe what this project does…"
          rows={2}
          className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-[#111111] focus:outline-none focus:border-gray-400 transition-colors resize-none"
        />
      </div>
      <Field label="Tech Stack (comma-separated)" value={form.techInput} onChange={(v) => setForm({ ...form, techInput: v })} placeholder="e.g. React, Node.js, PostgreSQL" />
      <FormActions onSave={submit} onCancel={onCancel} saveLabel={saveLabel ?? 'Add'} />
    </div>
  )
}

function ProjectList({
  items,
  onChange,
}: {
  items: ProjectItem[]
  onChange: (items: ProjectItem[]) => void
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)

  return (
    <div className="space-y-3">
      {items.length === 0 && editingIndex === null && !adding && (
        <p className="text-sm text-gray-400">No projects added yet</p>
      )}
      {items.map((proj, i) =>
        editingIndex === i ? (
          <ProjectForm
            key={i}
            initial={proj}
            saveLabel="Save"
            onSave={(updated) => {
              onChange(items.map((x, j) => (j === i ? updated : x)))
              setEditingIndex(null)
            }}
            onCancel={() => setEditingIndex(null)}
          />
        ) : (
          <div key={i} className="flex items-start justify-between p-3 border border-gray-100 rounded-md bg-gray-50">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[#111111]">{proj.name}</p>
                {proj.url && (
                  <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 transition-colors truncate max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                    ↗ {proj.url.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
              {proj.description && <p className="text-sm text-gray-500 mt-0.5">{proj.description}</p>}
              {proj.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {proj.techStack.map((tech) => (
                    <span key={tech} className="text-xs px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded-full">{tech}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <button onClick={() => { setAdding(false); setEditingIndex(i) }} className="text-gray-400 hover:text-[#111111] transition-colors text-xs">Edit</button>
              <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none">×</button>
            </div>
          </div>
        )
      )}
      {adding ? (
        <ProjectForm
          onSave={(item) => { onChange([...items, item]); setAdding(false) }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        editingIndex === null && (
          <button onClick={() => { setEditingIndex(null); setAdding(true) }} className="text-sm text-gray-500 hover:text-[#111111] transition-colors">
            + Add Project
          </button>
        )
      )}
    </div>
  )
}

// ─── Work History ─────────────────────────────────────────────────────────────

function WorkHistoryForm({
  initial,
  onSave,
  onCancel,
  saveLabel,
}: {
  initial?: WorkHistoryItem
  onSave: (item: WorkHistoryItem) => void
  onCancel: () => void
  saveLabel?: string
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    company: initial?.company ?? '',
    startDate: initial?.startDate ?? '',
    endDate: initial?.endDate ?? '',
    description: initial?.description ?? '',
    achievementsText: initial?.achievements?.join('\n') ?? '',
  })

  const submit = () => {
    if (!form.title.trim() || !form.company.trim() || !form.startDate.trim()) {
      toast.error('Title, company, and start date required')
      return
    }
    onSave({
      title: form.title.trim(),
      company: form.company.trim(),
      startDate: form.startDate.trim(),
      endDate: form.endDate.trim() || undefined,
      description: form.description.trim() || undefined,
      achievements: form.achievementsText.split('\n').map((s) => s.trim()).filter(Boolean),
    })
  }

  return (
    <div className="border border-gray-200 rounded-md p-4 space-y-3 bg-gray-50">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Job Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. Software Engineer" required />
        <Field label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} placeholder="e.g. Shopify" required />
        <Field label="Start Date" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} placeholder="YYYY-MM" required />
        <Field label="End Date" value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} placeholder="YYYY-MM or leave blank if current" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Brief role description…"
          rows={2}
          className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-[#111111] focus:outline-none focus:border-gray-400 transition-colors resize-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Key Achievements <span className="font-normal text-gray-400">(one per line)</span></label>
        <textarea
          value={form.achievementsText}
          onChange={(e) => setForm({ ...form, achievementsText: e.target.value })}
          placeholder="Reduced API latency by 40% through caching&#10;Led migration to TypeScript across 3 services"
          rows={3}
          className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-[#111111] focus:outline-none focus:border-gray-400 transition-colors resize-none"
        />
      </div>
      <FormActions onSave={submit} onCancel={onCancel} saveLabel={saveLabel ?? 'Add'} />
    </div>
  )
}

function WorkHistoryList({
  items,
  onChange,
}: {
  items: WorkHistoryItem[]
  onChange: (items: WorkHistoryItem[]) => void
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)

  return (
    <div className="space-y-3">
      {items.length === 0 && editingIndex === null && !adding && (
        <p className="text-sm text-gray-400">No work history added yet</p>
      )}
      {items.map((job, i) =>
        editingIndex === i ? (
          <WorkHistoryForm
            key={i}
            initial={job}
            saveLabel="Save"
            onSave={(updated) => {
              onChange(items.map((x, j) => (j === i ? updated : x)))
              setEditingIndex(null)
            }}
            onCancel={() => setEditingIndex(null)}
          />
        ) : (
          <div key={i} className="flex items-start justify-between p-3 border border-gray-100 rounded-md bg-gray-50">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#111111]">{job.title}</p>
              <p className="text-sm text-gray-500">
                {job.company} · {job.startDate} – {job.endDate ?? 'Present'}
              </p>
              {job.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{job.description}</p>}
              {job.achievements.length > 0 && (
                <ul className="mt-1.5 space-y-0.5">
                  {job.achievements.slice(0, 2).map((a, k) => (
                    <li key={k} className="text-xs text-gray-500 flex gap-1.5"><span className="text-gray-300 flex-shrink-0">—</span>{a}</li>
                  ))}
                  {job.achievements.length > 2 && (
                    <li className="text-xs text-gray-400">+{job.achievements.length - 2} more</li>
                  )}
                </ul>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <button onClick={() => { setAdding(false); setEditingIndex(i) }} className="text-gray-400 hover:text-[#111111] transition-colors text-xs">Edit</button>
              <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none">×</button>
            </div>
          </div>
        )
      )}
      {adding ? (
        <WorkHistoryForm
          onSave={(item) => { onChange([...items, item]); setAdding(false) }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        editingIndex === null && (
          <button onClick={() => { setEditingIndex(null); setAdding(true) }} className="text-sm text-gray-500 hover:text-[#111111] transition-colors">
            + Add Experience
          </button>
        )
      )}
    </div>
  )
}

// ─── Open Source ──────────────────────────────────────────────────────────────

function OpenSourceForm({
  initial,
  onSave,
  onCancel,
  saveLabel,
}: {
  initial?: OpenSourceItem
  onSave: (item: OpenSourceItem) => void
  onCancel: () => void
  saveLabel?: string
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    role: initial?.role ?? '',
    techInput: initial?.techStack?.join(', ') ?? '',
    date: initial?.date ?? '',
    bulletsText: initial?.bullets?.join('\n') ?? '',
  })

  const submit = () => {
    if (!form.name.trim() || !form.role.trim()) {
      toast.error('Name and role required')
      return
    }
    onSave({
      name: form.name.trim(),
      role: form.role.trim(),
      techStack: form.techInput.split(',').map((t) => t.trim()).filter(Boolean),
      date: form.date.trim(),
      bullets: form.bulletsText.split('\n').map((b) => b.trim()).filter(Boolean),
    })
  }

  return (
    <div className="border border-gray-200 rounded-md p-4 space-y-3 bg-gray-50">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Project / Repo Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. React" required />
        <Field label="Role / Contribution" value={form.role} onChange={(v) => setForm({ ...form, role: v })} placeholder="e.g. Contributor" required />
        <Field label="Tech Stack (comma-separated)" value={form.techInput} onChange={(v) => setForm({ ...form, techInput: v })} placeholder="e.g. TypeScript, Node.js" />
        <Field label="Date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} placeholder="e.g. 2024 or Jan 2024" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Bullet Points <span className="font-normal text-gray-400">(one per line)</span></label>
        <textarea
          value={form.bulletsText}
          onChange={(e) => setForm({ ...form, bulletsText: e.target.value })}
          placeholder="Fixed accessibility bug affecting 10k+ users&#10;Added TypeScript support to core module"
          rows={3}
          className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-[#111111] focus:outline-none focus:border-gray-400 transition-colors resize-none"
        />
      </div>
      <FormActions onSave={submit} onCancel={onCancel} saveLabel={saveLabel ?? 'Add'} />
    </div>
  )
}

function OpenSourceList({ items, onChange }: { items: OpenSourceItem[]; onChange: (items: OpenSourceItem[]) => void }) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)

  return (
    <div className="space-y-3">
      {items.length === 0 && editingIndex === null && !adding && (
        <p className="text-sm text-gray-400">No open source contributions added yet</p>
      )}
      {items.map((item, i) =>
        editingIndex === i ? (
          <OpenSourceForm
            key={i}
            initial={item}
            saveLabel="Save"
            onSave={(updated) => { onChange(items.map((x, j) => (j === i ? updated : x))); setEditingIndex(null) }}
            onCancel={() => setEditingIndex(null)}
          />
        ) : (
          <div key={i} className="flex items-start justify-between p-3 border border-gray-100 rounded-md bg-gray-50">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#111111]">{item.name}</p>
              <p className="text-sm text-gray-500">{item.role}{item.date ? ` · ${item.date}` : ''}</p>
              {item.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {item.techStack.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded-full">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <button onClick={() => { setAdding(false); setEditingIndex(i) }} className="text-gray-400 hover:text-[#111111] transition-colors text-xs">Edit</button>
              <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none">×</button>
            </div>
          </div>
        )
      )}
      {adding ? (
        <OpenSourceForm
          onSave={(item) => { onChange([...items, item]); setAdding(false) }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        editingIndex === null && (
          <button onClick={() => { setEditingIndex(null); setAdding(true) }} className="text-sm text-gray-500 hover:text-[#111111] transition-colors">
            + Add Contribution
          </button>
        )
      )}
    </div>
  )
}

// ─── Achievements ─────────────────────────────────────────────────────────────

function AchievementForm({
  initial,
  onSave,
  onCancel,
  saveLabel,
}: {
  initial?: AchievementItem
  onSave: (item: AchievementItem) => void
  onCancel: () => void
  saveLabel?: string
}) {
  const [form, setForm] = useState({ title: initial?.title ?? '', subtitle: initial?.subtitle ?? '' })

  const submit = () => {
    if (!form.title.trim()) { toast.error('Title required'); return }
    onSave({ title: form.title.trim(), subtitle: form.subtitle.trim() || undefined })
  }

  return (
    <div className="border border-gray-200 rounded-md p-4 space-y-3 bg-gray-50">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. AWS Solutions Architect" required />
        <Field label="Subtitle (optional)" value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} placeholder="e.g. Amazon Web Services · 2024" />
      </div>
      <FormActions onSave={submit} onCancel={onCancel} saveLabel={saveLabel ?? 'Add'} />
    </div>
  )
}

function AchievementList({ items, onChange }: { items: AchievementItem[]; onChange: (items: AchievementItem[]) => void }) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)

  return (
    <div className="space-y-3">
      {items.length === 0 && editingIndex === null && !adding && (
        <p className="text-sm text-gray-400">No achievements added yet</p>
      )}
      {items.map((item, i) =>
        editingIndex === i ? (
          <AchievementForm
            key={i}
            initial={item}
            saveLabel="Save"
            onSave={(updated) => { onChange(items.map((x, j) => (j === i ? updated : x))); setEditingIndex(null) }}
            onCancel={() => setEditingIndex(null)}
          />
        ) : (
          <div key={i} className="flex items-start justify-between p-3 border border-gray-100 rounded-md bg-gray-50">
            <div>
              <p className="text-sm font-medium text-[#111111]">{item.title}</p>
              {item.subtitle && <p className="text-sm text-gray-500">{item.subtitle}</p>}
            </div>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <button onClick={() => { setAdding(false); setEditingIndex(i) }} className="text-gray-400 hover:text-[#111111] transition-colors text-xs">Edit</button>
              <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none">×</button>
            </div>
          </div>
        )
      )}
      {adding ? (
        <AchievementForm
          onSave={(item) => { onChange([...items, item]); setAdding(false) }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        editingIndex === null && (
          <button onClick={() => { setEditingIndex(null); setAdding(true) }} className="text-sm text-gray-500 hover:text-[#111111] transition-colors">
            + Add Achievement
          </button>
        )
      )}
    </div>
  )
}

// ─── Preferences ──────────────────────────────────────────────────────────────

const EXP_LEVELS = ['junior', 'mid', 'senior', 'staff', 'principal']
const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship']

function PreferencesSection({
  value,
  onChange,
}: {
  value: Preferences
  onChange: (p: Preferences) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Experience Level</label>
          <select
            value={value.experienceLevel ?? ''}
            onChange={(e) => onChange({ ...value, experienceLevel: e.target.value || undefined })}
            className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-[#111111] focus:outline-none focus:border-gray-400 transition-colors bg-white"
          >
            <option value="">Not specified</option>
            {EXP_LEVELS.map((l) => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Remote Preference</label>
          <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={value.remote ?? false}
              onChange={(e) => onChange({ ...value, remote: e.target.checked })}
              className="w-4 h-4 accent-[#111111] rounded"
            />
            <span className="text-sm text-[#111111]">Open to remote roles</span>
          </label>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Salary Min (annual)</label>
          <input
            type="number"
            value={value.salaryMin ?? ''}
            onChange={(e) => onChange({ ...value, salaryMin: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="e.g. 80000"
            className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-[#111111] focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Salary Max (annual)</label>
          <input
            type="number"
            value={value.salaryMax ?? ''}
            onChange={(e) => onChange({ ...value, salaryMax: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="e.g. 120000"
            className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-[#111111] focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">Job Types</label>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((jt) => {
            const selected = (value.jobTypes ?? []).includes(jt)
            return (
              <button
                key={jt}
                type="button"
                onClick={() => {
                  const current = value.jobTypes ?? []
                  onChange({
                    ...value,
                    jobTypes: selected ? current.filter((t) => t !== jt) : [...current, jt],
                  })
                }}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  selected ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {jt}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const [headline, setHeadline] = useState('')
  const [summary, setSummary] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [phone, setPhone] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [githubUsername, setGithubUsername] = useState('')
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [githubSyncing, setGithubSyncing] = useState(false)
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [education, setEducation] = useState<EducationItem[]>([])
  const [certifications, setCertifications] = useState<CertificationItem[]>([])
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [openSource, setOpenSource] = useState<OpenSourceItem[]>([])
  const [achievements, setAchievements] = useState<AchievementItem[]>([])
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([])
  const [preferences, setPreferences] = useState<Preferences>({})
  const [suggestions, setSuggestions] = useState<SuggestedSkill[]>([])
  const [parsing, setParsing] = useState(false)
  const [linkedinImporting, setLinkedinImporting] = useState(false)

  const initialized = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const linkedinFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const p = await getProfile()
        if (p) {
          setProfile(p)
          setHeadline(p.headline ?? '')
          setSummary(p.summary ?? '')
          setPortfolioUrl(p.portfolioUrl ?? '')
          setPhone(p.phone ?? '')
          setLinkedinUrl(p.linkedinUrl ?? '')
          setGithubUrl(p.githubUrl ?? '')
          setGithubUsername(p.githubUsername ?? '')
          setGithubRepos(p.githubRepos ?? [])
          setSkills(p.skills ?? [])
          setEducation(p.education ?? [])
          setCertifications(p.certifications ?? [])
          setProjects(p.projects ?? [])
          setOpenSource(p.openSource ?? [])
          setAchievements(p.achievements ?? [])
          setWorkHistory(p.workHistory ?? [])
          setPreferences(p.preferences ?? {})
          setSuggestions((p.suggestedSkills as SuggestedSkill[]) ?? [])
        }
      } catch {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
        initialized.current = true
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (initialized.current) setDirty(true)
  }, [headline, summary, portfolioUrl, phone, linkedinUrl, githubUrl, githubUsername, skills, education, certifications, projects, openSource, achievements, workHistory, preferences])

  const addSkills = () => {
    const incoming = skillInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (incoming.length === 0) return
    const existing = skills.map((s) => s.toLowerCase())
    const deduped = incoming.filter((s) => !existing.includes(s.toLowerCase()))
    if (deduped.length === 0) {
      toast.error('All skills already added')
      return
    }
    setSkills([...skills, ...deduped])
    setSkillInput('')
  }

  const save = async () => {
    setSaving(true)
    try {
      const input: UpsertProfileInput = {
        headline: headline.trim() || undefined,
        summary: summary.trim() || undefined,
        portfolioUrl: portfolioUrl.trim() || undefined,
        phone: phone.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        githubUsername: githubUsername.trim() || undefined,
        skills,
        education,
        certifications,
        projects,
        openSource,
        achievements,
        workHistory,
        languages: profile?.languages ?? [],
        preferences,
      }
      const updated = await upsertProfile(input)
      setProfile(updated)
      setDirty(false)
      toast.success('Profile saved')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleGitHubSync = async () => {
    if (!githubUsername.trim()) {
      toast.error('Enter a GitHub username first')
      return
    }
    setGithubSyncing(true)
    try {
      const repos = await syncGitHub(githubUsername.trim())
      setGithubRepos(repos)
      toast.success(`Synced ${repos.length} repos`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Failed to sync GitHub repos')
    } finally {
      setGithubSyncing(false)
    }
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setParsing(true)
    try {
      const extracted = await parseResume(file)
      if (extracted.headline) setHeadline(extracted.headline)
      if (extracted.summary) setSummary(extracted.summary)
      if (extracted.skills?.length) {
        setSkills((prev) => {
          const existing = new Set(prev.map((s) => s.toLowerCase()))
          const newSkills = (extracted.skills ?? []).filter((s) => !existing.has(s.toLowerCase()))
          return [...prev, ...newSkills]
        })
      }
      if (extracted.workHistory?.length) setWorkHistory(extracted.workHistory)
      if (extracted.education?.length) setEducation(extracted.education)
      if (extracted.certifications?.length) setCertifications(extracted.certifications)
      if (extracted.projects?.length) setProjects(extracted.projects)
      if (extracted.preferences) setPreferences((prev) => ({ ...prev, ...extracted.preferences }))
      toast.success('Profile fields populated — review and save')
    } catch {
      toast.error('Failed to parse resume')
    } finally {
      setParsing(false)
      e.target.value = ''
    }
  }

  const handleLinkedInImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLinkedinImporting(true)
    try {
      const extracted = await importLinkedIn(file)
      if (extracted.headline) setHeadline(extracted.headline)
      if (extracted.summary) setSummary(extracted.summary)
      if (extracted.skills?.length) setSkills(extracted.skills)
      if (extracted.workHistory?.length) setWorkHistory(extracted.workHistory)
      if (extracted.education?.length) setEducation(extracted.education)
      if (extracted.certifications?.length) setCertifications(extracted.certifications)
      const parts: string[] = []
      if (extracted.skills?.length) parts.push(`${extracted.skills.length} skills`)
      if (extracted.workHistory?.length) parts.push(`${extracted.workHistory.length} roles`)
      if (extracted.education?.length) parts.push(`${extracted.education.length} education`)
      toast.success(`LinkedIn imported: ${parts.join(', ')} — review and save`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Failed to parse LinkedIn export')
    } finally {
      setLinkedinImporting(false)
      e.target.value = ''
    }
  }

  const handleAcceptSuggestion = async (skill: string) => {
    try {
      const updated = await acceptSuggestion(skill)
      setSkills(updated.skills ?? [])
      setSuggestions((updated.suggestedSkills as SuggestedSkill[]) ?? [])
      toast.success(`"${skill}" added to skills`)
    } catch {
      toast.error('Failed to accept suggestion')
    }
  }

  const handleDismissSuggestion = async (skill: string) => {
    try {
      const updated = await dismissSuggestion(skill)
      setSuggestions((updated.suggestedSkills as SuggestedSkill[]) ?? [])
    } catch {
      toast.error('Failed to dismiss suggestion')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-400 text-sm">Loading profile…</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111111]">Profile</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Your skills, education, and projects used for job matching</p>
        </div>
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="px-3 py-1.5 bg-[#111111] hover:bg-gray-800 text-white font-medium rounded-md transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,text/plain,application/pdf"
          className="hidden"
          onChange={handleResumeUpload}
        />
        <input
          ref={linkedinFileInputRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={handleLinkedInImport}
        />
        {(parsing || linkedinImporting) ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-500">{linkedinImporting ? 'Importing LinkedIn data…' : 'Parsing resume…'}</div>
            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#111111] rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-[#111111]">Auto-fill profile</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-[#111111] text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                Upload Resume
              </button>
              <button
                type="button"
                onClick={() => linkedinFileInputRef.current?.click()}
                className="px-3 py-1.5 border border-gray-300 text-[#111111] text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                Import LinkedIn Data
              </button>
            </div>
            <p className="text-xs text-gray-400">Resume: PDF or text file · LinkedIn: your data export ZIP</p>
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm font-medium text-blue-800 mb-3">Skill suggestions based on your job matches</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <div key={s.skill} className="flex items-center gap-1.5 bg-white border border-blue-200 rounded-full px-3 py-1">
                <span className="text-xs font-medium text-blue-800">{s.skill}</span>
                <button onClick={() => handleAcceptSuggestion(s.skill)} className="text-xs text-green-600 hover:text-green-800 font-medium transition-colors">Accept</button>
                <span className="text-blue-200">·</span>
                <button onClick={() => handleDismissSuggestion(s.skill)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Dismiss</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <SectionCard title="About">
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Full-Stack Engineer with 5 years experience"
              className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-[#111111] focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief professional summary…"
              rows={3}
              className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-[#111111] focus:outline-none focus:border-gray-400 transition-colors resize-none"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Contact & Links">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone" value={phone} onChange={setPhone} placeholder="e.g. +1 (647) 555-0123" />
          <Field label="Portfolio URL" type="url" value={portfolioUrl} onChange={setPortfolioUrl} placeholder="https://yourportfolio.com" />
          <Field label="LinkedIn URL" type="url" value={linkedinUrl} onChange={setLinkedinUrl} placeholder="https://linkedin.com/in/yourhandle" />
          <Field label="GitHub URL" type="url" value={githubUrl} onChange={setGithubUrl} placeholder="https://github.com/yourhandle" />
        </div>
      </SectionCard>

      <SectionCard title="GitHub Projects">
        <div className="space-y-3">
          <p className="text-xs text-gray-500">Sync your public repos — select relevant ones when generating a resume.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="GitHub username"
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm text-[#111111] focus:outline-none focus:border-gray-400 transition-colors"
            />
            <button
              type="button"
              onClick={handleGitHubSync}
              disabled={githubSyncing}
              className="px-3 py-1.5 bg-ink text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {githubSyncing ? 'Syncing…' : 'Sync'}
            </button>
          </div>
          {githubRepos.length > 0 && (
            <div className="space-y-1.5">
              {githubRepos.map((r) => (
                <div key={r.name} className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-md">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-[#111111] truncate">{r.name}</span>
                    {r.language && <span className="text-xs text-gray-400 shrink-0">{r.language}</span>}
                    {r.readme ? <span className="text-xs text-green-600 shrink-0">README</span> : <span className="text-xs text-gray-300 shrink-0">no README</span>}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">★ {r.stars}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Skills">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {skills.length === 0 && <span className="text-sm text-gray-400">No skills added yet</span>}
            {skills.map((skill) => (
              <Tag key={skill} label={skill} onRemove={() => setSkills(skills.filter((s) => s !== skill))} />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkills() } }}
              placeholder="Add skills — comma-separated or one at a time, press Enter"
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm text-[#111111] focus:outline-none focus:border-gray-400 transition-colors"
            />
            <button
              onClick={addSkills}
              disabled={!skillInput.trim()}
              className="px-3 py-1.5 bg-[#111111] text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Education">
        <EducationList items={education} onChange={(items) => setEducation(items)} />
      </SectionCard>

      <SectionCard title="Certifications">
        <CertificationList items={certifications} onChange={(items) => setCertifications(items)} />
      </SectionCard>

      <SectionCard title="Projects">
        <ProjectList items={projects} onChange={(items) => setProjects(items)} />
      </SectionCard>

      <SectionCard title="Open Source Contributions">
        <OpenSourceList items={openSource} onChange={(items) => setOpenSource(items)} />
      </SectionCard>

      <SectionCard title="Professional Development & Achievements">
        <AchievementList items={achievements} onChange={(items) => setAchievements(items)} />
      </SectionCard>

      <SectionCard title="Work History">
        <WorkHistoryList items={workHistory} onChange={(items) => setWorkHistory(items)} />
      </SectionCard>

      <SectionCard title="Job Preferences">
        <PreferencesSection value={preferences} onChange={(p) => setPreferences(p)} />
      </SectionCard>

      {dirty && (
        <div className="flex justify-end pb-4">
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-[#111111] hover:bg-gray-800 text-white font-medium rounded-md transition-colors text-sm disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}
