import type { Patient, PatientStatus } from '@/api/contracts'

const FIRST_NAMES = [
  'Avery',
  'Blake',
  'Casey',
  'Drew',
  'Ellis',
  'Finley',
  'Gray',
  'Harper',
  'Indigo',
  'Jules',
  'Kai',
  'Lane',
  'Morgan',
  'Noel',
  'Oakley',
  'Parker',
  'Quinn',
  'Reese',
  'Sage',
  'Tatum',
]

const LAST_NAMES = [
  'Demotron',
  'Mockwell',
  'Fakerson',
  'Testbury',
  'Sampleton',
  'Placeholder',
  'Notreal',
  'Simulacrum',
  'Pseudonym',
  'Exampleman',
  'Dummyworth',
  'Fictional',
  'Prototype',
  'Sandbox',
  'Stubbs',
  'Wiremock',
  'Fixture',
  'Phantom',
  'Illusion',
  'Toyotaishi',
]

const CLINICIANS = [
  'Dr. Sam Okonkwo',
  'Dr. Mira Chen',
  'Dr. Luis Alvarez',
  'Dr. Priya Nair',
]

const CARRIERS = [
  'Northwind Health (Demo)',
  'Contoso Care (Mock)',
  'Fabrikam Mutual (Fake)',
  'Adventure Works PPO (Sample)',
]

const STATUSES: PatientStatus[] = [
  'active',
  'intake',
  'pending_review',
  'inactive',
  'scheduled',
]

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export function createSeedPatients(): Patient[] {
  return Array.from({ length: 40 }, (_, index) => {
    const firstName = FIRST_NAMES[index % FIRST_NAMES.length]
    const lastName = LAST_NAMES[index % LAST_NAMES.length]
    const status = STATUSES[index % STATUSES.length]
    const clinicianName = CLINICIANS[index % CLINICIANS.length]
    const insuranceCarrier = CARRIERS[index % CARRIERS.length]
    const birthYear = 1955 + (index % 45)

    return {
      id: `pat-${pad(index + 1)}`,
      mrn: `MRN-DEMO-${1000 + index}`,
      firstName,
      lastName,
      dateOfBirth: `${birthYear}-${pad((index % 12) + 1)}-${pad((index % 27) + 1)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.invalid`,
      phone: `(555) ${pad(100 + index)}-${pad(2000 + index).slice(-4)}`,
      status,
      clinicianName,
      lastVisit: status === 'intake' ? null : daysAgo(7 + (index % 60)),
      nextAppointment:
        status === 'inactive'
          ? null
          : daysFromNow((index % 14) + 1).replace(/T.*/, `T${pad(9 + (index % 8))}:00:00.000Z`),
      insuranceCarrier,
      createdAt: daysAgo(90 - index),
    }
  })
}
