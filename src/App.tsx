import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@context/AuthContext'
import { useAuth } from '@hooks/useAuth'

// Pages
import LoginPage from '@pages/auth/LoginPage'
import RegisterPage from '@pages/auth/RegisterPage'
import DashboardPage from '@pages/dashboard/DashboardPage'
import ResumesPage from '@pages/resumes/ResumesPage'
import ResumeDetailPage from '@pages/resumes/ResumeDetailPage'
import CreateResumePage from '@pages/resumes/CreateResumePage'
import JobBoardPage from '@pages/job-postings/JobBoardPage'
import JobPostingDetailPage from '@pages/job-postings/JobPostingDetailPage'
import SavedSearchesPage from '@pages/saved-searches/SavedSearchesPage'
import CompaniesPage from '@pages/companies/CompaniesPage'
import CompanyDetailPage from '@pages/companies/CompanyDetailPage'
import ProfilePage from '@pages/profile/ProfilePage'
import OutreachPage from '@pages/job-postings/OutreachPage'
import ApplicationsPage from '@pages/applications/ApplicationsPage'

// Components
import MainLayout from '@components/layout/MainLayout'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div>Loading...</div>
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route path="/" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />

      <Route path="/job-postings" element={<ProtectedRoute><MainLayout><JobBoardPage /></MainLayout></ProtectedRoute>} />
      <Route path="/job-postings/:id" element={<ProtectedRoute><MainLayout><JobPostingDetailPage /></MainLayout></ProtectedRoute>} />
      <Route path="/job-postings/:id/outreach" element={<ProtectedRoute><MainLayout><OutreachPage /></MainLayout></ProtectedRoute>} />

      <Route path="/saved-searches" element={<ProtectedRoute><MainLayout><SavedSearchesPage /></MainLayout></ProtectedRoute>} />

      <Route path="/companies" element={<ProtectedRoute><MainLayout><CompaniesPage /></MainLayout></ProtectedRoute>} />
      <Route path="/companies/:id" element={<ProtectedRoute><MainLayout><CompanyDetailPage /></MainLayout></ProtectedRoute>} />

      <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />

      <Route path="/resumes" element={<ProtectedRoute><MainLayout><ResumesPage /></MainLayout></ProtectedRoute>} />
      <Route path="/resumes/create" element={<ProtectedRoute><MainLayout><CreateResumePage /></MainLayout></ProtectedRoute>} />
      <Route path="/resumes/:id" element={<ProtectedRoute><MainLayout><ResumeDetailPage /></MainLayout></ProtectedRoute>} />

      <Route path="/applications" element={<ProtectedRoute><MainLayout><ApplicationsPage /></MainLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </AuthProvider>
    </Router>
  )
}
