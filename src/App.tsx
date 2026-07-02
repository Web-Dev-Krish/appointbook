import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth'

// Public
import Landing      from './pages/Landing'
import LoginPage    from './pages/Login'
import RegisterPage from './pages/Register'
import BookingPage  from './pages/Booking'
import BlogList     from './pages/BlogList'
import BlogPost     from './pages/BlogPost'
import PrivacyPage  from './pages/Legal'
import TermsPage    from './pages/Terms'

// Dashboard
import DashboardLayout  from './pages/dashboard/Layout'
import DashboardHome    from './pages/dashboard/Home'
import LeadsPage        from './pages/dashboard/Leads'
import CalendarPage     from './pages/dashboard/Calendar'
import BookingPageMgr   from './pages/dashboard/BookingPage'
import SettingsPage     from './pages/dashboard/Settings'
import BillingPage      from './pages/dashboard/Billing'

// Admin
import AdminLayout      from './pages/admin/Layout'
import AdminDashboard   from './pages/admin/Dashboard'
import AdminUsers       from './pages/admin/Users'
import AdminPlans       from './pages/admin/Plans'
import AdminAds         from './pages/admin/Ads'
import AdminBlog        from './pages/admin/Blog'
import AdminLegal       from './pages/admin/Legal'
import AdminSettings    from './pages/admin/Settings'

function Protected({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/></div>
  if (!user)   return <Navigate to="/login" replace />
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"               element={<Landing />} />
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/register"       element={<RegisterPage />} />
      <Route path="/book/:slug"     element={<BookingPage />} />
      <Route path="/blog"           element={<BlogList />} />
      <Route path="/blog/:slug"     element={<BlogPost />} />
      <Route path="/privacy-policy" element={<PrivacyPage />} />
      <Route path="/terms"          element={<TermsPage />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<Protected><DashboardLayout /></Protected>}>
        <Route index                  element={<DashboardHome />} />
        <Route path="leads"           element={<LeadsPage />} />
        <Route path="calendar"        element={<CalendarPage />} />
        <Route path="booking-page"    element={<BookingPageMgr />} />
        <Route path="settings"        element={<SettingsPage />} />
        <Route path="billing"         element={<BillingPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<Protected adminOnly><AdminLayout /></Protected>}>
        <Route index               element={<AdminDashboard />} />
        <Route path="users"        element={<AdminUsers />} />
        <Route path="plans"        element={<AdminPlans />} />
        <Route path="ads"          element={<AdminAds />} />
        <Route path="blog"         element={<AdminBlog />} />
        <Route path="legal"        element={<AdminLegal />} />
        <Route path="settings"     element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
