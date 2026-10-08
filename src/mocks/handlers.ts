import { delay, http, HttpResponse } from 'msw'
import type {
  AdminDashboard,
  ClinicianDashboard,
  ClinicianOption,
  EligibilityCheckRequest,
  EligibilityCheckResponse,
  EligibilityResult,
  FrontDeskDashboard,
  IntakeSubmitRequest,
  IntakeSubmitResponse,
  PaginatedResponse,
  Patient,
  PatientStatus,
  ReviewActionRequest,
  ReviewItem,
  TaskStatus,
} from '@/api/contracts'
import { appendAudit, roleFromHeader, store } from './data/store'

const API = '/api'

function shouldError(request: Request): boolean {
  return request.headers.get('X-Simulate-Error') === 'true'
}

function errorResponse() {
  return HttpResponse.json(
    {
      message: 'Simulated API error. Turn off “Simulate API error” in the footer to continue.',
      code: 'SIMULATED_ERROR',
    },
    { status: 500 },
  )
}

function parsePage(url: URL): { page: number; pageSize: number } {
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') ?? '10')))
  return { page, pageSize }
}

export const handlers = [
  http.get(`${API}/dashboard/admin`, async ({ request }) => {
    await delay(350)
    if (shouldError(request)) return errorResponse()

    const statusCounts: Record<TaskStatus, number> = {
      open: 0,
      in_progress: 0,
      blocked: 0,
      done: 0,
    }
    store.tasks.forEach((task) => {
      statusCounts[task.status] += 1
    })

    const payload: AdminDashboard = {
      kpis: {
        activePatients: store.patients.filter((p) => p.status === 'active' || p.status === 'scheduled').length,
        openTasks: store.tasks.filter((t) => t.status !== 'done').length,
        pendingApprovals: store.reviewItems.filter((r) => r.status === 'pending').length,
        avgCompletionHours: 4.6,
      },
      tasksByStatus: (Object.keys(statusCounts) as TaskStatus[]).map((status) => ({
        status,
        count: statusCounts[status],
      })),
      recentActivity: store.activity.slice(0, 8),
    }

    return HttpResponse.json(payload)
  }),

  http.get(`${API}/dashboard/front-desk`, async ({ request }) => {
    await delay(350)
    if (shouldError(request)) return errorResponse()

    const payload: FrontDeskDashboard = {
      todaySchedule: store.schedule,
      intakeQueue: store.intakeQueue,
      myTasks: store.tasks.filter((t) => t.assigneeRole === 'front_desk'),
    }
    return HttpResponse.json(payload)
  }),

  http.get(`${API}/dashboard/clinician`, async ({ request }) => {
    await delay(350)
    if (shouldError(request)) return errorResponse()

    const payload: ClinicianDashboard = {
      patientsToday: store.schedule
        .filter((s) => s.clinicianName.includes('Okonkwo') || s.status !== 'no_show')
        .slice(0, 5)
        .map((s, index) => ({
          id: `ctp-${index + 1}`,
          patientName: s.patientName,
          time: s.time,
          reason: s.type,
          status: s.status === 'checked_in' || s.status === 'arrived' ? 'active' : 'scheduled',
        })),
      waitingReview: store.reviewItems.filter((r) => r.status === 'pending'),
    }
    return HttpResponse.json(payload)
  }),

  http.get(`${API}/patients`, async ({ request }) => {
    await delay(400)
    if (shouldError(request)) return errorResponse()

    const url = new URL(request.url)
    const search = (url.searchParams.get('search') ?? '').toLowerCase().trim()
    const status = (url.searchParams.get('status') ?? 'all') as PatientStatus | 'all'
    const sortBy = url.searchParams.get('sortBy') ?? 'name'
    const sortDir = url.searchParams.get('sortDir') ?? 'asc'
    const { page, pageSize } = parsePage(url)

    let filtered = [...store.patients]
    if (search) {
      filtered = filtered.filter((p) => {
        const haystack = `${p.firstName} ${p.lastName} ${p.mrn} ${p.email}`.toLowerCase()
        return haystack.includes(search)
      })
    }
    if (status !== 'all') {
      filtered = filtered.filter((p) => p.status === status)
    }

    filtered.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'status') cmp = a.status.localeCompare(b.status)
      else if (sortBy === 'nextAppointment') {
        cmp = (a.nextAppointment ?? '').localeCompare(b.nextAppointment ?? '')
      } else if (sortBy === 'createdAt') {
        cmp = a.createdAt.localeCompare(b.createdAt)
      } else {
        cmp = `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`)
      }
      return sortDir === 'desc' ? -cmp : cmp
    })

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const start = (page - 1) * pageSize
    const data = filtered.slice(start, start + pageSize)

    const payload: PaginatedResponse<Patient> = {
      data,
      total,
      page,
      pageSize,
      totalPages,
    }
    return HttpResponse.json(payload)
  }),

  http.get(`${API}/patients/:id`, async ({ request, params }) => {
    await delay(250)
    if (shouldError(request)) return errorResponse()
    const patient = store.patients.find((p) => p.id === params.id)
    if (!patient) {
      return HttpResponse.json({ message: 'Patient not found' }, { status: 404 })
    }
    return HttpResponse.json(patient)
  }),

  http.get(`${API}/clinicians`, async ({ request }) => {
    await delay(200)
    if (shouldError(request)) return errorResponse()
    const clinicians: ClinicianOption[] = [
      { id: 'clin-1', name: 'Dr. Sam Okonkwo' },
      { id: 'clin-2', name: 'Dr. Mira Chen' },
      { id: 'clin-3', name: 'Dr. Luis Alvarez' },
      { id: 'clin-4', name: 'Dr. Priya Nair' },
    ]
    return HttpResponse.json(clinicians)
  }),

  http.post(`${API}/intake/eligibility`, async ({ request }) => {
    await delay(1500)
    if (shouldError(request)) return errorResponse()

    const body = (await request.json()) as EligibilityCheckRequest
    const role = roleFromHeader(request)

    let result: EligibilityResult = 'eligible'
    const member = body.memberId.trim().toUpperCase()
    if (member.endsWith('X') || member.includes('DENY')) {
      result = 'not_eligible'
    } else if (member.endsWith('R') || member.includes('REVIEW') || body.groupNumber.trim().length < 3) {
      result = 'needs_review'
    }

    const messages: Record<EligibilityResult, string> = {
      eligible: 'Mock payer confirmed active coverage for this member.',
      not_eligible: 'Mock payer reported inactive or ineligible coverage.',
      needs_review: 'Mock payer could not auto-verify; manual review required.',
    }

    appendAudit(
      role,
      'Eligibility check',
      `${body.carrier} / ${body.memberId}`,
      messages[result],
    )

    const payload: EligibilityCheckResponse = {
      result,
      message: messages[result],
      checkedAt: new Date().toISOString(),
    }
    return HttpResponse.json(payload)
  }),

  http.post(`${API}/intake`, async ({ request }) => {
    await delay(500)
    if (shouldError(request)) return errorResponse()

    const body = (await request.json()) as IntakeSubmitRequest
    const role = roleFromHeader(request)
    const draft = body.draft
    const id = `pat-${String(store.patients.length + 1).padStart(2, '0')}`

    const patient: Patient = {
      id,
      mrn: `MRN-DEMO-${1000 + store.patients.length}`,
      firstName: draft.patientDetails.firstName,
      lastName: draft.patientDetails.lastName,
      dateOfBirth: draft.patientDetails.dateOfBirth,
      email: draft.patientDetails.email,
      phone: draft.patientDetails.phone,
      status:
        draft.insurance.eligibilityResult === 'eligible' ? 'scheduled' : 'pending_review',
      clinicianName:
        [
          { id: 'clin-1', name: 'Dr. Sam Okonkwo' },
          { id: 'clin-2', name: 'Dr. Mira Chen' },
          { id: 'clin-3', name: 'Dr. Luis Alvarez' },
          { id: 'clin-4', name: 'Dr. Priya Nair' },
        ].find((c) => c.id === draft.appointment.clinicianId)?.name ?? 'Dr. Sam Okonkwo',
      lastVisit: null,
      nextAppointment: `${draft.appointment.date}T${draft.appointment.time}:00.000Z`,
      insuranceCarrier: draft.insurance.carrier,
      createdAt: new Date().toISOString(),
    }

    store.patients.unshift(patient)

    let reviewItemId: string | null = null
    if (draft.insurance.eligibilityResult !== 'eligible') {
      reviewItemId = `rev-${Date.now()}`
      const reviewItem: ReviewItem = {
        id: reviewItemId,
        type: 'intake',
        title: 'New intake requires review',
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientId: patient.id,
        submittedBy: role === 'front_desk' ? 'Jordan Lee' : 'Alex Rivera',
        submittedAt: new Date().toISOString(),
        status: 'pending',
        summary: `Eligibility result: ${draft.insurance.eligibilityResult ?? 'unknown'}`,
        details: `Intake submitted for ${patient.firstName} ${patient.lastName}. Appointment requested ${draft.appointment.date} at ${draft.appointment.time}.`,
      }
      store.reviewItems.unshift(reviewItem)
    }

    appendAudit(
      role,
      'Submitted intake',
      `${patient.firstName} ${patient.lastName}`,
      `Created patient ${patient.mrn}`,
    )

    const payload: IntakeSubmitResponse = {
      patientId: patient.id,
      reviewItemId,
      message: 'Intake submitted successfully (mock).',
    }
    return HttpResponse.json(payload, { status: 201 })
  }),

  http.get(`${API}/review`, async ({ request }) => {
    await delay(350)
    if (shouldError(request)) return errorResponse()
    const url = new URL(request.url)
    const status = url.searchParams.get('status') ?? 'pending'
    const items =
      status === 'all'
        ? store.reviewItems
        : store.reviewItems.filter((item) => item.status === status)
    return HttpResponse.json(items)
  }),

  http.get(`${API}/review/:id`, async ({ request, params }) => {
    await delay(200)
    if (shouldError(request)) return errorResponse()
    const item = store.reviewItems.find((r) => r.id === params.id)
    if (!item) {
      return HttpResponse.json({ message: 'Review item not found' }, { status: 404 })
    }
    return HttpResponse.json(item)
  }),

  http.post(`${API}/review/:id/approve`, async ({ request, params }) => {
    await delay(400)
    if (shouldError(request)) return errorResponse()
    const role = roleFromHeader(request)
    if (role === 'front_desk') {
      return HttpResponse.json(
        { message: 'Front Desk cannot approve review items.', code: 'FORBIDDEN' },
        { status: 403 },
      )
    }

    const item = store.reviewItems.find((r) => r.id === params.id)
    if (!item) {
      return HttpResponse.json({ message: 'Review item not found' }, { status: 404 })
    }

    item.status = 'approved'
    appendAudit(role, 'Approved review item', item.title, `Patient: ${item.patientName}`)
    return HttpResponse.json(item)
  }),

  http.post(`${API}/review/:id/return`, async ({ request, params }) => {
    await delay(400)
    if (shouldError(request)) return errorResponse()
    const role = roleFromHeader(request)
    if (role === 'front_desk') {
      return HttpResponse.json(
        { message: 'Front Desk cannot return review items.', code: 'FORBIDDEN' },
        { status: 403 },
      )
    }

    const body = (await request.json()) as ReviewActionRequest
    const item = store.reviewItems.find((r) => r.id === params.id)
    if (!item) {
      return HttpResponse.json({ message: 'Review item not found' }, { status: 404 })
    }

    item.status = 'returned'
    item.returnNote = body.note?.trim() || 'Returned for corrections.'
    appendAudit(
      role,
      'Returned review item',
      item.title,
      item.returnNote,
    )
    return HttpResponse.json(item)
  }),

  http.get(`${API}/audit`, async ({ request }) => {
    await delay(300)
    if (shouldError(request)) return errorResponse()
    return HttpResponse.json(store.auditLog)
  }),
]
