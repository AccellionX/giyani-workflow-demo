import type { PatientStatus, TaskStatus } from '@/api/contracts'

export type BadgeTone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent'

export function patientStatusTone(status: PatientStatus): BadgeTone {
  switch (status) {
    case 'active':
      return 'success'
    case 'scheduled':
      return 'info'
    case 'intake':
      return 'accent'
    case 'pending_review':
      return 'warning'
    case 'inactive':
      return 'neutral'
    default:
      return 'neutral'
  }
}

export function taskStatusTone(status: TaskStatus): BadgeTone {
  switch (status) {
    case 'open':
      return 'info'
    case 'in_progress':
      return 'accent'
    case 'blocked':
      return 'warning'
    case 'done':
      return 'success'
    default:
      return 'neutral'
  }
}

export function labelize(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
