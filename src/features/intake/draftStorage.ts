import type { IntakeDraft } from '@/api/contracts'
import { emptyDraft } from './schema'

const KEY = 'giyani.intakeDraft'

export function loadIntakeDraft(): IntakeDraft {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyDraft()
    const parsed = JSON.parse(raw) as IntakeDraft
    return {
      ...emptyDraft(),
      ...parsed,
      patientDetails: { ...emptyDraft().patientDetails, ...parsed.patientDetails },
      insurance: { ...emptyDraft().insurance, ...parsed.insurance },
      appointment: { ...emptyDraft().appointment, ...parsed.appointment },
    }
  } catch {
    return emptyDraft()
  }
}

export function saveIntakeDraft(draft: IntakeDraft): void {
  localStorage.setItem(KEY, JSON.stringify(draft))
}

export function clearIntakeDraft(): void {
  localStorage.removeItem(KEY)
}
