import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const location = useLocation()

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/jobs', label: 'Jobs' },
    { href: '/jobs/create', label: 'Create Job' },
  ]

  return (
    <aside className="w-64 bg-gray-900 text-white">
      <div className="p-6">
        <h2 className="text-lg font-bold">Menu</h2>
      </div>
      <nav className="space-y-2 px-4">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={`block px-4 py-2 rounded ${
              location.pathname === link.href
                ? 'bg-blue-600'
                : 'hover:bg-gray-800'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
