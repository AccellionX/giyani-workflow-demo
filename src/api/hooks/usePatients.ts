import { useQuery } from '@tanstack/react-query'
import type { PaginatedResponse, Patient, PatientListParams } from '../contracts'
import { apiClient, toQuery } from '../client'

export function usePatients(params: PatientListParams) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () =>
      apiClient<PaginatedResponse<Patient>>(
        `/patients${toQuery({
          search: params.search,
          status: params.status,
          sortBy: params.sortBy,
          sortDir: params.sortDir,
          page: params.page,
          pageSize: params.pageSize,
        })}`,
      ),
  })
}

export function usePatient(id: string | null) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => apiClient<Patient>(`/patients/${id}`),
    enabled: Boolean(id),
  })
}
