import { useQuery } from '@tanstack/react-query'
import type {
  AdminDashboard,
  ClinicianDashboard,
  FrontDeskDashboard,
  Role,
} from '../contracts'
import { apiClient } from '../client'

export function useAdminDashboard(enabled: boolean) {
  return useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => apiClient<AdminDashboard>('/dashboard/admin'),
    enabled,
  })
}

export function useFrontDeskDashboard(enabled: boolean) {
  return useQuery({
    queryKey: ['dashboard', 'front-desk'],
    queryFn: () => apiClient<FrontDeskDashboard>('/dashboard/front-desk'),
    enabled,
  })
}

export function useClinicianDashboard(enabled: boolean) {
  return useQuery({
    queryKey: ['dashboard', 'clinician'],
    queryFn: () => apiClient<ClinicianDashboard>('/dashboard/clinician'),
    enabled,
  })
}

export function useDashboardForRole(role: Role) {
  const admin = useAdminDashboard(role === 'admin')
  const frontDesk = useFrontDeskDashboard(role === 'front_desk')
  const clinician = useClinicianDashboard(role === 'clinician')

  if (role === 'admin') return admin
  if (role === 'front_desk') return frontDesk
  return clinician
}
