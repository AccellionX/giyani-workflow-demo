import { useMemo, useState } from 'react'
import type { Patient, PatientStatus } from '@/api/contracts'
import { usePatient, usePatients } from '@/api/hooks/usePatients'
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  ErrorState,
  Input,
  PageSkeleton,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { formatDate, formatDateTime } from '@/lib/format'
import { labelize, patientStatusTone } from '@/features/dashboard/statusBadge'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'intake', label: 'Intake' },
  { value: 'pending_review', label: 'Pending review' },
  { value: 'inactive', label: 'Inactive' },
]

type SortBy = 'name' | 'status' | 'nextAppointment' | 'createdAt'

export function PatientsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PatientStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const query = usePatients({
    search,
    status,
    sortBy,
    sortDir,
    page,
    pageSize: 8,
  })
  const detailQuery = usePatient(selectedId)

  const selected = detailQuery.data

  const pageLabel = useMemo(() => {
    if (!query.data) return ''
    return `Page ${query.data.page} of ${query.data.totalPages} · ${query.data.total} patients`
  }, [query.data])

  function toggleSort(next: SortBy) {
    if (sortBy === next) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(next)
      setSortDir('asc')
    }
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Patients</h1>
        <p className="mt-1 text-sm text-slate-500">
          Searchable, filterable list backed by typed `/api/patients` contracts.
        </p>
      </div>

      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <Input
            label="Search"
            placeholder="Name, MRN, or email"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
          <Select
            label="Status"
            value={status}
            options={STATUS_OPTIONS}
            onChange={(event) => {
              setStatus(event.target.value as PatientStatus | 'all')
              setPage(1)
            }}
          />
          <Select
            label="Sort by"
            value={sortBy}
            options={[
              { value: 'name', label: 'Name' },
              { value: 'status', label: 'Status' },
              { value: 'nextAppointment', label: 'Next appointment' },
              { value: 'createdAt', label: 'Created' },
            ]}
            onChange={(event) => {
              setSortBy(event.target.value as SortBy)
              setPage(1)
            }}
          />
        </div>

        {query.isLoading ? <PageSkeleton rows={6} /> : null}
        {query.isError ? (
          <ErrorState
            message={query.error instanceof Error ? query.error.message : 'Failed to load patients'}
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {query.data && query.data.data.length === 0 ? (
          <EmptyState
            title="No patients match"
            description="Try clearing filters or searching a different name."
            actionLabel="Reset filters"
            onAction={() => {
              setSearch('')
              setStatus('all')
              setPage(1)
            }}
          />
        ) : null}
        {query.data && query.data.data.length > 0 ? (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>
                    <button type="button" className="font-medium" onClick={() => toggleSort('name')}>
                      Patient {sortBy === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </button>
                  </TH>
                  <TH>MRN</TH>
                  <TH>
                    <button type="button" className="font-medium" onClick={() => toggleSort('status')}>
                      Status {sortBy === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </button>
                  </TH>
                  <TH>Clinician</TH>
                  <TH>
                    <button
                      type="button"
                      className="font-medium"
                      onClick={() => toggleSort('nextAppointment')}
                    >
                      Next appt {sortBy === 'nextAppointment' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </button>
                  </TH>
                </TR>
              </THead>
              <TBody>
                {query.data.data.map((patient: Patient) => (
                  <TR key={patient.id} onClick={() => setSelectedId(patient.id)}>
                    <TD>
                      <div className="font-medium text-slate-900">
                        {patient.lastName}, {patient.firstName}
                      </div>
                      <div className="text-xs text-slate-500">{patient.email}</div>
                    </TD>
                    <TD>{patient.mrn}</TD>
                    <TD>
                      <Badge tone={patientStatusTone(patient.status)}>
                        {labelize(patient.status)}
                      </Badge>
                    </TD>
                    <TD>{patient.clinicianName}</TD>
                    <TD>{formatDateTime(patient.nextAppointment)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">{pageLabel}</p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= (query.data?.totalPages ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </Card>

      <Drawer
        open={Boolean(selectedId)}
        title="Patient detail"
        onClose={() => setSelectedId(null)}
      >
        {detailQuery.isLoading ? <PageSkeleton rows={5} /> : null}
        {detailQuery.isError ? (
          <ErrorState
            message={
              detailQuery.error instanceof Error
                ? detailQuery.error.message
                : 'Failed to load patient'
            }
            onRetry={() => void detailQuery.refetch()}
          />
        ) : null}
        {selected ? (
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-900">
                {selected.firstName} {selected.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">MRN</dt>
              <dd className="text-slate-900">{selected.mrn}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Status</dt>
              <dd>
                <Badge tone={patientStatusTone(selected.status)}>
                  {labelize(selected.status)}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Date of birth</dt>
              <dd className="text-slate-900">{formatDate(selected.dateOfBirth)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Contact</dt>
              <dd className="text-slate-900">
                {selected.email}
                <br />
                {selected.phone}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Insurance</dt>
              <dd className="text-slate-900">{selected.insuranceCarrier}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Clinician</dt>
              <dd className="text-slate-900">{selected.clinicianName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Last visit</dt>
              <dd className="text-slate-900">{formatDateTime(selected.lastVisit)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Next appointment</dt>
              <dd className="text-slate-900">{formatDateTime(selected.nextAppointment)}</dd>
            </div>
          </dl>
        ) : null}
      </Drawer>
    </div>
  )
}
