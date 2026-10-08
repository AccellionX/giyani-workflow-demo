import { useQuery } from '@tanstack/react-query'
import type { AuditEntry } from '../contracts'
import { apiClient } from '../client'

export function useAuditLog() {
  return useQuery({
    queryKey: ['audit'],
    queryFn: () => apiClient<AuditEntry[]>('/audit'),
  })
}
