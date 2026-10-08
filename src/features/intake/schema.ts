import { z } from 'zod'
import type { IntakeDraft } from '@/api/contracts'

export const patientDetailsSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().min(7, 'Phone number is required'),
  address: z.string().trim().min(1, 'Address is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(2, 'State is required').max(2, 'Use 2-letter state code'),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code'),
})

export const insuranceSchema = z.object({
  carrier: z.string().trim().min(1, 'Carrier is required'),
  memberId: z.string().trim().min(3, 'Member ID is required'),
  groupNumber: z.string().trim().min(1, 'Group number is required'),
  eligibilityResult: z
    .enum(['eligible', 'not_eligible', 'needs_review'])
    .nullable()
    .refine((value) => value !== null, {
      message: 'Run the eligibility check before continuing',
    }),
})

export const appointmentSchema = z.object({
  date: z.string().min(1, 'Appointment date is required'),
  time: z.string().min(1, 'Appointment time is required'),
  visitType: z.string().min(1, 'Visit type is required'),
  clinicianId: z.string().min(1, 'Clinician is required'),
  notes: z.string().optional().default(''),
})

export const emptyDraft = (): IntakeDraft => ({
  step: 0,
  patientDetails: {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  },
  insurance: {
    carrier: '',
    memberId: '',
    groupNumber: '',
    eligibilityResult: null,
  },
  appointment: {
    date: '',
    time: '',
    visitType: 'new_patient',
    clinicianId: '',
    notes: '',
  },
})

export const INTAKE_STEPS = [
  { id: 'details', label: 'Patient details' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'review', label: 'Review' },
] as const
