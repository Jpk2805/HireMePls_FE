import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import * as jobService from '@services/job.service'

export default function CreateJobPage() {
  const navigate = useNavigate()
  const [jobType, setJobType] = useState('email')
  const [jobName, setJobName] = useState('')
  const [loading, setLoading] = useState(false)

  // Email fields
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  // Scrape fields
  const [url, setUrl] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: jobService.CreateJobPayload = {
        type: jobType as any,
        name: jobName || undefined,
        payload: {},
      }

      if (jobType === 'email') {
        if (!email || !subject || !body) {
          throw new Error('Email, subject, and body are required')
        }
        payload.payload = {
          to: email,
          subject,
          body,
        }
      } else if (jobType === 'scrape') {
        if (!url) {
          throw new Error('URL is required')
        }
        payload.payload = {
          url,
        }
      }

      await jobService.createJob(payload)
      navigate('/jobs')
    } catch (error: any) {
      console.error('Failed to create job:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div>
        <h1 className="text-4xl font-bold text-white">Create New Job</h1>
        <p className="text-slate-400 mt-2">Set up a new background job to process</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl">
          <label className="block text-sm font-medium text-slate-300 mb-3">Job Type *</label>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="email">📧 Email</option>
            <option value="scrape">🔍 Web Scrape</option>
            <option value="generic">⚙️ Generic Job</option>
          </select>
        </div>

        <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl">
          <label className="block text-sm font-medium text-slate-300 mb-3">Job Name (optional)</label>
          <input
            type="text"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            placeholder="e.g., Welcome Email Campaign"
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Email Job Fields */}
        {jobType === 'email' && (
          <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-semibold text-white">Email Details</h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Recipient Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Subject *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject line"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Body *</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Email message body"
                rows={6}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                required
              />
            </div>
          </div>
        )}

        {/* Scrape Job Fields */}
        {jobType === 'scrape' && (
          <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/30 p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-semibold text-white">Scrape Details</h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Target URL *</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Creating job...' : 'Create Job'}
          </button>
        </div>
      </form>
    </div>
  )
}
