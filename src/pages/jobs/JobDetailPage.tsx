import { useParams } from 'react-router-dom'

export default function JobDetailPage() {
  const { id } = useParams()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Job #{id}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Job Details</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Type:</span> <span>-</span></p>
            <p><span className="font-medium">Status:</span> <span>-</span></p>
            <p><span className="font-medium">Created:</span> <span>-</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Execution Details</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Attempts:</span> <span>-</span></p>
            <p><span className="font-medium">Started:</span> <span>-</span></p>
            <p><span className="font-medium">Completed:</span> <span>-</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Logs</h3>
        <p className="text-gray-500">No logs yet</p>
      </div>
    </div>
  )
}
