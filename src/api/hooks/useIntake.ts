import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  ClinicianOption,
  EligibilityCheckRequest,
  EligibilityCheckResponse,
  IntakeSubmitRequest,
  IntakeSubmitResponse,
} from '../contracts'
import { apiClient } from '../client'

export function useClinicians() {
  return useQuery({
    queryKey: ['clinicians'],
    queryFn: () => apiClient<ClinicianOption[]>('/clinicians'),
  })
}

export function useEligibilityCheck() {
  return useMutation({
    mutationFn: (body: EligibilityCheckRequest) =>
      apiClient<EligibilityCheckResponse>('/intake/eligibility', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  })
}

export function useSubmitIntake() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: IntakeSubmitRequest) =>
      apiClient<IntakeSubmitResponse>('/intake', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
        queryClient.invalidateQueries({ queryKey: ['review'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['audit'] }),
      ])
    },
  })
}
