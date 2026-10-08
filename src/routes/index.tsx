import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireRole } from '@/auth/RequireRole'
import { AppShell } from '@/components/layout/AppShell'
import { AboutPage } from '@/features/about/AboutPage'
import { AuditLogPage } from '@/features/audit/AuditLogPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { IntakePage } from '@/features/intake/IntakePage'
import { PatientsPage } from '@/features/patients/PatientsPage'
import { ReviewQueuePage } from '@/features/review/ReviewQueuePage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          index
          element={
            <RequireRole permission="view:dashboard">
              <DashboardPage />
            </RequireRole>
          }
        />
        <Route
          path="patients"
          element={
            <RequireRole permission="view:patients">
              <PatientsPage />
            </RequireRole>
          }
        />
        <Route
          path="intake"
          element={
            <RequireRole permission="create:intake">
              <IntakePage />
            </RequireRole>
          }
        />
        <Route
          path="review"
          element={
            <RequireRole permission="view:review">
              <ReviewQueuePage />
            </RequireRole>
          }
        />
        <Route
          path="audit"
          element={
            <RequireRole permission="view:audit">
              <AuditLogPage />
            </RequireRole>
          }
        />
        <Route
          path="about"
          element={
            <RequireRole permission="view:about">
              <AboutPage />
            </RequireRole>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
