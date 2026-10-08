import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReviewActionRequest, ReviewItem } from '../contracts'
import { apiClient, toQuery } from '../client'

export function useReviewQueue(status: 'pending' | 'all' = 'pending') {
  return useQuery({
    queryKey: ['review', status],
    queryFn: () =>
      apiClient<ReviewItem[]>(`/review${toQuery({ status })}`),
  })
}

export function useApproveReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<ReviewItem>(`/review/${id}/approve`, { method: 'POST', body: '{}' }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['review'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['audit'] }),
      ])
    },
  })
}

export function useReturnReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      apiClient<ReviewItem>(`/review/${id}/return`, {
        method: 'POST',
        body: JSON.stringify({ note } satisfies ReviewActionRequest),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['review'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['audit'] }),
      ])
    },
  })
}
