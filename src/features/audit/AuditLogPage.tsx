import { useAuditLog } from '@/api/hooks/useAudit'
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  PageSkeleton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { formatDateTime, formatRole } from '@/lib/format'

export function AuditLogPage() {
  const query = useAuditLog()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Audit log</h1>
        <p className="mt-1 text-sm text-slate-500">
          Admin-only trail of actions taken against the mock API during this session.
        </p>
      </div>

      <Card>
        {query.isLoading ? <PageSkeleton rows={6} /> : null}
        {query.isError ? (
          <ErrorState
            message={query.error instanceof Error ? query.error.message : 'Failed to load audit log'}
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {query.data && query.data.length === 0 ? (
          <EmptyState
            title="No audit events"
            description="Actions like intake submit and review approvals will appear here."
          />
        ) : null}
        {query.data && query.data.length > 0 ? (
          <Table>
            <THead>
              <TR>
                <TH>When</TH>
                <TH>Actor</TH>
                <TH>Action</TH>
                <TH>Resource</TH>
                <TH>Details</TH>
              </TR>
            </THead>
            <TBody>
              {query.data.map((entry) => (
                <TR key={entry.id}>
                  <TD className="whitespace-nowrap">{formatDateTime(entry.createdAt)}</TD>
                  <TD>
                    <div className="font-medium text-slate-900">{entry.actorName}</div>
                    <Badge className="mt-1" tone="neutral">
                      {formatRole(entry.actorRole)}
                    </Badge>
                  </TD>
                  <TD>{entry.action}</TD>
                  <TD>{entry.resource}</TD>
                  <TD className="max-w-xs text-slate-500">{entry.details}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : null}
      </Card>
    </div>
  )
}
