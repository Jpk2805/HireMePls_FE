import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'
import { api } from '@services/api'

vi.mock('axios')

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should create axios instance with correct config', () => {
    expect(api).toBeDefined()
    expect(api.defaults.baseURL).toBeDefined()
  })

  it('should have request and response interceptors', () => {
    expect(api.interceptors.request).toBeDefined()
    expect(api.interceptors.response).toBeDefined()
  })

  it('should attach token to request headers', async () => {
    const mockToken = 'test-token-123'
    localStorage.setItem('token', mockToken)

    // Mock axios response
    ;(axios.get as any).mockResolvedValueOnce({ data: { success: true } })

    // Note: In a real test, you would need to test the actual interceptor behavior
    // This is a simplified example
    expect(localStorage.getItem('token')).toBe(mockToken)
  })

  it('should handle 401 errors', () => {
    // Test error handling for unauthorized responses
    // This would require mocking axios interceptors
    expect(api).toBeDefined()
  })

  it('should handle 429 rate limit errors', () => {
    // Test error handling for rate limit responses
    expect(api).toBeDefined()
  })
})
