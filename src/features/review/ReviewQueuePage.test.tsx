import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReviewItem } from '@/api/contracts'
import { RoleProvider } from '@/auth/RoleContext'
import { ToastProvider } from '@/components/ui'
import { setStoredRole } from '@/api/client'
import { ReviewQueuePage } from './ReviewQueuePage'

const pendingItem: ReviewItem = {
  id: 'rev-test-1',
  type: 'intake',
  title: 'Test intake review',
  patientName: 'Avery Demotron',
  patientId: 'pat-01',
  submittedBy: 'Jordan Lee',
  submittedAt: new Date().toISOString(),
  status: 'pending',
  summary: 'Needs clinician eyes',
  details: 'Detailed mock content for approve action test.',
}

const approveReview = vi.fn()

vi.mock('@/api/hooks/useReview', () => ({
  useReviewQueue: () => ({
    data: [pendingItem],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useApproveReview: () => ({
    mutateAsync: approveReview,
    isPending: false,
  }),
  useReturnReview: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

function renderPage() {
  setStoredRole('clinician')
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <RoleProvider>
        <ToastProvider>
          <MemoryRouter>
            <ReviewQueuePage />
          </MemoryRouter>
        </ToastProvider>
      </RoleProvider>
    </QueryClientProvider>,
  )
}

describe('review approve action', () => {
  beforeEach(() => {
    approveReview.mockReset()
    approveReview.mockResolvedValue({ ...pendingItem, status: 'approved' })
  })

  it('calls approve mutation from the review panel', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /Test intake review/i }))
    await user.click(screen.getByRole('button', { name: /^Approve$/i }))

    await waitFor(() => {
      expect(approveReview).toHaveBeenCalledWith('rev-test-1')
    })
  })
})
