import { apiClient } from './api'

export interface WorkHistoryItem {
  title: string
  company: string
  startDate: string
  endDate?: string
  description?: string
  achievements: string[]
}

export interface EducationItem {
  degree: string
  institution: string
  field?: string
  graduationYear?: number
}

export interface CertificationItem {
  name: string
  issuer: string
  year?: number
}

export interface ProjectItem {
  name: string
  description?: string
  techStack: string[]
  url?: string
}

export interface OpenSourceItem {
  name: string
  role: string
  techStack: string[]
  date: string
  bullets: string[]
}

export interface AchievementItem {
  title: string
  subtitle?: string
}

export interface LanguageItem {
  language: string
  proficiency: 'native' | 'fluent' | 'professional' | 'basic'
}

export interface Preferences {
  remote?: boolean
  salaryMin?: number
  salaryMax?: number
  jobTypes?: string[]
  experienceLevel?: string
}

export interface SuggestedSkill {
  skill: string
  reason: string
  fromPostingId: string
}

export interface GitHubRepo {
  name: string
  description: string | null
  language: string | null
  stars: number
  topics: string[]
  url: string
  readme: string | null
  syncedAt: string
}

export interface UserProfile {
  id: string
  userId: string
  headline?: string
  summary?: string
  skills: string[]
  workHistory: WorkHistoryItem[]
  education: EducationItem[]
  certifications: CertificationItem[]
  projects: ProjectItem[]
  openSource: OpenSourceItem[]
  achievements: AchievementItem[]
  languages: LanguageItem[]
  preferences: Preferences
  suggestedSkills: SuggestedSkill[]
  dismissedSkills: string[]
  portfolioUrl?: string
  phone?: string
  linkedinUrl?: string
  githubUrl?: string
  githubUsername?: string
  githubRepos: GitHubRepo[]
  createdAt: string
  updatedAt: string
}

export interface UpsertProfileInput {
  headline?: string
  summary?: string
  skills?: string[]
  workHistory?: WorkHistoryItem[]
  education?: EducationItem[]
  certifications?: CertificationItem[]
  projects?: ProjectItem[]
  openSource?: OpenSourceItem[]
  achievements?: AchievementItem[]
  languages?: LanguageItem[]
  preferences?: Preferences
  portfolioUrl?: string
  phone?: string
  linkedinUrl?: string
  githubUrl?: string
  githubUsername?: string
}

export const getProfile = async (): Promise<UserProfile | null> => {
  try {
    const response = await apiClient.get('/profile')
    return response.data
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosErr = err as { response: { status: number } }
      if (axiosErr.response?.status === 404) return null
    }
    throw err
  }
}

export const upsertProfile = async (input: UpsertProfileInput): Promise<UserProfile> => {
  const response = await apiClient.put('/profile', input)
  return response.data
}

export const acceptSuggestion = async (skill: string): Promise<UserProfile> => {
  const response = await apiClient.post(`/profile/suggestions/${encodeURIComponent(skill)}/accept`)
  return response.data
}

export const dismissSuggestion = async (skill: string): Promise<UserProfile> => {
  const response = await apiClient.post(`/profile/suggestions/${encodeURIComponent(skill)}/dismiss`)
  return response.data
}

export const extractFromText = async (text: string): Promise<Partial<UpsertProfileInput>> => {
  const response = await apiClient.post('/profile/enhance/extract', { text })
  return response.data.extracted ?? {}
}

export const parseResume = async (file: File): Promise<Partial<UpsertProfileInput>> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post('/profile/resume/parse', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.extracted ?? {}
}

export const syncGitHub = async (username: string): Promise<GitHubRepo[]> => {
  const response = await apiClient.post('/profile/github/sync', { username })
  return response.data.repos
}

export interface LinkedInImportResult {
  headline?: string
  summary?: string
  skills: string[]
  workHistory: WorkHistoryItem[]
  education: EducationItem[]
  certifications: CertificationItem[]
}

export const importLinkedIn = async (file: File): Promise<LinkedInImportResult> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post('/profile/linkedin-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.extracted
}
