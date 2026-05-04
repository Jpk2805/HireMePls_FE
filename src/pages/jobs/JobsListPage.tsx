import { Link } from 'react-router-dom'

export default function JobsListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Jobs</h1>
        <Link
          to="/jobs/create"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Job
        </Link>
      </div>

      <div className="bg-white rounded shadow">
        <div className="p-6">
          <p className="text-gray-500">No jobs yet. Create one to get started!</p>
        </div>
      </div>
    </div>
  )
}
