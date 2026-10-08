import { useRole } from '@/auth/RoleContext'
import {
  useAdminDashboard,
  useClinicianDashboard,
  useFrontDeskDashboard,
} from '@/api/hooks/useDashboard'
import { Badge, Card, EmptyState, ErrorState, PageSkeleton } from '@/components/ui'
import { formatDateTime, formatRole } from '@/lib/format'
import { labelize, patientStatusTone, taskStatusTone } from './statusBadge'

function KpiCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </Card>
  )
}

function AdminView() {
  const query = useAdminDashboard(true)
  if (query.isLoading) return <PageSkeleton />
  if (query.isError) {
    return (
      <ErrorState
        message={query.error instanceof Error ? query.error.message : 'Failed to load dashboard'}
        onRetry={() => void query.refetch()}
      />
    )
  }
  if (!query.data) {
    return <EmptyState title="No dashboard data" description="Admin metrics are unavailable." />
  }

  const { kpis, tasksByStatus, recentActivity } = query.data
  const max = Math.max(...tasksByStatus.map((t) => t.count), 1)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active patients" value={kpis.activePatients} hint="Active + scheduled" />
        <KpiCard label="Open tasks" value={kpis.openTasks} />
        <KpiCard label="Pending approvals" value={kpis.pendingApprovals} />
        <KpiCard
          label="Avg completion time"
          value={`${kpis.avgCompletionHours}h`}
          hint="Mock rolling average"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card title="Tasks by status" description="Current mock workload" className="xl:col-span-2">
          <div className="space-y-3">
            {tasksByStatus.map((item) => (
              <div key={item.status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-600">{labelize(item.status)}</span>
                  <span className="font-medium text-slate-900">{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-accent-500"
                    style={{ width: `${(item.count / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent activity" description="Latest workflow events" className="xl:col-span-3">
          {recentActivity.length === 0 ? (
            <EmptyState title="No activity" description="Activity will appear as the demo is used." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentActivity.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {item.actorName}{' '}
                      <span className="font-normal text-slate-500">({formatRole(item.actorRole)})</span>
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {item.action} · {item.target}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-xs text-slate-500">
                    {formatDateTime(item.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

function FrontDeskView() {
  const query = useFrontDeskDashboard(true)
  if (query.isLoading) return <PageSkeleton />
  if (query.isError) {
    return (
      <ErrorState
        message={query.error instanceof Error ? query.error.message : 'Failed to load dashboard'}
        onRetry={() => void query.refetch()}
      />
    )
  }
  if (!query.data) {
    return <EmptyState title="No dashboard data" description="Front desk metrics are unavailable." />
  }

  const { todaySchedule, intakeQueue, myTasks } = query.data

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card title="Today's schedule" description="Clinic appointments" className="xl:col-span-2">
        {todaySchedule.length === 0 ? (
          <EmptyState title="No appointments" description="Nothing scheduled for today." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {todaySchedule.map((item) => (
              <li key={item.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">{item.patientName}</p>
                  <p className="text-sm text-slate-500">
                    {item.type} · {item.clinicianName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">{formatDateTime(item.time)}</span>
                  <Badge tone="info">{labelize(item.status)}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="space-y-6">
        <Card title="Intake queue" description="Packets awaiting desk action">
          {intakeQueue.length === 0 ? (
            <EmptyState title="Queue clear" description="No intake items waiting." />
          ) : (
            <ul className="space-y-3">
              {intakeQueue.map((item) => (
                <li key={item.id} className="rounded-lg border border-slate-100 p-3">
                  <p className="font-medium text-slate-900">{item.patientName}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <Badge tone="warning">{labelize(item.status)}</Badge>
                    <span className="text-xs text-slate-500">{formatDateTime(item.submittedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Tasks assigned to me" description="Front desk workload">
          {myTasks.length === 0 ? (
            <EmptyState title="No tasks" description="You're all caught up." />
          ) : (
            <ul className="space-y-3">
              {myTasks.map((task) => (
                <li key={task.id} className="rounded-lg border border-slate-100 p-3">
                  <p className="text-sm font-medium text-slate-900">{task.title}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge tone={taskStatusTone(task.status)}>{labelize(task.status)}</Badge>
                    <span className="text-xs text-slate-500">Due {formatDateTime(task.dueAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

function ClinicianView() {
  const query = useClinicianDashboard(true)
  if (query.isLoading) return <PageSkeleton />
  if (query.isError) {
    return (
      <ErrorState
        message={query.error instanceof Error ? query.error.message : 'Failed to load dashboard'}
        onRetry={() => void query.refetch()}
      />
    )
  }
  if (!query.data) {
    return <EmptyState title="No dashboard data" description="Clinician metrics are unavailable." />
  }

  const { patientsToday, waitingReview } = query.data

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="My patients today" description="Encounters on your schedule">
        {patientsToday.length === 0 ? (
          <EmptyState title="No patients today" description="Your panel is clear." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {patientsToday.map((patient) => (
              <li key={patient.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-slate-900">{patient.patientName}</p>
                  <p className="text-sm text-slate-500">{patient.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">{formatDateTime(patient.time)}</p>
                  <Badge className="mt-1" tone={patientStatusTone(patient.status)}>
                    {labelize(patient.status)}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Waiting for my review" description="Items needing clinician action">
        {waitingReview.length === 0 ? (
          <EmptyState title="Nothing waiting" description="Review queue is clear for you." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {waitingReview.map((item) => (
              <li key={item.id} className="py-3">
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {item.patientName} · {item.summary}
                </p>
                <p className="mt-1 text-xs text-slate-400">{formatDateTime(item.submittedAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export function DashboardPage() {
  const { role } = useRole()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Role-aware home view for {formatRole(role)}. Data is served from typed MSW contracts.
        </p>
      </div>
      {role === 'admin' ? <AdminView /> : null}
      {role === 'front_desk' ? <FrontDeskView /> : null}
      {role === 'clinician' ? <ClinicianView /> : null}
    </div>
  )
}
