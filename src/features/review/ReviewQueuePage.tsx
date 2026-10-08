import { useState } from 'react'
import type { ReviewItem } from '@/api/contracts'
import { useApproveReview, useReturnReview, useReviewQueue } from '@/api/hooks/useReview'
import { useRole } from '@/auth/RoleContext'
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  ErrorState,
  Input,
  PageSkeleton,
  useToast,
} from '@/components/ui'
import { labelize } from '@/features/dashboard/statusBadge'
import { formatDateTime } from '@/lib/format'

function statusTone(status: ReviewItem['status']) {
  if (status === 'approved') return 'success' as const
  if (status === 'returned') return 'warning' as const
  return 'info' as const
}

export function ReviewQueuePage() {
  const { can } = useRole()
  const canAct = can('act:review')
  const toast = useToast()
  const query = useReviewQueue('all')
  const approveMutation = useApproveReview()
  const returnMutation = useReturnReview()
  const [selected, setSelected] = useState<ReviewItem | null>(null)
  const [returnNote, setReturnNote] = useState('')

  const pending = (query.data ?? []).filter((item) => item.status === 'pending')
  const others = (query.data ?? []).filter((item) => item.status !== 'pending')

  async function handleApprove() {
    if (!selected) return
    try {
      const updated = await approveMutation.mutateAsync(selected.id)
      setSelected(updated)
      toast.push('Review item approved', 'success')
    } catch (error) {
      toast.push(error instanceof Error ? error.message : 'Approve failed', 'error')
    }
  }

  async function handleReturn() {
    if (!selected) return
    if (!returnNote.trim()) {
      toast.push('Add a return note before returning', 'error')
      return
    }
    try {
      const updated = await returnMutation.mutateAsync({
        id: selected.id,
        note: returnNote.trim(),
      })
      setSelected(updated)
      setReturnNote('')
      toast.push('Review item returned', 'info')
    } catch (error) {
      toast.push(error instanceof Error ? error.message : 'Return failed', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Review queue</h1>
        <p className="mt-1 text-sm text-slate-500">
          {canAct
            ? 'Approve or return items with a note.'
            : 'Read-only for Front Desk. Switch to Clinician or Admin to act.'}
        </p>
      </div>

      {query.isLoading ? <PageSkeleton /> : null}
      {query.isError ? (
        <ErrorState
          message={query.error instanceof Error ? query.error.message : 'Failed to load review queue'}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.data ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Pending" description={`${pending.length} awaiting action`}>
            {pending.length === 0 ? (
              <EmptyState title="Queue clear" description="No pending review items." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {pending.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="flex w-full flex-col gap-1 px-1 py-3 text-left hover:bg-slate-50"
                      onClick={() => {
                        setSelected(item)
                        setReturnNote('')
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-900">{item.title}</span>
                        <Badge tone="accent">{labelize(item.type)}</Badge>
                      </div>
                      <span className="text-sm text-slate-500">
                        {item.patientName} · {formatDateTime(item.submittedAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Resolved this session" description={`${others.length} closed items`}>
            {others.length === 0 ? (
              <EmptyState
                title="No resolved items yet"
                description="Approved and returned items appear here."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {others.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="flex w-full flex-col gap-1 px-1 py-3 text-left hover:bg-slate-50"
                      onClick={() => setSelected(item)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-900">{item.title}</span>
                        <Badge tone={statusTone(item.status)}>{labelize(item.status)}</Badge>
                      </div>
                      <span className="text-sm text-slate-500">{item.patientName}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : null}

      <Drawer
        open={Boolean(selected)}
        title="Review details"
        onClose={() => setSelected(null)}
        footer={
          selected && selected.status === 'pending' ? (
            canAct ? (
              <div className="space-y-3">
                <Input
                  label="Return note"
                  value={returnNote}
                  onChange={(event) => setReturnNote(event.target.value)}
                  placeholder="Explain what needs correction"
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    loading={approveMutation.isPending}
                    onClick={() => void handleApprove()}
                  >
                    Approve
                  </Button>
                  <Button
                    className="flex-1"
                    variant="secondary"
                    loading={returnMutation.isPending}
                    onClick={() => void handleReturn()}
                  >
                    Return with note
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Read-only view. Front Desk can inspect items but cannot approve or return.
              </p>
            )
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge tone={statusTone(selected.status)}>{labelize(selected.status)}</Badge>
              <Badge tone="neutral">{labelize(selected.type)}</Badge>
            </div>
            <div>
              <p className="text-slate-500">Patient</p>
              <p className="font-medium text-slate-900">{selected.patientName}</p>
            </div>
            <div>
              <p className="text-slate-500">Submitted by</p>
              <p className="text-slate-900">
                {selected.submittedBy} · {formatDateTime(selected.submittedAt)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Summary</p>
              <p className="text-slate-900">{selected.summary}</p>
            </div>
            <div>
              <p className="text-slate-500">Details</p>
              <p className="text-slate-700 leading-relaxed">{selected.details}</p>
            </div>
            {selected.returnNote ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950">
                <p className="font-medium">Return note</p>
                <p className="mt-1">{selected.returnNote}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
