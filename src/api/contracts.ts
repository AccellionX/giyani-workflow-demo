export type Role = 'admin' | 'front_desk' | 'clinician'

export type PatientStatus =
  | 'active'
  | 'intake'
  | 'pending_review'
  | 'inactive'
  | 'scheduled'

export type TaskStatus = 'open' | 'in_progress' | 'blocked' | 'done'

export type EligibilityResult = 'eligible' | 'not_eligible' | 'needs_review'

export type ReviewItemStatus = 'pending' | 'approved' | 'returned'

export type ReviewItemType =
  | 'intake'
  | 'eligibility'
  | 'clinical_note'
  | 'referral'

export interface Patient {
  id: string
  mrn: string
  firstName: string
  lastName: string
  dateOfBirth: string
  email: string
  phone: string
  status: PatientStatus
  clinicianName: string
  lastVisit: string | null
  nextAppointment: string | null
  insuranceCarrier: string
  createdAt: string
}

export interface PatientListParams {
  search?: string
  status?: PatientStatus | 'all'
  sortBy?: 'name' | 'status' | 'nextAppointment' | 'createdAt'
  sortDir?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface Task {
  id: string
  title: string
  status: TaskStatus
  assigneeRole: Role
  assigneeName: string
  patientName?: string
  dueAt: string
  createdAt: string
}

export interface ActivityItem {
  id: string
  actorName: string
  actorRole: Role
  action: string
  target: string
  createdAt: string
}

export interface ScheduleItem {
  id: string
  patientName: string
  time: string
  type: string
  status: 'checked_in' | 'scheduled' | 'arrived' | 'no_show'
  clinicianName: string
}

export interface IntakeQueueItem {
  id: string
  patientName: string
  submittedAt: string
  status: 'awaiting_forms' | 'ready' | 'incomplete'
}

export interface AdminDashboard {
  kpis: {
    activePatients: number
    openTasks: number
    pendingApprovals: number
    avgCompletionHours: number
  }
  tasksByStatus: Array<{ status: TaskStatus; count: number }>
  recentActivity: ActivityItem[]
}

export interface FrontDeskDashboard {
  todaySchedule: ScheduleItem[]
  intakeQueue: IntakeQueueItem[]
  myTasks: Task[]
}

export interface ClinicianDashboard {
  patientsToday: Array<{
    id: string
    patientName: string
    time: string
    reason: string
    status: PatientStatus
  }>
  waitingReview: ReviewItem[]
}

export interface ReviewItem {
  id: string
  type: ReviewItemType
  title: string
  patientName: string
  patientId: string
  submittedBy: string
  submittedAt: string
  status: ReviewItemStatus
  summary: string
  details: string
  returnNote?: string
}

export interface AuditEntry {
  id: string
  actorName: string
  actorRole: Role
  action: string
  resource: string
  details: string
  createdAt: string
}

export interface IntakeDraft {
  step: number
  patientDetails: {
    firstName: string
    lastName: string
    dateOfBirth: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zip: string
  }
  insurance: {
    carrier: string
    memberId: string
    groupNumber: string
    eligibilityResult: EligibilityResult | null
  }
  appointment: {
    date: string
    time: string
    visitType: string
    clinicianId: string
    notes: string
  }
}

export interface EligibilityCheckRequest {
  carrier: string
  memberId: string
  groupNumber: string
  dateOfBirth: string
}

export interface EligibilityCheckResponse {
  result: EligibilityResult
  message: string
  checkedAt: string
}

export interface IntakeSubmitRequest {
  draft: IntakeDraft
}

export interface IntakeSubmitResponse {
  patientId: string
  reviewItemId: string | null
  message: string
}

export interface ReviewActionRequest {
  note?: string
}

export interface ClinicianOption {
  id: string
  name: string
}

export interface ApiErrorBody {
  message: string
  code?: string
}
