import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function CreateJobPage() {
  const navigate = useNavigate()
  const [jobType, setJobType] = useState('email')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Call API to create job
      navigate('/jobs')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Job</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Job Type</label>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="email">Email</option>
            <option value="pdf">PDF Generation</option>
            <option value="generic">Generic</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating...' : 'Create Job'}
        </button>
      </form>
    </div>
  )
}
