import { get, post, put, patch, delete_ } from '@services/api'
import type { SavedSearch, CreateSavedSearchInput } from '@/types/index'

export const listSavedSearches = (): Promise<SavedSearch[]> =>
  get<SavedSearch[]>('/saved-searches')

export const getSavedSearch = (id: string): Promise<SavedSearch> =>
  get<SavedSearch>(`/saved-searches/${id}`)

export const createSavedSearch = (data: CreateSavedSearchInput): Promise<SavedSearch> =>
  post<SavedSearch>('/saved-searches', data)

export const updateSavedSearch = (
  id: string,
  data: Partial<CreateSavedSearchInput>
): Promise<SavedSearch> => put<SavedSearch>(`/saved-searches/${id}`, data)

export const deleteSavedSearch = (id: string): Promise<void> =>
  delete_(`/saved-searches/${id}`)

export const toggleSavedSearch = (id: string): Promise<SavedSearch> =>
  patch<SavedSearch>(`/saved-searches/${id}/toggle`)

export const triggerSavedSearch = (id: string): Promise<{ message: string; queued: number }> =>
  post(`/saved-searches/${id}/run`)
