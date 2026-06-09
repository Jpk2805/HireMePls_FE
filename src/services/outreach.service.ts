import { get, post, put, delete_ } from '@services/api'

export interface OutreachDraft {
  id: string
  userId: string
  jobPostingId: string
  contactId: string | null
  type: 'cold_email' | 'linkedin_note'
  subject: string | null
  body: string
  createdAt: string
  updatedAt: string
  contact?: { id: string; name: string; title: string | null; email: string | null } | null
}

export interface InterviewPrep {
  questions: string[]
  talkingPoints: string[]
  companyContext: string
  generatedAt: string
}

export const getDrafts = (jobPostingId: string): Promise<{ drafts: OutreachDraft[] }> =>
  get(`/job-postings/${jobPostingId}/outreach`)

export const createDraft = (
  jobPostingId: string,
  type: 'cold_email' | 'linkedin_note',
  recipientName?: string,
  recipientTitle?: string
): Promise<OutreachDraft> =>
  post(`/job-postings/${jobPostingId}/outreach`, { type, recipientName, recipientTitle })

export const updateDraft = (draftId: string, body: string, subject?: string | null): Promise<OutreachDraft> =>
  put(`/outreach/${draftId}`, { body, subject })

export const deleteDraft = (draftId: string): Promise<{ message: string }> =>
  delete_(`/outreach/${draftId}`)

export const getInterviewPrep = (jobPostingId: string): Promise<InterviewPrep> =>
  get(`/job-postings/${jobPostingId}/interview-prep`)
