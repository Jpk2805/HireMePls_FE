import { apiClient } from './api'

export type ApplicationStatus = 'applied' | 'phone_screen' | 'onsite' | 'offer' | 'rejected' | 'withdrawn'

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'applied', 'phone_screen', 'onsite', 'offer', 'rejected', 'withdrawn',
]

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  phone_screen: 'Phone Screen',
  onsite: 'Onsite',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: 'bg-blue-50 text-blue-700',
  phone_screen: 'bg-violet-50 text-violet-700',
  onsite: 'bg-amber-50 text-amber-700',
  offer: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  withdrawn: 'bg-gray-50 text-gray-500',
}

export interface Application {
  id: string
  userId: string
  jobPostingId: string
  status: ApplicationStatus
  appliedAt: string
  notes: string | null
  createdAt: string
  updatedAt: string
  jobPosting: {
    id: string
    title: string
    company: string
    url: string
    source: string
    locations: string[]
  }
}

export const listApplications = async (): Promise<Application[]> => {
  const res = await apiClient.get<Application[]>('/applications')
  return res.data
}

export const createApplication = async (jobPostingId: string, notes?: string): Promise<Application> => {
  const res = await apiClient.post<Application>('/applications', { jobPostingId, notes })
  return res.data
}

export const updateApplicationStatus = async (
  id: string,
  status: ApplicationStatus,
  notes?: string,
): Promise<Application> => {
  const res = await apiClient.patch<Application>(`/applications/${id}/status`, { status, notes })
  return res.data
}

export const deleteApplication = async (id: string): Promise<void> => {
  await apiClient.delete(`/applications/${id}`)
}

export interface ApplicationStats {
  total: number
  byStatus: Record<ApplicationStatus, number>
  bySource: { source: string; applied: number; interviewed: number; rate: number }[]
  avgScoreByStatus: { status: ApplicationStatus; avgScore: number | null }[]
}

export const getApplicationStats = async (): Promise<ApplicationStats> => {
  const res = await apiClient.get<ApplicationStats>('/applications/stats')
  return res.data
}
