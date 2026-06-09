import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(email, password, name)
      navigate('/dashboard')
    } catch (error) {
      // Error toast handled by context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-muted">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-ink rounded-xl mb-5">
            <span className="text-white font-bold text-sm tracking-tight">JP</span>
          </div>
          <h1 className="text-2xl font-semibold text-ink">Create account</h1>
          <p className="text-gray-500 mt-1.5 text-sm">Join the job processing platform</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-md p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-ink placeholder-gray-400 focus:outline-none focus:border-gray-400 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-ink placeholder-gray-400 focus:outline-none focus:border-gray-400 text-sm transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-ink placeholder-gray-400 focus:outline-none focus:border-gray-400 text-sm transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 mt-2 bg-ink hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-ink font-medium hover:underline">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  )
}
