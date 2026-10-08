import type {
  ActivityItem,
  AuditEntry,
  IntakeQueueItem,
  Patient,
  ReviewItem,
  Role,
  ScheduleItem,
  Task,
} from '@/api/contracts'
import { createSeedPatients } from './patients'

function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

function todayAt(hour: number, minute = 0): string {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export interface MockStore {
  patients: Patient[]
  tasks: Task[]
  activity: ActivityItem[]
  schedule: ScheduleItem[]
  intakeQueue: IntakeQueueItem[]
  reviewItems: ReviewItem[]
  auditLog: AuditEntry[]
}

export function createStore(): MockStore {
  const patients = createSeedPatients()

  const tasks: Task[] = [
    {
      id: 'task-1',
      title: 'Verify insurance for Avery Demotron',
      status: 'open',
      assigneeRole: 'front_desk',
      assigneeName: 'Jordan Lee',
      patientName: 'Avery Demotron',
      dueAt: todayAt(15),
      createdAt: isoMinutesAgo(120),
    },
    {
      id: 'task-2',
      title: 'Complete intake packet — Blake Mockwell',
      status: 'in_progress',
      assigneeRole: 'front_desk',
      assigneeName: 'Jordan Lee',
      patientName: 'Blake Mockwell',
      dueAt: todayAt(12),
      createdAt: isoMinutesAgo(200),
    },
    {
      id: 'task-3',
      title: 'Review clinical note for Casey Fakerson',
      status: 'blocked',
      assigneeRole: 'clinician',
      assigneeName: 'Dr. Sam Okonkwo',
      patientName: 'Casey Fakerson',
      dueAt: todayAt(16),
      createdAt: isoMinutesAgo(90),
    },
    {
      id: 'task-4',
      title: 'Approve eligibility exception',
      status: 'open',
      assigneeRole: 'admin',
      assigneeName: 'Alex Rivera',
      patientName: 'Drew Testbury',
      dueAt: todayAt(17),
      createdAt: isoMinutesAgo(45),
    },
    {
      id: 'task-5',
      title: 'Close completed referral workflow',
      status: 'done',
      assigneeRole: 'admin',
      assigneeName: 'Alex Rivera',
      patientName: 'Ellis Sampleton',
      dueAt: todayAt(10),
      createdAt: isoMinutesAgo(400),
    },
    {
      id: 'task-6',
      title: 'Confirm tomorrow appointments',
      status: 'open',
      assigneeRole: 'front_desk',
      assigneeName: 'Jordan Lee',
      dueAt: todayAt(18),
      createdAt: isoMinutesAgo(30),
    },
  ]

  const activity: ActivityItem[] = [
    {
      id: 'act-1',
      actorName: 'Jordan Lee',
      actorRole: 'front_desk',
      action: 'Checked in patient',
      target: 'Finley Placeholder',
      createdAt: isoMinutesAgo(12),
    },
    {
      id: 'act-2',
      actorName: 'Dr. Sam Okonkwo',
      actorRole: 'clinician',
      action: 'Submitted review item',
      target: 'Gray Notreal',
      createdAt: isoMinutesAgo(28),
    },
    {
      id: 'act-3',
      actorName: 'Alex Rivera',
      actorRole: 'admin',
      action: 'Approved eligibility',
      target: 'Harper Simulacrum',
      createdAt: isoMinutesAgo(55),
    },
    {
      id: 'act-4',
      actorName: 'Jordan Lee',
      actorRole: 'front_desk',
      action: 'Started intake',
      target: 'Indigo Pseudonym',
      createdAt: isoMinutesAgo(80),
    },
    {
      id: 'act-5',
      actorName: 'Dr. Mira Chen',
      actorRole: 'clinician',
      action: 'Updated care plan',
      target: 'Jules Exampleman',
      createdAt: isoMinutesAgo(110),
    },
  ]

  const schedule: ScheduleItem[] = [
    {
      id: 'sch-1',
      patientName: 'Kai Dummyworth',
      time: todayAt(9),
      type: 'New patient visit',
      status: 'checked_in',
      clinicianName: 'Dr. Sam Okonkwo',
    },
    {
      id: 'sch-2',
      patientName: 'Lane Fictional',
      time: todayAt(10, 30),
      type: 'Follow-up',
      status: 'arrived',
      clinicianName: 'Dr. Mira Chen',
    },
    {
      id: 'sch-3',
      patientName: 'Morgan Prototype',
      time: todayAt(11, 15),
      type: 'Telehealth',
      status: 'scheduled',
      clinicianName: 'Dr. Luis Alvarez',
    },
    {
      id: 'sch-4',
      patientName: 'Noel Sandbox',
      time: todayAt(13),
      type: 'Annual wellness',
      status: 'scheduled',
      clinicianName: 'Dr. Priya Nair',
    },
    {
      id: 'sch-5',
      patientName: 'Oakley Stubbs',
      time: todayAt(14, 45),
      type: 'Referral consult',
      status: 'no_show',
      clinicianName: 'Dr. Sam Okonkwo',
    },
  ]

  const intakeQueue: IntakeQueueItem[] = [
    {
      id: 'iq-1',
      patientName: 'Parker Wiremock',
      submittedAt: isoMinutesAgo(40),
      status: 'ready',
    },
    {
      id: 'iq-2',
      patientName: 'Quinn Fixture',
      submittedAt: isoMinutesAgo(70),
      status: 'awaiting_forms',
    },
    {
      id: 'iq-3',
      patientName: 'Reese Phantom',
      submittedAt: isoMinutesAgo(95),
      status: 'incomplete',
    },
  ]

  const reviewItems: ReviewItem[] = [
    {
      id: 'rev-1',
      type: 'intake',
      title: 'Intake packet incomplete fields',
      patientName: 'Sage Illusion',
      patientId: patients[18]?.id ?? 'pat-19',
      submittedBy: 'Jordan Lee',
      submittedAt: isoMinutesAgo(60),
      status: 'pending',
      summary: 'Missing emergency contact and preferred pharmacy.',
      details:
        'Front desk flagged that the intake form for Sage Illusion is missing emergency contact details and preferred pharmacy. Patient is scheduled for tomorrow morning.',
    },
    {
      id: 'rev-2',
      type: 'eligibility',
      title: 'Eligibility needs manual review',
      patientName: 'Tatum Demotron',
      patientId: patients[19]?.id ?? 'pat-20',
      submittedBy: 'Jordan Lee',
      submittedAt: isoMinutesAgo(140),
      status: 'pending',
      summary: 'Payer returned needs_review for Contoso Care (Mock).',
      details:
        'Automated eligibility check returned needs_review. Member ID format looks valid but group number could not be matched in the mock payer sandbox.',
    },
    {
      id: 'rev-3',
      type: 'clinical_note',
      title: 'Unsigned progress note',
      patientName: 'Avery Mockwell',
      patientId: patients[0]?.id ?? 'pat-01',
      submittedBy: 'Dr. Mira Chen',
      submittedAt: isoMinutesAgo(200),
      status: 'pending',
      summary: 'Follow-up note awaiting co-signature.',
      details:
        'Progress note from last visit is complete but requires co-signature before closing the encounter workflow.',
    },
    {
      id: 'rev-4',
      type: 'referral',
      title: 'Outbound referral confirmation',
      patientName: 'Blake Fakerson',
      patientId: patients[1]?.id ?? 'pat-02',
      submittedBy: 'Alex Rivera',
      submittedAt: isoMinutesAgo(320),
      status: 'pending',
      summary: 'Specialty referral packet ready for clinician approval.',
      details:
        'Referral packet to Demo Cardiology includes history summary, recent labs (fake), and preferred appointment windows.',
    },
  ]

  const auditLog: AuditEntry[] = [
    {
      id: 'aud-seed-1',
      actorName: 'System',
      actorRole: 'admin',
      action: 'Session started',
      resource: 'Demo',
      details: 'Mock data store initialized for concept demo.',
      createdAt: isoMinutesAgo(1),
    },
  ]

  return {
    patients,
    tasks,
    activity,
    schedule,
    intakeQueue,
    reviewItems,
    auditLog,
  }
}

export const store = createStore()

const ROLE_NAMES: Record<Role, string> = {
  admin: 'Alex Rivera',
  front_desk: 'Jordan Lee',
  clinician: 'Dr. Sam Okonkwo',
}

export function appendAudit(
  role: Role,
  action: string,
  resource: string,
  details: string,
): void {
  store.auditLog.unshift({
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actorName: ROLE_NAMES[role],
    actorRole: role,
    action,
    resource,
    details,
    createdAt: new Date().toISOString(),
  })
}

export function roleFromHeader(request: Request): Role {
  const header = request.headers.get('X-User-Role')
  if (header === 'front_desk' || header === 'clinician' || header === 'admin') {
    return header
  }
  return 'admin'
}
